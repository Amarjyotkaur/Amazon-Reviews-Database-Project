#!/bin/bash

sudo tee /etc/environment <<EOF
PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games"
MONGO=$MONGOIP
EOF

sudo su hadoop
/opt/spark-3.0.1-bin-hadoop3.2/sbin/start-all.sh &
wait

echo "Running here"
export PATH=$PATH:/opt/hadoop-3.3.0/bin/./
kindleReviewFileName=$(hdfs dfs -stat "%n" /user/hadoop/kindle_reviews/*.parquet)

sudo tee ~/loader.py << EOF
from pyspark.sql import SparkSession
import os
spark = SparkSession.builder.master("com.avg.fury").config("spark.mongodb.input.uri", "mongodb://admin:password@${MONGO}:27017/admin.metadatas?authSource=admin").config("spark.mongodb.output.uri", "mongodb://admin:password@${MONGO}:27017/admin.metadatas?authSource=admin").config('spark.jars.packages', 'org.mongodb.spark:mongo-spark-connector_2.12:3.0.0').config("spark.master", "local").getOrCreate()
df = spark.read.format("mongo").option("uri","mongodb://admin:password@${MONGO}:27017/admin.metadatas?authSource=admin").load()
df.write.save("/user/hadoop/kindle_metaData",format="json",mode="append")

from pyspark.sql.functions import *
import math

# reviews
rawreviewsdf = spark.read.parquet("/user/hadoop/kindle_reviews/${kindleReviewFileName}")
reviewsdf = rawreviewsdf.select("*").withColumn("id", monotonically_increasing_id()).withColumn('review_length', length(rawreviewsdf.reviewText))
reviewsdf.createOrReplaceTempView("reviews")
reviewsdf = spark.sql("select avg(review_length), asin from reviews group by asin")
#reviewsdf.show()

# metadata
rawmetadatadf = spark.read.json("/user/hadoop/kindle_metaData/*")
#rawmetadatadf.show()
metadatadf = rawmetadatadf.select('asin','price')
#metadatadf.show()

# join
df = reviewsdf.join(metadatadf, on=['asin'], how='inner').where(col('price').isNotNull())
df.show()

# calculations
n = df.count()
rdd = df.rdd.map(list)
sumx = rdd.map(lambda x: x[1]).sum()
sumy = rdd.map(lambda x: x[2]).sum()
sumxy = rdd.map(lambda x: x[1] * x[2]).sum()
sumx_sq = rdd.map(lambda x: x[1]**2).sum()
sumy_sq = rdd.map(lambda x: x[2]**2).sum()

pearson_numerator = n*sumxy - sumx*sumy
pearson_denominator = math.sqrt((n*sumx_sq - sumx**2)*(n*sumy_sq - sumy**2))
pearson_coeff = pearson_numerator / pearson_denominator
print(pearson_coeff)
EOF


cd /opt/spark-3.0.1-bin-hadoop3.2/bin/

cat ~/loader.py | ./pyspark --conf "spark.mongodb.input.uri=mongodb://${MONGO}/admin.metadatas?readPreference=primaryPreferred" --conf "spark.mongodb.output.uri=mongodb://${MONGO}/admin.metadatas" --packages org.mongodb.spark:mongo-spark-connector_2.12:3.0.0

# echo "Stopping...."
# /opt/spark-3.0.1-bin-hadoop3.2/sbin/stop-all.sh


# cd /opt/hadoop-3.3.0/bin/
# ./hdfs dfs -ls /user/hadoop/kindle_reviews 

# ./pyspark --conf "spark.mongodb.input.uri=mongodb://34.237.245.166/admin.metadatas?readPreference=primaryPreferred" --conf "spark.mongodb.output.uri=mongodb://34.237.245.166/admin.metadatas" --packages org.mongodb.spark:mongo-spark-connector_2.12:3.0.0


# rawreviewsdf = spark.read.parquet("/user/hadoop/kindle_reviews/2696202c-5e30-48da-ab51-1c3f0be512e0.parquet")
# reviewsdf = rawreviewsdf.select("*").withColumn("id", monotonically_increasing_id()).withColumn('review_length', length(rawreviewsdf.reviewText))
# reviewsdf.show()