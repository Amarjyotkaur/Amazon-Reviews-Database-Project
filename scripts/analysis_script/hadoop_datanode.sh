#!/bin/bash

sudo su hadoop
sudo apt-get install -y openjdk-8-jdk
cd ..
cd hadoop
tar zxvf hadoop-3.3.0.tgz
sudo mv hadoop-3.3.0 /opt/
sudo mkdir -p /mnt/hadoop/datanode/
sudo chown -R hadoop:hadoop /mnt/hadoop/datanode/