---
title: "Introducing Camel-AWS2-Eventbridge component"
date: 2020-10-12
authors: ["oscerd"]
categories: ["Camel"]
preview: "Camel-AWS2 Eventbridge introduction"
---

In Camel 3.6.0 we will introduce the camel-aws2-eventbridge among others new cool components.
The aim of this blog post is showing what you can do with the Eventbridge AWS Service and the related camel component.

### What is AWS Eventbridge?

The definition from the [AWS official website](https://aws.amazon.com/eventbridge/?nc1=h_ls) is the following:

_Amazon EventBridge is a serverless event bus that makes it easy to connect applications together using data from your own applications, integrated Software-as-a-Service (SaaS) applications, and AWS services. EventBridge delivers a stream of real-time data from event sources, such as Zendesk, Datadog, or Pagerduty, and routes that data to targets like AWS Lambda. You can set up routing rules to determine where to send your data to build application architectures that react in real time to all of your data sources._

So basically you can listen for events on your bus, which can be the default event bus (the AWS one) or a custom event bus. The events coming from the bus can be send to AWS services, like an SQS queue, SNS topic or an S3 bucket. Obviously events can trigger actions.

For each event bus, you can set rules: each rule specify a target action to take when EventBridge receives an event that matches the rule. When an event matches the rule, EventBridge sends the event to the specified target and triggers the action defined in the rule.

All of this can be done from AWS Console UI or from code, indifferently.

### What is the component structure?

The AWS2-Eventbridge component act as producer-only component. At the moment of writing the operations you can do are the following:

- putRule
- putTargets
- removeTargets
- deleteRule
- enableRule
- disableRule
- listRules
- describeRule
- listTargetsByRule
- listRuleNamesByTarget

The interesting operations are for sure the putRule and putTargets rule.

I set up a little example in the [camel-examples repository](https://github.com/apache/camel-examples/tree/master/examples/camel-example-main-endpointdsl-aws2), showing what can be done, but we'll talk about this later.

### Eventbridge Rules, Events Pattern and Targets

The important parts of an Eventbridge rule are the event pattern and the targets.

An event in AWS looks in this way:

```json
{
  "version": "0",
  "id": "6a7e8feb-b491-4cf7-a9f1-bf3703467718",
  "detail-type": "EC2 Instance State-change Notification",
  "source": "aws.ec2",
  "account": "111122223333",
  "time": "2017-12-22T18:43:48Z",
  "region": "us-west-1",
  "resources": [
    "arn:aws:ec2:us-west-1:123456789012:instance/ i-1234567890abcdef0"
],
"detail": {
  "instance-id": " i-1234567890abcdef0",
  "state": "terminated"
  }
}
```

This is, for example, an event notifying the state-change of an EC2 instance.

An event pattern is similar to an event. They have the same structure. Event patterns look much like the events they are filtering.

So you can write your own event pattern like this one

```json
{
  "source": [ "aws.ec2" ],
  "detail-type": [ "EC2 Instance State-change Notification" ],
  "detail": {
    "state": [ "terminated" ]
  }
}
```

In this case we want to get a notification of all the EC2 instances termination in our account.

But you can also would like to know when an EC2 is running again for example.

```json
{
  "source": [ "aws.ec2" ],
  "detail-type": [ "EC2 Instance State-change Notification" ],
  "detail": {
    "state": [ "terminated", "running" ]
  }
}
```

Now that we know what kind of events we want, we need to set up targets to be able to consume them.

The request syntax for adding a target to a rule is the following

```json
{
   "EventBusName": "string",
   "Rule": "string",
   "Targets": [ 
      { 
         "Arn": "string",
         "BatchParameters": { 
            "ArrayProperties": { 
               "Size": number
            },
            "JobDefinition": "string",
            "JobName": "string",
            "RetryStrategy": { 
               "Attempts": number
            }
         },
         "DeadLetterConfig": { 
            "Arn": "string"
         },
         "EcsParameters": { 
            "Group": "string",
            "LaunchType": "string",
            "NetworkConfiguration": { 
               "awsvpcConfiguration": { 
                  "AssignPublicIp": "string",
                  "SecurityGroups": [ "string" ],
                  "Subnets": [ "string" ]
               }
            },
            "PlatformVersion": "string",
            "TaskCount": number,
            "TaskDefinitionArn": "string"
         },
         "HttpParameters": { 
            "HeaderParameters": { 
               "string" : "string" 
            },
            "PathParameterValues": [ "string" ],
            "QueryStringParameters": { 
               "string" : "string" 
            }
         },
         "Id": "string",
         "Input": "string",
         "InputPath": "string",
         "InputTransformer": { 
            "InputPathsMap": { 
               "string" : "string" 
            },
            "InputTemplate": "string"
         },
         "KinesisParameters": { 
            "PartitionKeyPath": "string"
         },
         "RedshiftDataParameters": { 
            "Database": "string",
            "DbUser": "string",
            "SecretManagerArn": "string",
            "Sql": "string",
            "StatementName": "string",
            "WithEvent": boolean
         },
         "RetryPolicy": { 
            "MaximumEventAgeInSeconds": number,
            "MaximumRetryAttempts": number
         },
         "RoleArn": "string",
         "RunCommandParameters": { 
            "RunCommandTargets": [ 
               { 
                  "Key": "string",
                  "Values": [ "string" ]
               }
            ]
         },
         "SqsParameters": { 
            "MessageGroupId": "string"
         }
      }
   ]
}
```

As you may see there are many parameters. We just need to set the rule name and add our target.

### Creating a rule through camel

As I said there is a little example in the camel-examples repository based on camel-aws2-eventbridge, camel-aws2-s3 and camel-aws2-sqs.

Creating a rule in Camel is as easy as writing this little snippet.

```java
public class MyRouteBuilder extends EndpointRouteBuilder {

    @Override
    public void configure() throws Exception {

        from(timer("fire").repeatCount("1"))
        .setHeader(EventbridgeConstants.RULE_NAME, constant("s3-events-rule"))
        .to(aws2Eventbridge("default")
        		.operation(EventbridgeOperations.putRule)
        		.eventPatternFile("file:src/main/resources/eventpattern.json"))
        .process(new Processor() {
            @Override
            public void process(Exchange exchange) throws Exception {
                exchange.getIn().setHeader(EventbridgeConstants.RULE_NAME, "s3-events-rule");
                Target target = Target.builder().id("sqs-queue").arn("arn:aws:sqs:eu-west-1:780410022477:camel-connector-test")
                        .build();
                List<Target> targets = new ArrayList<Target>();
                targets.add(target);
                exchange.getIn().setHeader(EventbridgeConstants.TARGETS, targets);
            }
        })
        .to(aws2Eventbridge("default")
        		.operation(EventbridgeOperations.putTargets))
        .log("All set, enjoy!");
    }
}
```

In this route we are creating a single rule, called s3-events-rule, by using an eventpattern.json file. The target of this rule is the `arn:aws:sqs:eu-west-1:780410022477:camel-connector-test` and 
the target Id is `sqs-queue`. This means we are pointing an SQS queue called camel-connector-test.
All of this will be done on the default event bus, which is the AWS event bus.

What we have in the eventpattern.json file:

```json
{
  "source": [
    "aws.s3"
  ],
  "detail": {
    "eventSource": [
      "s3.amazonaws.com"
    ],
    "eventName": [
      "DeleteBucket",
      "DeleteBucketCors",
      "DeleteBucketLifecycle",
      "DeleteBucketPolicy",
      "DeleteBucketReplication",
      "DeleteBucketTagging",
      "DeleteBucketWebsite",
      "CreateBucket",
      "PutBucketAcl",
      "PutBucketCors",
      "PutBucketLifecycle",
      "PutBucketPolicy",
      "PutBucketLogging",
      "PutBucketNotification",
      "PutBucketReplication",
      "PutBucketTagging",
      "PutBucketRequestPayment",
      "PutBucketVersioning",
      "PutBucketWebsite",
      "PutBucketEncryption",
      "DeleteBucketEncryption",
      "DeleteBucketPublicAccessBlock",
      "PutBucketPublicAccessBlock"
    ]
  }
}
```

We want to be informed on the list of events.
The eventpattern json can be built by hand, but also through the AWS console UI, through a series of dropdown menus during the rule creation.

One important note on the usage of AWS Eventbridge is the following: to create a rule that triggers on an action by an AWS service that does not emit events, you can base the rule on API calls made by that service. The API calls are recorded by AWS CloudTrail, so you’ll need to have CloudTrail enabled. In this way you'll be notified anyway.

Through an AWS SQS consumer, we should be able to consume the events coming in from the eventbridge.

```java
public class MyRouteBuilder extends EndpointRouteBuilder {

    @Override
    public void configure() throws Exception {

        from(aws2Sqs("{{sqs-queue-name}}").deleteAfterRead(true))
        .log("${body}");
    }
}
```

The sqs-queue-name is camel-connector-test in this example. The property is defined in an application.properties file. All is well explained in the example anyway.

We can now try to create events to consume. Through the following route:

```java
public class MyRouteBuilder extends EndpointRouteBuilder {

    @Override
    public void configure() throws Exception {

    	from(timer("fire").repeatCount("1"))
    	.setBody(constant("Camel rocks"))
    	.to(aws2S3("{{bucketName}}").keyName("firstfile"));
    }
}
```

In this case the bucketName will be the name of a not already created bucket. In my example I was using camel-bucket-12567. The aws2-s3 has the autocreateBucket option set to true by default, so it will be created during the route execution and the event will be created.

In the terminal of the SQS consumer you should see a CreateBucket event logged.

```
14:08:16.585 [Camel (AWS2-SQS-Consumer) thread #0 - aws2-sqs://camel-connector-test] INFO  route1 - {"version":"0","id":"a79c33f3-fd64-481c-7964-8929b26ac2ae","detail-type":"AWS API Call via CloudTrail","source":"aws.s3","account":"xxxx","time":"2020-10-16T12:08:12Z","region":"eu-west-1","resources":[],"detail":{"eventVersion":"1.05","userIdentity":{"type":"xxx","principalId":"xxx","arn":"arn:xxx","accountId":"xxx","accessKeyId":"xxx"},"eventTime":"2020-10-16T12:08:12Z","eventSource":"s3.amazonaws.com","eventName":"CreateBucket","awsRegion":"eu-west-1","sourceIPAddress":"xxx","userAgent":"[aws-sdk-java/2.15.8 Linux/3.10.0-1127.19.1.el7.x86_64 OpenJDK_64-Bit_Server_VM/25.252-b09 Java/1.8.0_252 vendor/AdoptOpenJDK io/sync http/Apache]","requestParameters":{"CreateBucketConfiguration":{"LocationConstraint":"eu-west-1","xmlns":"http://s3.amazonaws.com/doc/2006-03-01/"},"bucketName":"camel-bucket-12567","Host":"camel-bucket-12567.s3.eu-west-1.amazonaws.com"}
.
.
.
```

You can also try to delete the bucket from the AWS Console too and you should get a message like this one:

```
13:42:55.560 [Camel (AWS2-SQS-Consumer) thread #0 - aws2-sqs://camel-connector-test] INFO  route1 - {"version":"0","id":"f8f289ab-bb8f-65c5-0bf6-a4929333bc4c","detail-type":"AWS API Call via CloudTrail","source":"aws.s3","account":"xxx","time":"2020-10-16T11:42:33Z","region":"eu-west-1","resources":[],"detail":{"eventVersion":"1.05","userIdentity":{"type":"xxx","principalId":"xxx","arn":"arn:xxx","accountId":"xxx","accessKeyId":"xxxx","sessionContext":{"sessionIssuer":{},"webIdFederationData":{}}},"eventTime":"2020-10-16T11:42:33Z","eventSource":"s3.amazonaws.com","eventName":"DeleteBucket","awsRegion":"eu-west-1","sourceIPAddress":"xxxx","userAgent":"[S3Console/0.4, aws-internal/3 aws-sdk-java/1.11.783 Linux/4.9.217-0.3.ac.206.84.332.metal1.x86_64 OpenJDK_64-Bit_Server_VM/25.252-b09 java/1.8.0_252 vendor/Oracle_Corporation]","requestParameters":{"bucketName":"camel-bucket-12567","Host":"s3-eu-west-1.amazonaws.com"},"responseElements":null ...
.
.
.
```

As you may see the userAgent is different in this case.

### Conclusion

This is just a really basic example, but you may have triggered an action on receiving the events, like for example adding a bucketPolicy to the newly created bucket.
AWS Eventbridge is for sure an interesting service. The camel component can be improved by better supporting not only the default event bus of AWS Services but also external buses.
We are working on that and on expanding the AWS services supported at the same time: you're welcome to help!
