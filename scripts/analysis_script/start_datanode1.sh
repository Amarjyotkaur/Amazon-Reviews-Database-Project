#!/bin/bash

echo "Running on $DATANODE1"

if [[ $PHASE -eq 1 ]]
then # Starting
    sudo apt-get update

    sudo adduser hadoop --gecos "" --disabled-password
    sudo usermod -aG sudo hadoop
    sudo tee /etc/hosts <<EOF
127.0.0.1 localhost
$NAMENODEP com.avg.fury    
$DATANODE1P com.avg.ironman
$DATANODE2P com.avg.capt
$DATANODE3P com.avg.hulk

# The following lines are desirable for IPv6 capable hosts
::1 ip6-localhost ip6-loopback
fe00::0 ip6-localnet
ff00::0 ip6-mcastprefix
ff02::1 ip6-allnodes
ff02::2 ip6-allrouters
ff02::3 ip6-allhosts
EOF
    sudo sh -c 'echo "hadoop ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers.d/90-hadoop'
    sudo su - hadoop 
    sudo sysctl vm.swappiness=10
    sudo apt-get install -y ssh
    sudo -H -u hadoop bash -c 'ssh-keygen -t rsa -N "" -f /home/hadoop/.ssh/id_rsa'
elif [[ $PHASE -eq 2 ]]
then
    sudo su - hadoop
    sudo cat .ssh/id_rsa.pub >> .ssh/authorized_keys
else
    echo "Nothing"
fi