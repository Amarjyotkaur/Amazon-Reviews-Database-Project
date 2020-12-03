#!/bin/bash

sudo su hadoop
cd ..
cd hadoop
mkdir download
cd download
sudo apt-get install -y openjdk-8-jdk
mkdir download
wget https://apachemirror.sg.wuchna.com/hadoop/common/hadoop-3.3.0/hadoop-3.3.0.tar.gz
cd ~/download
tar zxvf hadoop-3.3.0.tar.gz
sudo su -c 'sed -i "s/# export JAVA_HOME=.*/export JAVA_HOME=\/usr\/lib\/jvm\/java-8-openjdk-amd64/g" hadoop-3.3.0/etc/hadoop/hadoop-env.sh' hadoop
MASTER=com.avg.fury
WORKERS="com.avg.ironman com.avg.capt com.avg.hulk"
echo -e "<?xml version=\"1.0\"?>
<?xml-stylesheet type=\"text/xsl\" href=\"configuration.xsl\"?>
<\x21-- Put site-specific property overrides in this file. -->
<configuration>
<property>
<name>fs.defaultFS</name>
<value>hdfs://${MASTER}:9000</value>
</property>
</configuration>
" >hadoop-3.3.0/etc/hadoop/core-site.xml

echo -e "<?xml version=\"1.0\"?>
<?xml-stylesheet type=\"text/xsl\" href=\"configuration.xsl\"?>
<\x21-- Put site-specific property overrides in this file. -->
<configuration>
<property>
<name>dfs.replication</name>
<value>3</value>
</property>
<property>
<name>dfs.namenode.name.dir</name>
<value>file:/mnt/hadoop/namenode</value>
</property>
<property>
<name>dfs.datanode.data.dir</name>
<value>file:/mnt/hadoop/datanode</value>
</property>
</configuration>
" >hadoop-3.3.0/etc/hadoop/hdfs-site.xml

echo -e "<?xml version=\"1.0\"?>
<?xml-stylesheet type=\"text/xsl\" href=\"configuration.xsl\"?>
<\x21-- Put site-specific property overrides in this file. -->
<configuration>
<\x21-- Site specific YARN configuration properties -->
<property>
<name>yarn.nodemanager.aux-services</name>
<value>mapreduce_shuffle</value>
<description>Tell NodeManagers that there will be an auxiliary
service called mapreduce.shuffle
that they need to implement
</description>
</property>
<property>
<name>yarn.nodemanager.aux-services.mapreduce_shuffle.class</name>
<value>org.apache.hadoop.mapred.ShuffleHandler</value>
<description>A class name as a means to implement the service
</description>
</property>
<property>
<name>yarn.resourcemanager.hostname</name>
<value>${MASTER}</value>
</property>
</configuration>
" >hadoop-3.3.0/etc/hadoop/yarn-site.xml

echo -e "<?xml version=\"1.0\"?>
<?xml-stylesheet type=\"text/xsl\" href=\"configuration.xsl\"?>
<\x21-- Put site-specific property overrides in this file. -->
<configuration>
<\x21-- Site specific YARN configuration properties -->
<property>
<name>mapreduce.framework.name</name>
<value>yarn</value>
<description>Use yarn to tell MapReduce that it will run as a YARN application
</description>
</property>
<property>
<name>yarn.app.mapreduce.am.env</name>
<value>HADOOP_MAPRED_HOME=/opt/hadoop-3.3.0/</value>
</property>
<property>
<name>mapreduce.map.env</name>
<value>HADOOP_MAPRED_HOME=/opt/hadoop-3.3.0/</value>
</property>
<property>
<name>mapreduce.reduce.env</name>
<value>HADOOP_MAPRED_HOME=/opt/hadoop-3.3.0/</value>
</property>
</configuration>
" >hadoop-3.3.0/etc/hadoop/mapred-site.xml


rm hadoop-3.3.0/etc/hadoop/workers
echo $MASTER
echo $WORKERS
for ip in ${WORKERS}; do echo -e ${ip} >> hadoop-3.3.0/etc/hadoop/workers ; done
# for ip in ${WORKERS}; do echo -e ${ip} >> hadoop-3.3.0/etc/hadoop/workers ; done
tar czvf hadoop-3.3.0.tgz hadoop-3.3.0
echo $WORKERS
for h in $WORKERS ; do
scp -o StrictHostKeyChecking=no hadoop-3.3.0.tgz $h:.;
done;
echo "Moving To Sudo MV HADOOP OPT"
sudo mv hadoop-3.3.0 /opt/

exit
sudo mkdir -p /mnt/hadoop/namenode/hadoop-${USER}
sudo chown -R hadoop:hadoop /mnt/hadoop/namenode
sudo su hadoop
yes Y | /opt/hadoop-3.3.0/bin/hdfs namenode -format
