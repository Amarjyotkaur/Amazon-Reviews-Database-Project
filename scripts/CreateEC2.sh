#!/bin/bash

echo Welcome to AmaNerdBookReview

if [[ $UID != 0 ]]; then
    echo "Please run this script with sudo:"
    echo "sudo $0 $*"
    exit 1
fi

while getopts ":uf" OPTION; do
    case $OPTION in
    u)
        echo Uninstalling All Dependencies
        rm /usr/local/bin/aws
        rm /usr/local/bin/aws_completer
        rm -rf /usr/local/aws-cli
        exit
        ;;
    h)
        echo "-u for uninstall"
        exit
        ;;
    \?)
        echo "Use -h for options"
        exit
        ;;
    esac
done

# if [ "$(uname)" == "Darwin" ]; then
#     # MacOS 
#     echo MacOS Detected, Running AWS CLI Installer
#     curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
#     python get-pip.py
#     curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
#     sudo installer -pkg AWSCLIV2.pkg -target /
#     pip install boto3
# elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
#     # LinuxOS
#     echo Linux Detected, Running AWS CLI Installer
#     curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
#     unzip awscliv2.zip
#     sudo ./aws/install
#     sudo apt-get install install jq
#     sudo apt-get install python3-pip
#     python3 -m pip install boto3
# fi

echo "Configuring AWS-CLI"
sudo /usr/local/bin/aws configure

# Key Commands
# aws --region us-east-1 ec2 describe-key-pairs
# aws ec2 delete-key-pair --key-name my-aws-key

# Generate KeyPair
awsToken=$(grep -n aws_session_token ~/.aws/credentials)
awsToken="${awsToken#*=}"
read -p "Enter AWS Session Token: [$awsToken]:" awsNewToken
if [ "${#awsNewToken}" -ne 0 ]; then
    # For MacOS
    sed -i '' '$d' ~/.aws/credentials
    # For Linux
    # sed -i '$d' ~/.aws/credentials
    echo "aws_session_token=$awsNewToken" >> ~/.aws/credentials
fi
read -p "Enter AWS region for deployment? [us-east-1]:" region
region=${region:-us-east-1}

# Key
echo "Creating New Key..."
read -p "Enter unique key name: " keyName
sudo /usr/local/bin/aws ec2 create-key-pair --key-name $keyName --region $region --output json > keyData.json
cat keyData.json | jq -r ".KeyMaterial" > key.pem
chmod 400 key.pem

# echo "Spinning EC2 Instances"
mv ./ec2_script/cloudformation.json ./ec2_script/temp.json
jq -c --arg keyName "$keyName" -r '.Resources.MongoDB.Properties.KeyName |= $keyName' ./ec2_script/temp.json > ./ec2_script/cloudformation.json
rm ./ec2_script/temp.json
mv ./ec2_script/cloudformation.json ./ec2_script/temp.json
jq -c --arg keyName "$keyName" -r '.Resources.MYSQL.Properties.KeyName |= $keyName' ./ec2_script/temp.json > ./ec2_script/cloudformation.json
rm ./ec2_script/temp.json
mv ./ec2_script/cloudformation.json ./ec2_script/temp.json
jq -c --arg keyName "$keyName" -r '.Resources.WebServer.Properties.KeyName |= $keyName' ./ec2_script/temp.json > ./ec2_script/cloudformation.json
rm ./ec2_script/temp.json
python3 ./ec2_script/createEC2.py
echo "Waiting For Stack to be generated..."

sleep 60s

echo "IP Address Generated..."

# IP1 = MongoIP IP2=MySQLIP IP3=WebServerIP
PUBLIC_IPS=($(python3 ./ec2_script/findOutput.py))

echo Your Mongo Public IP is ${PUBLIC_IPS[0]}
echo Your MySQL Public IP is ${PUBLIC_IPS[1]}
echo Your WebServer Public IP is ${PUBLIC_IPS[2]}

# Configure MongoDB
echo "Setting Up MongoDB"
ssh -o StrictHostKeyChecking=no ubuntu@${PUBLIC_IPS[0]} -i ./key.pem 'bash -s' < ./mongo_script/mongoDB.sh
# FOR TESTING
PUBLIC_IPS1='enterIPhere'
ssh -o StrictHostKeyChecking=no ubuntu@${PUBLIC_IPS1} -i ./key.pem 'bash -s' < ./mongo_script/mongoDB.sh

# # Configure MYSQL
# echo "Setting Up MYSQL"
# ssh -o StrictHostKeyChecking=no ubuntu@${PUBLIC_IPS[1]} -i ./key.pem 'bash -s' < ./mysql_script/mysql.sh
# # FOR TESTING
# PUBLIC_IPS2='enterIPhere'
# ssh -o StrictHostKeyChecking=no ubuntu@${PUBLIC_IPS2} -i ./key.pem 'bash -s' < ./mysql_script/mysql.sh

# # Configure WebServer
# echo "Setting Up WebServer"
# ssh -o StrictHostKeyChecking=no ubuntu@${PUBLIC_IPS[2]} -i ./key.pem 'bash -s' < ./webserver_script/webserver.sh
# # FOR TESTING
# PUBLIC_IPS3='enterIPhere'
# ssh -o StrictHostKeyChecking=no ubuntu@${PUBLIC_IPS3} -i ./key.pem 'bash -s' < ./webserver_script/webserver.sh