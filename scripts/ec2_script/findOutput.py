import boto3
from boto3 import NullHandler
import sys
import time


def main():
    stack_name = "AmaNerdBookReview"
    MongoIP = "0.0.0.0"
    MySQLIP = "0.0.0.0"
    WebServerIP = "0.0.0.0"
    NameNode = "0.0.0.0"
    DataNode1 = "0.0.0.0"
    DataNode2 = "0.0.0.0"
    DataNode3 = "0.0.0.0"
    NameNodeP = "0.0.0.0"
    DataNode1P = "0.0.0.0"
    DataNode2P = "0.0.0.0"
    DataNode3P = "0.0.0.0"

    cloud_formation_client = boto3.client('cloudformation')

    while(True):
        response = cloud_formation_client.describe_stacks(
            StackName=stack_name
        )
        output = response['Stacks'][0]['StackStatus']
        if (output == "CREATE_FAILED"):
            sys.exit(0)
        if (output == "CREATE_COMPLETE"):
            break
        else:
            time.sleep(10)

    output = response['Stacks'][0]['Outputs']

    for i in output:
        for key, value in i.items():
            if(value == "MongoIP"):
                MongoIP = i["OutputValue"]
            if(value == "MySQLIP"):
                MySQLIP = i["OutputValue"]
            if(value == "WebServerIP"):
                WebServerIP = i["OutputValue"]
            if(value == "NameNode"):
                NameNode = i["OutputValue"]
            if(value == "DataNode1"):
                DataNode1 = i["OutputValue"]
            if(value == "DataNode2"):
                DataNode2 = i["OutputValue"]
            if(value == "DataNode3"):
                DataNode3 = i["OutputValue"]
            if(value == "NameNodeP"):
                NameNodeP = i["OutputValue"]
            if(value == "DataNode1P"):
                DataNode1P = i["OutputValue"]
            if(value == "DataNode2P"):
                DataNode2P = i["OutputValue"]  
            if(value == "DataNode3P"):
                DataNode3P = i["OutputValue"]  
            
    print(MongoIP)
    print(MySQLIP)
    print(WebServerIP)
    print(NameNode)
    print(DataNode1)
    print(DataNode2)
    print(DataNode3)
    print(NameNodeP)
    print(DataNode1P)
    print(DataNode2P)
    print(DataNode3P)
    sys.exit(0)


if __name__ == '__main__':
    main()
