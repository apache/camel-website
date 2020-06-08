---
title: "Camel AWS2 Components are here: what are the changes for end users?"
date: 2020-03-06
authors: [oscerd]
categories: ["Apache"]
preview: Camel AWS2 Components are here
---

In Camel 3.2.0 we'll release the complete set of Camel AWS2 components. In Camel 3.1.0 we already have a bunch of AWS2 components living together with the original AWS components.
The aim of this post is giving a full perspective of what will change for the end users and the roadmap for new features.

### New components

Except camel-aws-xray, which is a particular component needing much more work to be migrated, all the original AWS components have been migrated to AWS SDK v2.
The original set of supported components was:

- camel-aws-cw
- camel-aws-ddb
- camel-aws-ec2
- camel-aws-ecs
- camel-aws-eks
- camel-aws-iam
- camel-aws-kinesis
- camel-aws-kms
- camel-aws-lambda
- camel-aws-mq
- camel-aws-msk
- camel-aws-s3
- camel-aws-sdb
- camel-aws-ses
- camel-aws-sns
- camel-aws-sqs
- camel-aws-swf
- camel-aws-translate
- camel-aws-xray

We now have also:

- camel-aws2-cw
- camel-aws2-ddb
- camel-aws2-ec2
- camel-aws2-ecs
- camel-aws2-eks
- camel-aws2-iam
- camel-aws2-kinesis
- camel-aws2-kms
- camel-aws2-lambda
- camel-aws2-mq
- camel-aws2-msk
- camel-aws2-s3
- camel-aws2-ses
- camel-aws2-sns
- camel-aws2-sqs
- camel-aws2-translate

### Moving from v1 to v2

For the end users, nothing will change, except the needed model classes coming from the SDK v2. So migrating should be a matter of changing imports and scheme.
The first effort for the community was being able to obtain features parity between old and new components, and we did that.
The AWS2-S3 components is still under heavy development, but the basic features are still the same.
The Camel community really expects feedback from end users before deprecating the original AWS components. We won't deprecate them until we'll be totally sure the community is totally happy with the AWS2 support.

### Supported Platforms

Actually the AWS2 components are not supported in OSGi containers. We need to work on the needed bundles first but this will be an optional effort and we'll focus on it if there will be real interest from the community. 
Camel Spring Boot starters for AWS2 components are already developed and generated in the [Camel-spring-boot Repository](https://github.com/apache/camel-spring-boot/). There is an ongoing effort for supporting them on Quarkus too, through the [Camel-Quarkus project](https://github.com/apache/camel-quarkus/) and we are creating new examples for the [Camel-kafka-connector project](https://github.com/apache/camel-kafka-connector/).

### Future and roadmap

As already said, our plan is to deprecate the original AWS components, but we'll do this only after the community will confirm the features parity and we'll have enough feedback. So, please, test them and report bugs, improvements and whatever you've in mind while using them.
We are working on more components to add for AWS2 components family, like Athena, RDS, DocumentDB and more. At the same time, we'd like to improve the existing AWS2 components, by supporting the new features coming in the new SDK, like the non-blocking I/O and the ability to plug in a different HTTP implementation at run time (actually we are using only the Apache-client one).
So there is still a lot of work to do and this is a good area for getting started and starting your contributions history to Apache Camel. We're waiting for you!
