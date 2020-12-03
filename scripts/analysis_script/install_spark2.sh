#!/bin/bash

sudo tee /etc/environment <<EOF
PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:/usr/games:/usr/local/games"
MONGO=$MONGOIP
EOF

sudo su hadoop
/opt/spark-3.0.1-bin-hadoop3.2/sbin/start-all.sh &
wait

echo "Running here"
sudo tee ~/loader.py << EOF
from pyspark.sql import SparkSession
spark = SparkSession.builder.master("com.avg.fury").config("spark.mongodb.input.uri", "mongodb://admin:password@{MONGO}:27017/admin.metadatas?authSource=admin").config("spark.mongodb.output.uri", "mongodb://admin:password@${MONGO}:27017/admin.metadatas?authSource=admin").config('spark.jars.packages', 'org.mongodb.spark:mongo-spark-connector_2.12:3.0.0').config("spark.master", "local").getOrCreate()
df = spark.read.format("mongo").option("uri","mongodb://admin:password@34.229.173.176:27017/admin.metadatas?authSource=admin").load()
df.write.save("/user/hadoop/kindle_metaData",format="json",mode="append")
EOF

sudo -H -u hadoop bash -c 'cat ~/loader.py | /opt/spark-3.0.1-bin-hadoop3.2/bin/pyspark --conf "spark.mongodb.input.uri=mongodb://${MONGO}/admin.metadatas?readPreference=primaryPreferred" --conf "spark.mongodb.output.uri=mongodb://${MONGO}/admin.metadatas" --packages org.mongodb.spark:mongo-spark-connector_2.12:3.0.0'

# echo "Stopping...."
# /opt/spark-3.0.1-bin-hadoop3.2/sbin/stop-all.sh