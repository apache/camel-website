---
title: "Camel-AWS-S3 - New Streaming upload feature"
date: 2021-04-20
authors: ["oscerd"]
categories: ["Features", "Camel"]
preview: "AWS S3 Streaming upload"
summary: "The S3 Streaming upload feature will arrive on Camel 3.10.0"
---

In the last weeks I was focused on a particular feature for the Camel AWS S3 component: the streaming upload feature.

In this post I'm going to summarize what it is an how to use it.

## Streaming upload

The AWS S3 component had already a multipart upload feature in his producer operations: the main "problem" with it, was the need of knowing the size of the upload ahead of time. 

The streaming upload feature coming in Camel 3.10.0 won't need to know the size before starting the upload.

### How it works

Obviously this feature has been implemented on the S3 component producer side.

The idea is to continuously send data to the producer and batching the messages. On the endpoint you'll have three possible way of stopping the batching:
- timeout
- buffer size
- batch size

Buffer size and batch size will work together, this means that the batch will be completed when the batch size is complete or when the set buffer size has been excedeed.

With the timeout in the picture the batching will be stopped and the upload completed (also) when the timeout will be reached.

### S3 Files naming

In the streaming upload producer two different naming strategy are provided:
- progressive
- random

The progressive one will add a progressive suffix to the uploaded part, while the random one will add a random id as keyname suffix.

If the S3 key name you'll specify on your endpoint will be "file_upload_part.txt", during the upload you can expect a list like:

- file_upload_part.txt
- file_upload_part-1.txt
- file_upload_part-2.txt

and so on.

The progressive naming strategy will make you ask how does it work when I stop and restart the route?

### Restarting Strategies

The restarting strategies provided in the S3 Streaming upload producer are:

- lastPart
- override

the lastPart strategy will make sense only in combination with the progressive naming strategy, obviously.

At the time of restarting the route, the producer will check for the S3 keyname prefix in the bucket specified and get the last index uploaded.

The index will be used to start again from the same point.

### Sample

This feature is very nice to see in action.

In the [camel-examples repository](https://github.com/apache/camel-examples/tree/master/examples/aws/main-endpointdsl-kafka-aws2-s3-restarting-policy) I added an example of the feature with Kafka as consumer.

The example will poll one kafka topic s3.topic.1 and upload batch of 25 messages (or 1 Mb batch) as single file into an s3 bucket (mycamel-1).

In the [how to run section](https://github.com/apache/camel-examples/tree/master/examples/aws/main-endpointdsl-kafka-aws2-s3-restarting-policy#how-to-run) of the README it is explained well how to ingest data to your Kafka broker.

### Conclusion

The streaming upload feature will be useful in situation where the user don't know the amount of data he wants to upload to S3, but also when he just wants to ingest data continuously without having to care about the size.

There is probably more work to do, but this can be a feature to introduce even in other storage components we have in Apache Camel. 






