#!/bin/bash

echo "Running on DataNodes"

export LC_ALL=C
sudo apt-get update

sudo adduser hadoop --gecos "" --disabled-password
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
sudo su hadoop
sudo sysctl vm.swappiness=10
sudo apt-get install -y ssh
ssh-keygen -t rsa -N "" -f ~/.ssh/id_rsa