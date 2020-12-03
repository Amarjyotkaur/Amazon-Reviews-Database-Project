#!/bin/bash

echo "Removing AmaNerdBookReview..."
sudo apt-get -y install jq

if [ ! -f ./keyData.json ]; then
    echo "keyData.json not found. No EC2 Instance has been spun. Exiting."
    exit
else
    echo "keyData.json found. Removing keys..."
    keyName=$(cat keyData.json | jq '.KeyName' | tr -d '"')
    echo "You have previously used $keyName as a key. Removing from AWS public keypair and deleting local private key pair"
    aws ec2 delete-key-pair --key-name $keyName
    sudo rm key.pem
    sudo rm keyData.json
    echo "Shutting Down and removing AmaNerdBookReview Stack from AWS"
    aws cloudformation delete-stack --stack-name AmaNerdBookReview
    echo "AmaNerdBookReview successfully removed! We are sad to see you go, they say a book a day, keep the Fs away!"
    exit
fi

# Key Commands
# aws --region us-east-1 ec2 describe-key-pairs
# aws ec2 delete-key-pair --key-name my-aws-key

# rm /usr/local/bin/aws
# rm /usr/local/bin/aws_completer
# rm -rf /usr/local/aws-cli
