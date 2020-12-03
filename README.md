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
**Splash Page**\
<img src="./screenshots/splashpage.PNG" width="300" height="200">

**Sign Up Page**\
-- need add img --\
Sign Up Page enables users to sign up with their first name, last name and email. If the user is found to be existing in the database, he/she will be prompted to login instead. 

**Main Page**\
<img src="./screenshots/mainpage.PNG" width="300" height="200">\
Displays books paginated in books of 30 in a single page. Book objects are created in card view and an overlay is applied to each book that displays the the title and a short discription of the book.

**Reviews Page**\
-- need add img --\
Displays book title, summary, description, price, average rating and reviews of the book. Users are able to add a new review to the book. If user has previously added a review to the book, he/she will be disallowed a second review. 

**Add Book/Add review Function**\
-- need add img --\
Pop-up modal that allows users to navigate between adding a new book/review and returning to the main page. Default book image is provided and maximum review of  a book is kept at 5.

**Search Function**\
-- need add img -\
Search function allows users to do an exact search on books in the database for a given asin, title or author.

**Filter Function**\
-- need add img --\
Filter books based on popular filters in the database; users may choose up to all or none.

## FrontEnd

## BackEnd
### Database  
**MongoDB**\
Retrieve Book metadata: 
```
wget -c https://istd50043.s3-ap-southeast-1.amazonaws.com/kindle-reviews.zip -O kindle-reviews.zip
unzip kindle-reviews.zip
rm -rf kindle_reviews.json
```
MongoDB is setup to store books metadata, user details and user sessions. On top of the give books metadata, we ran a webscrape script using beautiful soup to scrape existing books' title and author stored in a csv file. The scrape function was being parallelized to increase throughput. 

Appending the books' title and author directly onto mongoDB would result in it throwing a timeout error. Hence, the new information obtained is appeded to the existing books metadata in json format. Since the metadata file is not a valid json document, ```json.loads()``` would not work, instead ```ast.literal_eval()``` is used to evaluate the input expression. 

To upload the modified data to mongoDB: 
```mongoimport --db admin --collection metadatas --authenticationDatabase admin --username admin --password password --drop --file '/home/ubuntu/meta_Kindle_Store.json' --legacy```

A typical book structure will like this: 
```
-_id: ObjectId
-asin: String 
-categories: Array 
  -0: Array  
    -0: String
-description: String  
-title: String
-related: Object
  -also_viewed: Array 
    -0: String
  -buy_after_viewing: Array 
    -0: String
-imUrl: String
-price: number
``` 

**SQL**\
Retrieve Kindle reviews: 
```
wget -c https://istd50043.s3-ap-southeast-1.amazonaws.com/meta_kindle_store.zip -O meta_kindle_store.zip
unzip meta_kindle_store.zip
rm -rf kindle-reviews.zip meta_kindle_store.zip
```

SQL data is setup to store the books reviews. Uploading the SQL data to the server is fairly straightforward. Firstly, create a database followed by a table with: 
```
create database reviews; create table kindle_reviews (MyUnknownColumn int, asin text, helpful text, overall int, reviewText text, reviewTime text, reviewerID text, reviewerName text, summary text, unixReviewTime int);
```

The datatype for each field is recommended by SQL itself. MyUnknownColumn is not required for this project, you may choose to drop it: 
```
alter table kindle_reviews
drop column MyUnknownColumn;
```

To Upload kindle_reviews: 
```
load data local infile 'kindle_reviews.csv' ignore into table kindle_reviews fields terminated by ',' enclosed by '"' lines terminated by '\n' ignore 1 lines;
```

### APIs
REST APIS of ```GET, POST, UPDATE, DELETE``` are implemented, front-end implements Axios library for making HTTP requests.  

Book APIs 
GET ```/api/book/getallbooks``` - retrieves the last 500 books<br /> 
POST ```/api/book/applyfilter``` - returns books given **filter**<br />  
GET ```/api/book/getbook``` - returns a book given book **asin**<br /> 
POST ```/api/book/addbook``` - adds a new book given **asin, title, description, price, imUrl, author, related, categories**\

Log API<br /> 
POST ```/api/book/addlog/:id``` - adds to log for each returned ```res.status```:<br />  
&nbsp;-```200``` Success + success message<br /> 
&nbsp;-```400``` Syntax Error + error message<br />  
&nbsp;-```404``` Server Error + error message

Reviews APIs\
GET ```/getBookReviews/:id``` -  get book reviews of a particular book given **asin**\
DELETE ```/deleteBookReview```- delete book review given **asin, reviewerID**\
POST ```/addReview``` - add book review given **asin, helpful, overall, reviewText, reviewTime, reviewerID, reviewerName, summary, unixReviewTime**\
POST ```/updateReview``` - update book review given **reviewText, reviewTime, summary, unixReviewTime, asin, reviewerID**

Authentication APIs\
POST ```/api/account/signup``` - creates a new account given **email, firstname, lastName, password**\
POST ```/api/account/signin``` - signs in to existing account given **email, password**\
GET ```/api/account/verify``` - verfies account given **token**\
GET ```/api/account/logout``` - logs out of account given **token**

## Reference
I wish there was a reference. The only reference was the PDF in labs to set up Hadoop || Spark || Sqoop || StackOverFlow

