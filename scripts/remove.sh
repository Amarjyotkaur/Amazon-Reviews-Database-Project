#!/bin/bash

echo "Removing AmaNerdBookReview... =("
sudo apt-get install jq
echo "Removing Key"

if [ ! -f ./keyData.json ]; then
    echo "keyData.json not found. No EC2 Instance has been spun"
    exit
else
    echo "keyData.json found. Removing All keys"
    keyName=$(cat keyData.json | jq '.KeyName' | tr -d '"')
    echo "You have previously used $keyName as a key. Removing from AWS public keypair and deleting local key pair"
    aws ec2 delete-key-pair --key-name $keyName
    sudo rm key.pem
    sudo rm keyData.json
    echo "Shutting Down and deleting all EC2 Instances"
    aws cloudformation delete-stack --stack-name AmaNerdBookReview
    echo "AmaNerdBookReview successfully removed! We are sad to see you go, they say a book a day, keep the Cs away!"
fi

# rm /usr/local/bin/aws
# rm /usr/local/bin/aws_completer
# rm -rf /usr/local/aws-cli