#!/bin/bash

echo "Running on WebServer..."
echo "Setting Up WebServer"
echo "Installing NodeJS"
sudo apt update
sudo apt-get update
sudo apt-get -y install npm
curl -sL https://deb.nodesource.com/setup_14.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "Cloning Repo"
git clone https://github.com/tengfone/AmaNerdBookReview
cd AmaNerdBookReview
npm install

sudo tee /home/ubuntu/AmaNerdBookReview/config/config.js << EOF
module.exports = {
    db: 'mongodb://admin:password@$MONGOIP:27017/admin?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&ssl=false',
    db_dev: 'mongodb://admin:password@$MONGOIP:27017/admin?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&ssl=false',
  };
EOF

sudo tee /home/ubuntu/AmaNerdBookReview/config/dbconfig.js << EOF
module.exports = {
    host: "$MYSQLIP",
    user: "admin",
    password: 'bookreviewer',
    port: 3306,
    database: "reviews"
}
EOF

exit