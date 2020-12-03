# AmaNerdBookReview 📖
##### A Book A Day, Keeps The F's Away
---
## Table of Contents
* [Prerequisites](#Prerequisites)
* [Description](#Description)
* [Setup](#Setup)
  + [FrontEnd & BackEnd](#FrontEnd&BackEnd)
  + [Data Analytics](#DataAnalytics)
* [Preview](#Preview)
* [FrontEnd](#FrontEnd)
* [BackEnd](#BackEnd)
* [Automation](#automation)
  + [Design](#design-1)
  + [Use Flow](#use-flow)
* [Analytics](#Analytics)
  + [Approach](#Approach)
    - [Correlation](#)
    - [TF-IDF](#)
* [Reference](#Reference)
## Prerequisites
- [AWS Account](https://aws.amazon.com/account/) || [AWS EC2 Instance](https://aws.amazon.com/ec2/) || AWS EC2 AMI - `ami-0f82752aa17ff8f5d`

## Description
In this project, you will build a web application for Kindle book reviews, one that is similar to Goodreads. You will start with some public datasets from Amazon, and will design and implement your application around them. The requirements below are intended to be broad and give you freedom to explore alternative design choices. For more info ... https://istd50043.github.io/project

This project we have chosen uses the following technologies:
- [React](https://facebook.github.io/react/) and [React Router](https://reacttraining.com/react-router/) for Frontend
- [Express](http://expressjs.com/) and [Mongoose](http://mongoosejs.com/) for Backend
- [Sass](http://sass-lang.com/) for styles
- [Webpack](https://webpack.github.io/) for compilation
- [Hadoop](https://hadoop.apache.org/) for File System
- [Spark](https://spark.apache.org/) for Analytics
- [Sqoop](https://sqoop.apache.org/) for Data Injestion
- [AWS](https://aws.amazon.com/) for servers
- [AWS Cloudformation](https://aws.amazon.com/cloudformation/) for creation of security group and instances

## Setup
Run this command in the above AMI EC2 Instance: [Will change to public once the term ends (Remove Credientials)]
```bash
git clone https://wontonloodle:'Whatever0)'@github.com/tengfone/AmaNerdBookReview.git
```
Change the directory to scripts folder:
```shell
cd ~/AmaNerdBookReview/scripts/
```
Run ```main.sh``` with ```sudo```:
> Use ```sudo ./main.sh -h``` for Help
> Use ```sudo ./main.sh -i``` for Immediate Installation of FrontEnd + BackEnd
> Use ```sudo ./main.sh -a``` for About
> Use ```sudo ./main.sh -d``` for Analytics installation (Only Run After Getting EC2 Instance IPs from -i)
> Use ```sudo ./main.sh -u``` for Uninstalling

On first launch, it will install ```unzip```,```jq```,```AWS-CLI``` and then prompt you for your AWS Credientials, follow the on-screen instruction. Do take note for any default region, it will be ```us-east-1```. Unique key name can be any user defined name.
```shell
sudo ./main.sh -i
```
![CLI_Setup](./screenshots/cli_setup.jpg)

### FrontEnd & BackEnd
After entering the key name, it will automatically spin up 7 EC2 Instances and 1 Security Group.
![CloudFormation_Template](./screenshots/cloudformation.PNG)

> 1x MongoDB Server
> 1x MySQL Server
> 1x WebServer Server
> 1x NameNode Server
> 3x DataNode Server
> 1x Security Group (TCP Port Access)

The scripts for the MongoDB, MySQL and WebServer will run in parallel for efficient deployment. The total run time is dependent on how fast the CloudFormation spins these 7 + 1 assets. I have pinged the Cloudformation status every 10 seconds to check on the creation of assets. On average, the time taken to deploy the FrontEnd + BackEnd takes about ```7 minutes```.
> [MongoDB](./scripts/mongo_script) -- Download a scrapped version of metadatas with Title and Authors from Google Drive. The scrapped version was ran on a multi-threaded BS4 script. Refer [here](./scripts/webscrape_script/). An admin user was created with a collection called "admin" to store the metadatas
> [MySQL](./scripts/mysql_script) -- Download the original version and store it into the SQL server. An admin user was created with a table of "kindle_reviews"
> [WebServer](./scripts/webserver_script) -- Cloning of GitHub Repo and launching with NodeJS

The output of the web address can be found a little above the Node Deployment at:
![ipAddress](./screenshots/front_end_deployed.jpg)
### Data Analytics
To set up the analytics portions, you will have to **wait till the EC2 instances has been spun up and the data was transferred successfully to both MySQL and MongoDB** (safest bet is to wait till the front end deployment is completed).

Open a new terminal/screen back on the local EC2 instance ***without*** cancelling the ongoing progress and change the directory back to ```~/AmaNerdBookReview/scripts/```
```shell
cd ~/AmaNerdBookReview/scripts/
```
Run the analytics set up:
```shell
sudo ./main.sh -d
```
After hitting enter, the entire process will take an average of ```15 minutes```.
> The analytics scripts can be found [here](./scripts/analysis_script).
> There are 1 NameNode(fury) and 3 DataNodes(hulk,ironman,capt). 
> The setting up of the namenode and datanodes starts off by installing and configuring all the required security settings for SSH and communication between the nodes. All nodes have a super user called ```hadoop``` where it will execute all the commands for file injestion and analytics. Once Hadoop(program) is installed and configured in all the nodes, the script will then install Sqoop for data injestion from the SQL data that was being spun. And finally Spark is installed for the export and analytics for the MongoDB data.


### Uninstall
To uninstall change the directory back to ```~/AmaNerdBookReview/scripts/``` on the local EC2 Instance:
```shell
cd ~/AmaNerdBookReview/scripts/
```
Then run the uninstall command:
```shell
sudo ./main.sh -u
```

After hitting enter, the uninstall process will take an average of ```10 seconds```.

> The removal script can be found [here](./scripts/remove.sh).
> First it installs ```jq``` for detecting of the unique keyName used for the setting up of AmaNerdBookReview
> Then it will proceed to delete both the ***public and private key*** of the unique keyName from the local EC2 machine and AWS servers
> Finally it will delete the ***entire CloudFormation Stack***
> And don't forget, A Book A Day, Keeps The F's Away

## Preview
Splash Page
<img src="./screenshots/splashpage.PNG" width="640" height="512">

Main Page
<img src="./screenshots/mainpage.PNG" width="640" height="512">


## Reference
I wish there was a reference. The only reference was the PDF in labs to set up Hadoop || Spark || Sqoop || StackOverFlow

