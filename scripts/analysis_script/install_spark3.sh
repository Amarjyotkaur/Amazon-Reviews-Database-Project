#!/bin/bash

sudo tee /etc/environment <<EOF
PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games"
MONGO=$MONGOIP
EOF

sudo su hadoop
export LC_ALL=C
export PATH=$PATH:/opt/hadoop-3.3.0/bin/./
sudo apt install -y python-pip
python -m pip install --upgrade pip
pip install --upgrade setuptools
pip install pyspark
sudo apt-get install -y python3-numpy
sudo apt-get install -y python3-pandas

kindleReviewFileName=$(hdfs dfs -stat "%n" /user/hadoop/kindle_reviews/*.parquet)

sudo tee ~/convert.py << EOF
from pyspark.sql import SparkSession
spark = SparkSession.builder.master("local[*]").getOrCreate()
df = spark.read.parquet("kindle_reviews/${kindleReviewFileName}")
df.write.csv("output2")
EOF

# cat ~/convert.py | /opt/spark-3.0.1-bin-hadoop3.2/bin/pyspark
/opt/spark-3.0.1-bin-hadoop3.2/bin/spark-submit --master yarn  ~/convert.py

sudo tee ~/tf.py << EOF
from pyspark import ml
from pyspark.sql import SparkSession
from pyspark.ml.feature import CountVectorizerModel, IDF, Tokenizer, CountVectorizer
from pyspark.sql import types
from pyspark.sql.functions import udf

# map index to word
def mpr(row, vcb):
    d = {}
    array = row.toArray()
    for i in range(len(row)):
        if (array[i] != 0):
            tfidf = array[i]
            word = vcb[i]
            d[word] = tfidf
    return str(d)

def mp(vcb):
    return udf(lambda row: mpr(row, vcb))

# Get file from HDFS
spark = SparkSession.builder.master("local[*]").getOrCreate()
df = spark.read.csv("output2", header=True, sep=",")

# drop rows with null value
df = df.na.drop(subset=["reviewText"])


# convert to words
tkn = Tokenizer(inputCol="reviewText", outputCol="words")
words_dt = tkn.transform(df)

# get frequency of words 
cv = CountVectorizer(inputCol="words", outputCol="rawFeatures", vocabSize=3)
model = cv.fit(words_dt)
featurizedData = model.transform(words_dt)
vcb = model.vocabulary

# Fit the pipeline to traini
idf = IDF(inputCol="rawFeatures", outputCol="features")
tfidf_mdl = idf.fit(featurizedData)
r_dt = tfidf_mdl.transform(featurizedData)

df = r_dt.withColumn("TF_IDF", mp(vcb)(r_dt.features))

output = df.select("asin", "TF_IDF")

output.write.format("csv").save("answer/")
EOF

/opt/spark-3.0.1-bin-hadoop3.2/bin/spark-submit --master yarn  ~/tf.py

# HDFS dfs -cat  <file name> | head -5
