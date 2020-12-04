#!/bin/bash

sudo tee /etc/environment <<EOF
PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games"
MONGO=$MONGOIP
EOF

sudo su hadoop

export PATH=$PATH:/opt/hadoop-3.3.0/bin/./
sudo apt install -y python-pip
pip install --upgrade setuptools
python -m pip install --upgrade pip
pip install pyarrow
pip install pyspark

kindleReviewFileName=$(hdfs dfs -stat "%n" /user/hadoop/kindle_reviews/*.parquet)

sudo tee ~/convert.py << EOF
df = spark.read.parquet("/user/hadoop/kindle_reviews/${kindleReviewFileName}")
df.write.csv("output.csv")
EOF

cat ~/convert.py | ./pyspark --conf "spark.mongodb.input.uri=mongodb://${MONGO}/admin.metadatas?readPreference=primaryPreferred" --conf "spark.mongodb.output.uri=mongodb://${MONGO}/admin.metadatas" --packages org.mongodb.spark:mongo-spark-connector_2.12:3.0.0


sudo tee ~/tf.py << EOF
import os
import time
from pyspark import ml
from pyspark.ml.feature import CountVectorizerModel
from pyspark.sql import SparkSession, utils
from pyspark.sql.functions import udf
from pyspark.sql import types

class Timer(object):
    def __init__(self, name, decimals=1):
        self.name = name
        self.decimals = decimals

    def __enter__(self):
        self.start = time.time()
        print("Start timer:", self.name)
        
    def __exit__(self, type, value, traceback):
        duration = time.time() - self.start
        duration = round(duration, self.decimals)
        print("Ended timer: {}: {} s".format(self.name, duration))

def show_df(df, no_rows_to_show):
    rows = df.take(no_rows_to_show)
    for r in rows:
        print(r)

def load_data(path):
    df = spark.read.option("header", True).csv(path)
    return df

def sparse2dict(vec, idx2word):
    idxs = vec.indices
    vals = vec.values
    vals = vals.round(3)  
    return str({idx2word[i]:v for i,v in zip(idxs, vals)})

def tfidf_review_text(df):
    try: 
        with Timer("TF-IDF for reviewText"):
            df = df.select(["reviewText"]).dropna()

        with Timer("TF-IDF pipeline"):
            tokenizer = ml.feature.Tokenizer(inputCol="reviewText", outputCol="token")
            cv = ml.feature.CountVectorizer(inputCol="token", outputCol="hash")
            idf = ml.feature.IDF(inputCol="hash", outputCol="tfidf")
            pipeline = ml.Pipeline(stages=[tokenizer, cv, idf])
            model = pipeline.fit(df)
            df = model.transform(df)
        stages = model.stages
        vectorizers = [s for s in stages if isinstance(s, CountVectorizerModel)]
        vocab = [v.vocabulary for v in vectorizers]
        vocab = vocab[0]
        idx2word = {idx: word for idx, word in enumerate(vocab)}

        with Timer("Convert TF-IDF sparseVector to (word:value dict)"):
            my_udf_func = udf(lambda vector: sparse2dict(vector, idx2word), types.StringType())
            df = df.select("reviewText", my_udf_func("tfidf").alias("tfidf_final"))
        show_df(df, 10)
    except Exception as e: 
        print("Misalignment")
    return df

if __name__ == "__main__":
    with Timer("Spark script"):
        spark = SparkSession.builder.master("local[*]").getOrCreate()
        print("Running spark_app.py")
        df_reviews = load_data("output.csv")
        df_tfidf = tfidf_review_text(df_reviews)
        df_tfidf.write.format("csv").save("answer/")
EOF

/opt/spark-3.0.1-bin-hadoop3.2/bin/spark-submit --master yarn  ~/tf.py

# hdfs dfs -get /user/hadoop/answer/part-00005-c785e4dd-06e5-4741-a94a-033b88dc14ed-c000.csv ~/
# cat part-00005-c785e4dd-06e5-4741-a94a-033b88dc14ed-c000.csv | head -5