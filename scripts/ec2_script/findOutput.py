import boto3
from boto3 import NullHandler
import sys

def main():
    stack_name = "AmaNerdBookReview"
    outlist = []
    MongoIP = "0.0.0.0"
    MySQLIP = "0.0.0.0"
    WebServerIP = "0.0.0.0"
    
    cloud_formation_client = boto3.client('cloudformation')

    response = cloud_formation_client.describe_stacks(
        StackName=stack_name
    )

    output = response['Stacks'][0]['Outputs']

    for i in output:
        for key,value in i.items():
            if(value == "MongoIP"):
                MongoIP = i["OutputValue"]
                outlist.append(MongoIP)
            if(value == "MySQLIP"):
                MySQLIP = i["OutputValue"]
                outlist.append(MySQLIP)
            if(value == "WebServerIP"):
                WebServerIP = i["OutputValue"]
                outlist.append(WebServerIP)

    print(MongoIP)
    print(MySQLIP)
    print(WebServerIP)
    sys.exit(0)

if __name__ == '__main__':
    main()