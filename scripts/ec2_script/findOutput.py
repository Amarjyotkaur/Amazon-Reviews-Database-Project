import boto3
from boto3 import NullHandler
import sys
import time


def main():
    stack_name = "AmaNerdBookReview"
    outlist = []
    MongoIP = "0.0.0.0"
    MySQLIP = "0.0.0.0"
    WebServerIP = "0.0.0.0"
    NameNode = "0.0.0.0"
    DataNode1 = "0.0.0.0"
    DataNode2 = "0.0.0.0"
    DataNode3 = "0.0.0.0"

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
                outlist.append(MongoIP)
            if(value == "MySQLIP"):
                MySQLIP = i["OutputValue"]
                outlist.append(MySQLIP)
            if(value == "WebServerIP"):
                WebServerIP = i["OutputValue"]
                outlist.append(WebServerIP)
            if(value == "NameNode"):
                NameNode = i["OutputValue"]
                outlist.append(NameNode)
            if(value == "DataNode1"):
                DataNode1 = i["OutputValue"]
                outlist.append(DataNode1)
            if(value == "DataNode1"):
                DataNode1 = i["OutputValue"]
                outlist.append(DataNode1)
            if(value == "DataNode2"):
                DataNode2 = i["OutputValue"]
                outlist.append(DataNode2)
            if(value == "DataNode3"):
                DataNode3 = i["OutputValue"]
                outlist.append(DataNode3)
            

    print(MongoIP)
    print(MySQLIP)
    print(WebServerIP)
    print(NameNode)
    print(DataNode1)
    print(DataNode2)
    print(DataNode3)
    sys.exit(0)


if __name__ == '__main__':
    main()
