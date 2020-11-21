#!/bin/bash

echo "Running on MongoDB Server..."
echo "Setting Up MongoDB"

# # For removing MongoDB
# sudo service mongod stop
# sudo apt-get -y purge mongodb-org*
# sudo rm -r /var/log/mongodb
# sudo rm -r /var/lib/mongodb

sudo apt-get update
sudo apt install libcurl3
sudo apt-get install zip unzip
wget -qO - https://www.mongodb.org/static/pgp/server-4.4.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/4.4 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-4.4.list
sudo apt-get update
sudo apt-get install zip unzip
sudo apt-get install -y mongodb-org
sudo service mongod start
sudo systemctl enable mongod

echo "Downloading datasets..."
wget https://istd50043.github.io/assets/scripts/get_data.sh
chmod +x get_data.sh
./get_data.sh
sleep 3s

echo "Setting Permission Setting on MongoDB"
sudo tee /etc/mongod.conf << EOF
storage:
  dbPath: /var/lib/mongodb
  journal:
    enabled: true
systemLog:
  destination: file
  logAppend: true
  path: /var/log/mongodb/mongod.log
net:
  port: 27017
  bindIp: 0.0.0.0
processManagement:
  timeZoneInfo: /usr/share/zoneinfo
security:
  authorization: enabled
EOF
wget https://raw.githubusercontent.com/tengfone/AmaNerdBookReview/master/scripts/mongo_script/mongo_setup.js
sudo service mongod restart
sleep 3s
mongo < mongo_setup.js
sleep 3s
sudo service mongod restart

echo "Importing Dataset into MongoDB"
mongoimport --db admin --collection metadatas --authenticationDatabase project --username admin --password password --drop --file '/home/ubuntu/meta_Kindle_Store.json' --legacy

echo "MongoDB Setup Completed"