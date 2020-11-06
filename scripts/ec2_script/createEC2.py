import boto3, json
import json

stack_name = 'AmaNerdBookReview'
template_file_location = "./ec2_script/cloudformation.json"

with open(template_file_location, 'r') as content_file:
    content = json.load(content_file)

content = json.dumps(content)

cloud_formation_client = boto3.client('cloudformation')
# print("Creating {}".format(stack_name))
response = cloud_formation_client.create_stack(
    StackName=stack_name,
    TemplateBody=content
)

print(response)