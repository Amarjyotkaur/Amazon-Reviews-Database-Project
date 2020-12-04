#!/bin/bash
echo Welcome to AmaNerdBookReview

if [[ $UID != 0 ]]; then
    echo "Please run this script with sudo:"
    echo "sudo $0 $*"
    exit 1
fi

function installation() {
    if [ "$(uname)" == "Darwin" ]; then
        # MacOS
        echo "MacOS Detected, Running AWS CLI Installer"
        # curl https://bootstrap.pypa.io/get-pip.py -o get-pip.py
        # python get-pip.py
        # curl "https://awscli.amazonaws.com/AWSCLIV2.pkg" -o "AWSCLIV2.pkg"
        # sudo installer -pkg AWSCLIV2.pkg -target /
        # pip install boto3
        sudo rm ~/.aws/config 
        sudo rm ~/.aws/credentials
    elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
        # LinuxOS
        echo Linux Detected, Running AWS CLI Installer
        sudo apt-get update
        sudo apt-get -y install zip unzip
        sudo apt-get -y install jq
        sudo apt-get install -y python3-pip
        export LC_ALL="en_US.UTF-8"
        export LC_CTYPE="en_US.UTF-8"
        python3 -m pip install boto3
        curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
        unzip awscliv2.zip
        sudo ./aws/install
    fi

    echo "Configuring AWS-CLI"

    sudo /usr/local/bin/aws configure

    # Generate KeyPair
    awsToken=$(grep -n aws_session_token ~/.aws/credentials)
    awsToken="${awsToken#*=}"
    read -p "Enter AWS Session Token: [$awsToken]:" awsNewToken
    if [ "${#awsNewToken}" -ne 0 ]; then
        echo "aws_session_token=$awsNewToken" >>~/.aws/credentials
    fi

    read -p "AWS region for deployment? Type in >> [us-east-1]:" region
    region=${region:-us-east-1}

    # Key
    echo "Creating New Key..."
    read -p "Enter unique key name: " keyName

    if [ "$(uname)" == "Darwin" ]; then
        # MacOS
        sudo /usr/local/bin/aws ec2 create-key-pair --key-name $keyName --region $region --output json >keyData.json
    elif [ "$(expr substr $(uname -s) 1 5)" == "Linux" ]; then
        sudo aws ec2 create-key-pair --key-name $keyName --region $region --output json >keyData.json
    fi

    cat keyData.json | jq -r ".KeyMaterial" >key.pem
    chmod 400 key.pem

    mv ./ec2_script/cloudformation.json ./ec2_script/temp.json
    jq -c --arg keyName "$keyName" -r '.Resources.MongoDB.Properties.KeyName |= $keyName' ./ec2_script/temp.json >./ec2_script/cloudformation.json
    rm ./ec2_script/temp.json

    mv ./ec2_script/cloudformation.json ./ec2_script/temp.json
    jq -c --arg keyName "$keyName" -r '.Resources.MYSQL.Properties.KeyName |= $keyName' ./ec2_script/temp.json >./ec2_script/cloudformation.json
    rm ./ec2_script/temp.json

    mv ./ec2_script/cloudformation.json ./ec2_script/temp.json
    jq -c --arg keyName "$keyName" -r '.Resources.WebServer.Properties.KeyName |= $keyName' ./ec2_script/temp.json >./ec2_script/cloudformation.json
    rm ./ec2_script/temp.json

    mv ./ec2_script/cloudformation.json ./ec2_script/temp.json
    jq -c --arg keyName "$keyName" -r '.Resources.NameNode.Properties.KeyName |= $keyName' ./ec2_script/temp.json >./ec2_script/cloudformation.json
    rm ./ec2_script/temp.json

    mv ./ec2_script/cloudformation.json ./ec2_script/temp.json
    jq -c --arg keyName "$keyName" -r '.Resources.DataNode1.Properties.KeyName |= $keyName' ./ec2_script/temp.json >./ec2_script/cloudformation.json
    rm ./ec2_script/temp.json

    mv ./ec2_script/cloudformation.json ./ec2_script/temp.json
    jq -c --arg keyName "$keyName" -r '.Resources.DataNode2.Properties.KeyName |= $keyName' ./ec2_script/temp.json >./ec2_script/cloudformation.json
    rm ./ec2_script/temp.json

    mv ./ec2_script/cloudformation.json ./ec2_script/temp.json
    jq -c --arg keyName "$keyName" -r '.Resources.DataNode3.Properties.KeyName |= $keyName' ./ec2_script/temp.json >./ec2_script/cloudformation.json
    rm ./ec2_script/temp.json

    python3 ./ec2_script/createEC2.py

    echo "Spinning Up EC2 Instances..."
    # IP1 = MongoIP IP2=MySQLIP IP3=WebServerIP
    PUBLIC_IPS=($(python3 ./ec2_script/findOutput.py))

    echo Your Mongo Public IP is ${PUBLIC_IPS[0]}
    echo Your MySQL Public IP is ${PUBLIC_IPS[1]}
    echo Your WebServer Public IP is ${PUBLIC_IPS[2]}
    echo Your NameNode Public IP is ${PUBLIC_IPS[3]}
    echo Your DataNode1 Public IP is ${PUBLIC_IPS[4]}
    echo Your DataNode2 Public IP is ${PUBLIC_IPS[5]}
    echo Your DataNode3 Public IP is ${PUBLIC_IPS[6]}

    # Configure MongoDB
    echo "Setting Up MongoDB" &
    ssh -o StrictHostKeyChecking=no ubuntu@${PUBLIC_IPS[0]} -i ./key.pem 'bash -s' <./mongo_script/mongoDB.sh &

    # Configure MYSQL
    echo "Setting Up MYSQL" &
    ssh -o StrictHostKeyChecking=no ubuntu@${PUBLIC_IPS[1]} -i ./key.pem 'bash -s' <./mysql_script/mysql.sh &

    # Configure WebServer
    echo "Setting Up WebServer" &
    ssh -o StrictHostKeyChecking=no ubuntu@${PUBLIC_IPS[2]} -i ./key.pem 'MONGOIP='${PUBLIC_IPS[0]}' MYSQLIP='${PUBLIC_IPS[1]}' WEBSERVERIP='${PUBLIC_IPS[2]}' bash -s' <./webserver_script/webserver.sh &

    wait
    sleep 1s
    ssh -o StrictHostKeyChecking=no ubuntu@${PUBLIC_IPS[2]} -i ./key.pem 'MONGOIP='${PUBLIC_IPS[0]}' MYSQLIP='${PUBLIC_IPS[1]}' WEBSERVERIP='${PUBLIC_IPS[2]}' bash -s' <./webserver_script/startserver.sh
}

function analysis() {
    PUBLIC_IPS=($(python3 ./ec2_script/findOutput.py))
    echo Your Mongo Public IP is ${PUBLIC_IPS[0]}
    echo Your MySQL Public IP is ${PUBLIC_IPS[1]}
    echo Your WebServer Public IP is ${PUBLIC_IPS[2]}
    echo Your NameNode Public IP is ${PUBLIC_IPS[3]}
    echo Your DataNode1 Public IP is ${PUBLIC_IPS[4]}
    echo Your DataNode2 Public IP is ${PUBLIC_IPS[5]}
    echo Your DataNode3 Public IP is ${PUBLIC_IPS[6]}
    echo Your NameNodeP Public IP is ${PUBLIC_IPS[7]}
    echo Your DataNode1P Public IP is ${PUBLIC_IPS[8]}
    echo Your DataNode2P Public IP is ${PUBLIC_IPS[9]}
    echo Your DataNode3P Public IP is ${PUBLIC_IPS[10]}

    # Configure Analysis

    # Configure Hadoop User
    echo "Setting Up NameNode"
    ssh -o StrictHostKeyChecking=no ubuntu@${PUBLIC_IPS[3]} -i ./key.pem 'MONGOIP='${PUBLIC_IPS[0]}' MYSQLIP='${PUBLIC_IPS[1]}' WEBSERVERIP='${PUBLIC_IPS[2]}' NAMENODE='${PUBLIC_IPS[3]}' DATANODE1='${PUBLIC_IPS[4]}' DATANODE2='${PUBLIC_IPS[5]}' DATANODE3='${PUBLIC_IPS[6]}' NAMENODEP='${PUBLIC_IPS[7]}' DATANODE1P='${PUBLIC_IPS[8]}' DATANODE2P='${PUBLIC_IPS[9]}' DATANODE3P='${PUBLIC_IPS[10]}' bash -s' <./analysis_script/start_namenode.sh
    echo "Setting Up DataNode1"
    ssh -o StrictHostKeyChecking=no ubuntu@${PUBLIC_IPS[4]} -i ./key.pem 'MONGOIP='${PUBLIC_IPS[0]}' MYSQLIP='${PUBLIC_IPS[1]}' WEBSERVERIP='${PUBLIC_IPS[2]}' NAMENODE='${PUBLIC_IPS[3]}' DATANODE1='${PUBLIC_IPS[4]}' DATANODE2='${PUBLIC_IPS[5]}' DATANODE3='${PUBLIC_IPS[6]}' NAMENODEP='${PUBLIC_IPS[7]}' DATANODE1P='${PUBLIC_IPS[8]}' DATANODE2P='${PUBLIC_IPS[9]}' DATANODE3P='${PUBLIC_IPS[10]}' bash -s' <./analysis_script/start_datanode.sh &
    echo "Setting Up DataNode2"
    ssh -o StrictHostKeyChecking=no ubuntu@${PUBLIC_IPS[5]} -i ./key.pem 'MONGOIP='${PUBLIC_IPS[0]}' MYSQLIP='${PUBLIC_IPS[1]}' WEBSERVERIP='${PUBLIC_IPS[2]}' NAMENODE='${PUBLIC_IPS[3]}' DATANODE1='${PUBLIC_IPS[4]}' DATANODE2='${PUBLIC_IPS[5]}' DATANODE3='${PUBLIC_IPS[6]}' NAMENODEP='${PUBLIC_IPS[7]}' DATANODE1P='${PUBLIC_IPS[8]}' DATANODE2P='${PUBLIC_IPS[9]}' DATANODE3P='${PUBLIC_IPS[10]}' bash -s' <./analysis_script/start_datanode.sh &
    echo "Setting Up DataNode3"
    ssh -o StrictHostKeyChecking=no ubuntu@${PUBLIC_IPS[6]} -i ./key.pem 'MONGOIP='${PUBLIC_IPS[0]}' MYSQLIP='${PUBLIC_IPS[1]}' WEBSERVERIP='${PUBLIC_IPS[2]}' NAMENODE='${PUBLIC_IPS[3]}' DATANODE1='${PUBLIC_IPS[4]}' DATANODE2='${PUBLIC_IPS[5]}' DATANODE3='${PUBLIC_IPS[6]}' NAMENODEP='${PUBLIC_IPS[7]}' DATANODE1P='${PUBLIC_IPS[8]}' DATANODE2P='${PUBLIC_IPS[9]}' DATANODE3P='${PUBLIC_IPS[10]}' bash -s' <./analysis_script/start_datanode.sh &
    
    # ## Authorizing SSH
    # echo "Setting Up NameNode"
    wait
    ssh ubuntu@${PUBLIC_IPS[3]} -i ./key.pem "sudo cat /home/hadoop/.ssh/id_rsa.pub" | ssh ubuntu@${PUBLIC_IPS[3]} -i ./key.pem "sudo cat - | sudo tee -a /home/hadoop/.ssh/authorized_keys"
    ssh ubuntu@${PUBLIC_IPS[3]} -i ./key.pem "sudo cat /home/hadoop/.ssh/id_rsa.pub" | ssh ubuntu@${PUBLIC_IPS[4]} -i ./key.pem "sudo cat - | sudo tee -a /home/hadoop/.ssh/authorized_keys"
    ssh ubuntu@${PUBLIC_IPS[3]} -i ./key.pem "sudo cat /home/hadoop/.ssh/id_rsa.pub" | ssh ubuntu@${PUBLIC_IPS[5]} -i ./key.pem "sudo cat - | sudo tee -a /home/hadoop/.ssh/authorized_keys"
    ssh ubuntu@${PUBLIC_IPS[3]} -i ./key.pem "sudo cat /home/hadoop/.ssh/id_rsa.pub" | ssh ubuntu@${PUBLIC_IPS[6]} -i ./key.pem "sudo cat - | sudo tee -a /home/hadoop/.ssh/authorized_keys"

    ## Configure Hadoop User
    ssh -o StrictHostKeyChecking=no ubuntu@${PUBLIC_IPS[3]} -i ./key.pem 'MONGOIP='${PUBLIC_IPS[0]}' MYSQLIP='${PUBLIC_IPS[1]}' WEBSERVERIP='${PUBLIC_IPS[2]}' NAMENODE='${PUBLIC_IPS[3]}' DATANODE1='${PUBLIC_IPS[4]}' DATANODE2='${PUBLIC_IPS[5]}' DATANODE3='${PUBLIC_IPS[6]}' NAMENODEP='${PUBLIC_IPS[7]}' DATANODE1P='${PUBLIC_IPS[8]}' DATANODE2P='${PUBLIC_IPS[9]}' DATANODE3P='${PUBLIC_IPS[10]}' bash -s' <./analysis_script/hadoop_namenode.sh
    ssh -o StrictHostKeyChecking=no ubuntu@${PUBLIC_IPS[4]} -i ./key.pem 'MONGOIP='${PUBLIC_IPS[0]}' MYSQLIP='${PUBLIC_IPS[1]}' WEBSERVERIP='${PUBLIC_IPS[2]}' NAMENODE='${PUBLIC_IPS[3]}' DATANODE1='${PUBLIC_IPS[4]}' DATANODE2='${PUBLIC_IPS[5]}' DATANODE3='${PUBLIC_IPS[6]}' NAMENODEP='${PUBLIC_IPS[7]}' DATANODE1P='${PUBLIC_IPS[8]}' DATANODE2P='${PUBLIC_IPS[9]}' DATANODE3P='${PUBLIC_IPS[10]}' bash -s' <./analysis_script/hadoop_datanode.sh &
    ssh -o StrictHostKeyChecking=no ubuntu@${PUBLIC_IPS[5]} -i ./key.pem 'MONGOIP='${PUBLIC_IPS[0]}' MYSQLIP='${PUBLIC_IPS[1]}' WEBSERVERIP='${PUBLIC_IPS[2]}' NAMENODE='${PUBLIC_IPS[3]}' DATANODE1='${PUBLIC_IPS[4]}' DATANODE2='${PUBLIC_IPS[5]}' DATANODE3='${PUBLIC_IPS[6]}' NAMENODEP='${PUBLIC_IPS[7]}' DATANODE1P='${PUBLIC_IPS[8]}' DATANODE2P='${PUBLIC_IPS[9]}' DATANODE3P='${PUBLIC_IPS[10]}' bash -s' <./analysis_script/hadoop_datanode.sh &
    ssh -o StrictHostKeyChecking=no ubuntu@${PUBLIC_IPS[6]} -i ./key.pem 'MONGOIP='${PUBLIC_IPS[0]}' MYSQLIP='${PUBLIC_IPS[1]}' WEBSERVERIP='${PUBLIC_IPS[2]}' NAMENODE='${PUBLIC_IPS[3]}' DATANODE1='${PUBLIC_IPS[4]}' DATANODE2='${PUBLIC_IPS[5]}' DATANODE3='${PUBLIC_IPS[6]}' NAMENODEP='${PUBLIC_IPS[7]}' DATANODE1P='${PUBLIC_IPS[8]}' DATANODE2P='${PUBLIC_IPS[9]}' DATANODE3P='${PUBLIC_IPS[10]}' bash -s' <./analysis_script/hadoop_datanode.sh &
    wait

    # Start Hadoop From NameNode
    ssh -o StrictHostKeyChecking=no ubuntu@${PUBLIC_IPS[3]} -i ./key.pem 'MONGOIP='${PUBLIC_IPS[0]}' MYSQLIP='${PUBLIC_IPS[1]}' WEBSERVERIP='${PUBLIC_IPS[2]}' NAMENODE='${PUBLIC_IPS[3]}' DATANODE1='${PUBLIC_IPS[4]}' DATANODE2='${PUBLIC_IPS[5]}' DATANODE3='${PUBLIC_IPS[6]}' NAMENODEP='${PUBLIC_IPS[7]}' DATANODE1P='${PUBLIC_IPS[8]}' DATANODE2P='${PUBLIC_IPS[9]}' DATANODE3P='${PUBLIC_IPS[10]}' bash -s' <./analysis_script/launch_hadoop.sh

    # Install SQOOP
    ssh -o StrictHostKeyChecking=no ubuntu@${PUBLIC_IPS[3]} -i ./key.pem 'MONGOIP='${PUBLIC_IPS[0]}' MYSQLIP='${PUBLIC_IPS[1]}' WEBSERVERIP='${PUBLIC_IPS[2]}' NAMENODE='${PUBLIC_IPS[3]}' DATANODE1='${PUBLIC_IPS[4]}' DATANODE2='${PUBLIC_IPS[5]}' DATANODE3='${PUBLIC_IPS[6]}' NAMENODEP='${PUBLIC_IPS[7]}' DATANODE1P='${PUBLIC_IPS[8]}' DATANODE2P='${PUBLIC_IPS[9]}' DATANODE3P='${PUBLIC_IPS[10]}' bash -s' <./analysis_script/install_sqoop.sh

    # Install Spark
    ssh -o StrictHostKeyChecking=no ubuntu@${PUBLIC_IPS[3]} -i ./key.pem 'MONGOIP='${PUBLIC_IPS[0]}' MYSQLIP='${PUBLIC_IPS[1]}' WEBSERVERIP='${PUBLIC_IPS[2]}' NAMENODE='${PUBLIC_IPS[3]}' DATANODE1='${PUBLIC_IPS[4]}' DATANODE2='${PUBLIC_IPS[5]}' DATANODE3='${PUBLIC_IPS[6]}' NAMENODEP='${PUBLIC_IPS[7]}' DATANODE1P='${PUBLIC_IPS[8]}' DATANODE2P='${PUBLIC_IPS[9]}' DATANODE3P='${PUBLIC_IPS[10]}' bash -s' <./analysis_script/install_spark.sh
    ssh -o StrictHostKeyChecking=no ubuntu@${PUBLIC_IPS[4]} -i ./key.pem 'MONGOIP='${PUBLIC_IPS[0]}' MYSQLIP='${PUBLIC_IPS[1]}' WEBSERVERIP='${PUBLIC_IPS[2]}' NAMENODE='${PUBLIC_IPS[3]}' DATANODE1='${PUBLIC_IPS[4]}' DATANODE2='${PUBLIC_IPS[5]}' DATANODE3='${PUBLIC_IPS[6]}' NAMENODEP='${PUBLIC_IPS[7]}' DATANODE1P='${PUBLIC_IPS[8]}' DATANODE2P='${PUBLIC_IPS[9]}' DATANODE3P='${PUBLIC_IPS[10]}' bash -s' <./analysis_script/install_dataSpark.sh &
    ssh -o StrictHostKeyChecking=no ubuntu@${PUBLIC_IPS[5]} -i ./key.pem 'MONGOIP='${PUBLIC_IPS[0]}' MYSQLIP='${PUBLIC_IPS[1]}' WEBSERVERIP='${PUBLIC_IPS[2]}' NAMENODE='${PUBLIC_IPS[3]}' DATANODE1='${PUBLIC_IPS[4]}' DATANODE2='${PUBLIC_IPS[5]}' DATANODE3='${PUBLIC_IPS[6]}' NAMENODEP='${PUBLIC_IPS[7]}' DATANODE1P='${PUBLIC_IPS[8]}' DATANODE2P='${PUBLIC_IPS[9]}' DATANODE3P='${PUBLIC_IPS[10]}' bash -s' <./analysis_script/install_dataSpark.sh &
    ssh -o StrictHostKeyChecking=no ubuntu@${PUBLIC_IPS[6]} -i ./key.pem 'MONGOIP='${PUBLIC_IPS[0]}' MYSQLIP='${PUBLIC_IPS[1]}' WEBSERVERIP='${PUBLIC_IPS[2]}' NAMENODE='${PUBLIC_IPS[3]}' DATANODE1='${PUBLIC_IPS[4]}' DATANODE2='${PUBLIC_IPS[5]}' DATANODE3='${PUBLIC_IPS[6]}' NAMENODEP='${PUBLIC_IPS[7]}' DATANODE1P='${PUBLIC_IPS[8]}' DATANODE2P='${PUBLIC_IPS[9]}' DATANODE3P='${PUBLIC_IPS[10]}' bash -s' <./analysis_script/install_dataSpark.sh &
    wait
    # # Start Spark
    ssh -o StrictHostKeyChecking=no ubuntu@${PUBLIC_IPS[3]} -i ./key.pem 'MONGOIP='${PUBLIC_IPS[0]}' MYSQLIP='${PUBLIC_IPS[1]}' WEBSERVERIP='${PUBLIC_IPS[2]}' NAMENODE='${PUBLIC_IPS[3]}' DATANODE1='${PUBLIC_IPS[4]}' DATANODE2='${PUBLIC_IPS[5]}' DATANODE3='${PUBLIC_IPS[6]}' NAMENODEP='${PUBLIC_IPS[7]}' DATANODE1P='${PUBLIC_IPS[8]}' DATANODE2P='${PUBLIC_IPS[9]}' DATANODE3P='${PUBLIC_IPS[10]}' bash -s' <./analysis_script/install_spark2.sh
    ssh -o StrictHostKeyChecking=no ubuntu@${PUBLIC_IPS[3]} -i ./key.pem 'MONGOIP='${PUBLIC_IPS[0]}' MYSQLIP='${PUBLIC_IPS[1]}' WEBSERVERIP='${PUBLIC_IPS[2]}' NAMENODE='${PUBLIC_IPS[3]}' DATANODE1='${PUBLIC_IPS[4]}' DATANODE2='${PUBLIC_IPS[5]}' DATANODE3='${PUBLIC_IPS[6]}' NAMENODEP='${PUBLIC_IPS[7]}' DATANODE1P='${PUBLIC_IPS[8]}' DATANODE2P='${PUBLIC_IPS[9]}' DATANODE3P='${PUBLIC_IPS[10]}' bash -s' <./analysis_script/install_spark3.sh
}

while getopts ":auhid" OPTION; do
    case ${OPTION} in
    a)
        echo "Visit GitHub Page: https://github.com/tengfone/AmaNerdBookReview"
        exit
        ;;
    u)
        sudo chmod +x remove.sh
        ./remove.sh
        exit
        ;;
    h)
        echo "-i to install"
        echo "-u for uninstall"
        echo "-a for about"
        exit
        ;;
    i)
        echo "Starting..."
        installation
        exit
        ;;
    d)
        echo "Setting up analytics system:"
        analysis
        exit
        ;;
    \?)
        echo "Unknown Command, use -h for help"
        exit
        ;;
    esac
done

echo "-i to install immediately"
echo "-u for uninstall"
echo "-h for help"
echo "-d for analytics"
echo "Installation will run in 10seconds..."
sleep 10s
installation

exit
