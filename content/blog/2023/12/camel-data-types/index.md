---
title: "Camel 4 Data Types"
date: 2023-12-04
draft: false
authors: [christophd]
categories: ["Howtos", "Transformation"]
preview: "Boosting the interoperability of Camel routes and Kamelets with data type transformations"
---

Since Camel 4, users are able to apply data types to their individual Camel routes in order to transform the processed message content in a declarative way.
The data type functionality has been added on top of the well-known [Transformer EIP](/manual/transformer.html) that is a part of Apache Camel since the beginning.

This post gives a short introduction to the concept of data types and continues with several examples that show how to use those data types in Camel for instance as a form of Camel route contracts.
The post closes with the usage of data types in Pipe definitions to specify the input/output behavior of Kamelets.

# How to use data types

With the Camel version 4, users can now declare data types and do the following data type specific transformations in a route:

```java
public class DemoRoute extends EndpointRouteBuilder {
    @Override
    public void configure() throws Exception {
        transformer().name("base64") // (1)
                .withDataFormat(dataFormat().base64().end());
        DataType base64 = new DataType("base64"); // (2)


        from(timer("tick"))
                .setBody()
                .constant("Camel rocks!")
                .transform(base64) // (3)
                .to(log("info"));
    }
}
```

1. Transformer declaration with a name and an implementation (e.g. data format based, endpoint uri based, custom Java class, …)
2. Data Type declaration matching a transformer name
3. Transform EIP using the Data Type

The example route above forms a simple timer-to-log route with a constant plain text message body saying _"Camel rocks!"_.

The route also declares a new DataType named _"base64"_ in combination with a respective transformer implementation that uses the existing Apache Camel _base64_ data format.
Users of the transformer EIP can now use the data type as a target type in order to transform the message content to base64 encoding.

This example should give you a good first impression on how to use data types in Camel.
The next section adds custom data types to the picture.

# Custom data types

The previous example has been using an existing Camel data format implementation to perform the data transformation.
Of course, you can also add custom transformer implementations and use them in combination with a data type.

```java
public class DemoRoute extends EndpointRouteBuilder {
   @Override
   public void configure() throws Exception {
       transformer().name("uppercase")
                 .withJava(UppercaseTransformer.class); // (1)


       from(timer("tick"))
           .setBody()
               .constant("Camel rocks!")
           .transform(new DataType("uppercase")) // (2)
           .to(log("info"));
   }
}
```

1. Directly reference the custom transformer implementation Java type
2. Reference the data type by its name in a transform EIP

The custom UppercaseTransformer Java class extends the Transformer SPI and is able to access the Message object that is being processed by the route.
Also, it gets access to the data type from/to in case you want to apply very specific transformations from one data type into another.

```java
@DataTypeTransformer(name = "uppercase")
public class UppercaseTransformer extends Transformer {
   @Override
   public void transform(Message message,
                         DataType from,
                         DataType to) throws Exception {
      message.setBody(message.getBody(String.class)
                             .toUpperCase());
   }
}
```

This way users are able to provide their custom transformer implementations in combination with data types.

As an alternative to specifying the transformer Java class implementation you can also perform a classpath scan which loads all available transformer implementations from a given package.

```java
public class DemoRoute extends EndpointRouteBuilder {
   @Override
   public void configure() throws Exception {
       transformer().scan("org.apache.camel.demo.transform"); // (1)


       from(timer("tick"))
           .setBody()
               .constant("Camel rocks!")
           .transform(new DataType("uppercase")) // (2)
           .to(log("info"));
   }
}
```

1. Scan package "org.apache.camel.demo.transform" for available transformer implementations
2. Reference the data type by its name in a transform EIP

The transformer classpath discovery mechanism is based on using the `@DataTypeTransformer` annotation.
The particular annotation defines the transformer "name" and gives optional _"fromType"_ and _"toType"_ filters in order to apply this specific transformer only when the type information matches.

```java
@DataTypeTransformer(name = "uppercase")
public class UppercaseTransformer extends Transformer {
   // ...
}
```

Last but not least, the transformer may also use the service locator pattern in order to do lazy loading via service locator lookup.
You may add the transformer service locator to the _"META-INF/services/org/apache/camel/datatype/transformer"_ folder in your project.
Just add a file with the transformer name pointing to the implementing class.

_META-INF/services/org/apache/camel/datatype/transformer/uppercase_
```properties
class=org.apache.camel.demo.transformer.UppercaseTransformer
```

This is how you can use custom transformer implementations and use them as part of a data type transformation in your Camel route.
In the next section we move on to using predefined transformers provided by Camel components.

# Default data type transformers

Camel 4 also introduces a set of default data type transformer implementations that you can directly use in your route.

The default data type transformers in Camel can be of generic nature but may also relate to a very specific Camel component.
This way each Camel component is able to provide additional data types for input and output data transformations.
These Camel component specific transformers usually use the component scheme as part of the name (e.g. _aws2-s3:application-cloudevents_).

This is a list of available data type transformers provided by Camel 4.

| Data Type Name                             |      Component       |
|--------------------------------------------|:--------------------:|
| text-plain                                 | camel-core-processor |
| application-octet-stream                   | camel-core-processor |
| http:application-cloudevents               |  camel-cloudevents   |
| application-cloudevents+json               |  camel-cloudevents   |
| aws2-s3:application-cloudevents            |    camel-aws2-s3     |
| aws2-sqs:application-cloudevents           |    camel-aws2-sqs    |
| aws2-ddb:application-json                  |    camel-aws2-ddb    |
| azure-storage-blob:application-cloudevents | camel-azure-storage  |
| google-sheets:application-x-struct         | camel-google-sheets  |
| google-storage:application-cloudevents     | camel-google-storage |
| application-json                           |    camel-jackson     |
| application-x-struct                       |    camel-jackson     |
| application-x-java-object                  |    camel-jackson     |
| avro-binary                                |  camel-jackson-avro  |
| avro-x-struct                              |  camel-jackson-avro  |
| avro-x-java-object                         |  camel-jackson-avro  |

The combination of Camel component specific data types can be very powerful when it comes to processing the data coming from one component as an input to another component.

As an example the next Camel route uses the _"http:application-cloudevents"_ data type that is provided by the _"camel-cloudevents"_ component.
The data type reads data from the processed message and the Camel exchange and sets proper values according to the CloudEvents specification (e.g. _ce-id_, _ce-source_, _ce-type_).

```java
public class DemoRoute extends EndpointRouteBuilder {
   @Override
   public void configure() throws Exception {
       from(timer("tick"))
           .setBody()
               .constant("Camel rocks!")
           .transform(
               new DataType("http:application-cloudevents"))
           .to(log("info"));
   }
}
```

The route now uses the CloudEvents specific Http headers as you can see in the log output:

```text
Exchange[
  Headers: {
      CamelMessageTimestamp=1697562611364,
      ce-id=7C4BE86A0A14A5E-0000000000000013,
      ce-source=org.apache.camel, ce-specversion=1.0,
      ce-time=2023-10-17T17:10:11.364Z,
      ce-type=org.apache.camel.event,
      Content-Type=application/json,
      firedTime=Tue Oct 17 19:10:11 CEST 2023
  }
  BodyType: String
  Body: Camel rocks!
]
```

We can change this to the Json binding of the CloudEvents specification just by using the data type _"application-cloudevents+json"_.
The output then looks like this:

```text
Exchange[
  Headers: {
      CamelMessageTimestamp=1697562914886,
      Content-Type=application/cloudevents+json,
      firedTime=Tue Oct 17 19:15:14 CEST 2023}
  BodyType: String
  Body: {
      "datacontenttype":"application/json",
      "data":"Camel rocks!",
      "specversion":"1.0",
      "id":"4667EE9FC3E7889-0000000000000004",
      "source":"org.apache.camel",
      "time":"2023-10-17T17:15:14.886Z",
      "type":"org.apache.camel.event"
  }
]
```

Each Camel component knows best about its individual domain model that may be required as an input or gets produced as an output.
Therefore, adding data types to the Camel components that enable us to automatically transform the data into its individual domain model makes much sense because it adds more flexibility in using the components.

For instance the sample above has been using a generic Http CloudEvents data type which is awesome already as it sets reasonable values according to the CloudEvents specification.
In addition to that, individual Camel components may add component specific data types for CloudEvents, too.
Just like the AWS S3 component adds a CloudEvent specific output data type which is able to set proper S3 bucket values as CloudEvent fields (e.g. setting the _s3-bucketname_ as the _ce-source_ property).

Also, as another example the Google Sheets component adds an input data type that is able to transform a simple Json structure into a proper ValueRange (_com.google.api.services.sheets.v4.model_ API) domain model object in order to write data into a spreadsheet.

This data type simplifies the interaction with the component a lot because the user does not even need to know about the individual Google domain model object structure at all.
Instead, users just provide an arbitrary Json object as an input in order to write data to a spreadsheet.

The following route shows the interaction with the Google Sheets Camel component without data types.
The user needs to provide a proper ValueRange domain model object and needs to set this in a specific message header.

```java
public class ModelToGoogleSheetsRoute extends EndpointRouteBuilder {
   @Override
   public void configure() throws Exception {
       from(timer("tick").period(5000))
           .setHeader(GoogleSheetsConstants.PROPERTY_PREFIX + "spreadsheetId")
               .simple("{{sheets.spreadsheetId}}") // (1)
           .setHeader(GoogleSheetsConstants.PROPERTY_PREFIX + "range")
               .simple("{{sheets.range}}")
           .process(new CreateValueRangeProcessor()) // (2)
           .to(googleSheets("data/append") // (3)
                   .clientId("{{sheets.clientId}}")
                   .accessToken("{{sheets.accessToken}}")
                   .refreshToken("{{sheets.refreshToken}}")
                   .clientSecret("{{sheets.clientSecret}}"));
   }


   private static class CreateValueRangeProcessor implements Processor {
       @Override
       public void process(Exchange exchange) throws Exception {
           ValueRange valueRange = new ValueRange();


           List<List<Object>> values = new ArrayList<>();


           values.add(Arrays.asList("java-route", "Pineapple", 100)); // (4)


           valueRange.setMajorDimension("ROWS");
           valueRange.setValues(values);


           exchange.getMessage().setBody(valueRange);


           exchange.getMessage()
               .setHeader(GoogleSheetsConstants.PROPERTY_PREFIX +
                                      "valueInputOption","USER_ENTERED");
           exchange.getMessage()
               .setHeader(GoogleSheetsConstants.PROPERTY_PREFIX +
                                      "values", valueRange); // (5)
       }
   }
}
```

1. Start the route and set some Google Sheets specific headers such as the spreadsheet id
2. Use a custom processor implementation that creates a proper Google Sheets ValueRange object
3. Call the Google Sheets Camel component to write data to the spreadsheet
4. Construct a ValueRange domain model object that is required by the Google Sheets component. Sets the values to write into the spreadsheet (client, product and amount)
5. Set the domain model object as a specific header on the message

Using the Google Sheets component requires a lot of knowledge of the component internals and the Google Sheets domain model.
Instead, you can use the Json struct data type that is provided by the Google Sheets component since Camel version 4.
It automatically transforms an arbitrary Json object with custom fields into a ValueRange object.

```java
public class JsonToSheetsRoute extends EndpointRouteBuilder {
   @Override
   public void configure() throws Exception {
       from(timer("tick"))
           .setHeader(GoogleSheetsConstants.PROPERTY_PREFIX + "columnNames")
               .constant("client,product,amount") // (1)
           .setHeader(GoogleSheetsConstants.PROPERTY_PREFIX + "spreadsheetId")
               .simple("{{sheets.spreadsheetId}}")
           .setHeader(GoogleSheetsConstants.PROPERTY_PREFIX + "range")
               .simple("{{sheets.range}}")
           .setBody().simple("""
             {"client": "java-route","product": "Pineapple","amount": 100}
           """) // (2)
           .transform(new DataType("google-sheets:application-x-struct")) // (3)
           .to(googleSheets("data/append")
                   .clientId("{{sheets.clientId}}")
                   .accessToken("{{sheets.accessToken}}")
                   .refreshToken("{{sheets.refreshToken}}")
                   .clientSecret("{{sheets.clientSecret}}"));
   }
}
```

1. Start the route and set some Google Sheets related headers such as the spreadsheet id. Also set the custom column names that the custom Json object uses
2. Use arbitrary Json object as a message body representing the values to write into the spreadsheet (client, product and amount)
3. Define _"google-sheets:application-x-struct"_ as a data type. The data type will transform the arbitrary Json object into a proper Google Sheets ValueRange domain model so that the Camel component is able to interact with the Sheets API

This is a good example how data types are keen to simplify the usage of Camel components and increase the interoperability of components adapting the input/output data to a specific context in a declarative way (e.g. CloudEvents, Kafka, Http, JsonNode, …).
There is no need to add a custom processor any more that deals with the component internals.
Instead, the component itself provides a data type that is able to do the transformation.

The next section uses this concept to create contracts for Camel routes where the input/output data of a route is well declared and all processed data gets automatically transformed based on that contract.

# Camel route contracts

Up to now the code samples always used the transform EIP with a data type in the route.
As an alternative to that you may also specify the data type as an input/output type for the whole Camel route.

```java
public class DemoRoute extends EndpointRouteBuilder {
   @Override
   public void configure() throws Exception {
       from(timer("tick"))
           .setBody()
               .constant("Camel rocks!")
           .to(direct("ce-outbound")); // (1)


       from(direct("ce-outbound"))
           .inputType("application-cloudevents+json") // (2)
           .to(log("info"));
   }
}
```

1. Call another Camel route via direct endpoint
2. Route declaring its input type as _"application-cloudevents+json"_

In this sample the _"ce-outbound"_ route defines an inputType with the value _"application-cloudevents+json"_.
This means that all calls to this route automatically perform a data type transformation to this specific input type.

With input and output types you are able to define contracts between Camel routes leveraging the automatic data type transformations.

As data types are declarative their usage gets even more important when it comes to using Kamelets and Pipes in Camel.

# Kamelet data types

The declarative nature of data types is very important for Kamelets and Pipes because here you may not have the opportunity to add a custom processor with some lines of code to do the data transformations.
Instead, we use the predefined data types to apply transformations as part of a Kamelet or Pipe.

The feature brings huge improvements in terms of interoperability of Kamelets where the output of Kamelet _A_ is used as an input for Kamelet _B_, for instance when binding sources and sinks in a Pipe.

## Expose data type information

First of all, Kamelets may expose the supported input/output data types as part of the Kamelet specification.

```yaml
apiVersion: camel.apache.org/v1
kind: Kamelet
metadata:
 name: aws-s3-source
spec:
 properties:
   # ...
 dataTypes:
   out:
     default: binary
     types:
       binary:
         format: "application-octet-stream"
         description: |-
           Default binary representation of the source.
         mediaType: application/octet-stream
       cloudevents:
         format: "aws2-s3:application-cloudevents"
         description: |-
            Data type sets CloudEvent headers on the message.
# ...
```

The sample above exposes two output data types _"binary"_ and _"cloudevents"_.
This means that the Kamelet is able to produce these outputs and users may choose from these when referencing the Kamelet in a Pipe.

```yaml
apiVersion: camel.apache.org/v1
kind: Pipe
metadata:
 name: aws-s3-to-http
spec:
 integration:
   dependencies:
   - "camel:cloudevents"
 source:
   ref:
     kind: Kamelet
     apiVersion: camel.apache.org/v1
     name: aws-s3-source
   properties:
     bucketNameOrArn: "{{aws.s3.bucketNameOrArn}}"
     accessKey: "{{aws.s3.accessKey}}"
     secretKey: "{{aws.s3.secretKey}}"
   dataTypes:
     out:
       format: aws2-s3:application-cloudevents # (1)
 sink:
   ref:
     kind: Kamelet
     apiVersion: camel.apache.org/v1
     name: http-sink
   dataTypes:
     in:
       format: http:application-cloudevents  # (2)
   properties:
     url: "{{http.sink.url}}"
```

1. Use aws2-s3 specific CloudEvents output which sets specific headers
2. Use Http binding of CloudEvents to produce a proper Http request following the CloudEvents specification

The Pipe is able to choose input and output data types when referencing Kamelets as sources and sinks.
This way you can adapt the Kamelets behavior and the combination of Kamelets becomes much more robust as the Kamelets are able to work hand in hand with increased interoperability.

Another example shows that Kamelet data types also help to transform the message as part of a Pipe.
There are various Kamelets available to transform JsonNode based workloads such as extract-field-action, insert-field-action, hoist-field-action.
All these action Kamelets operate on a generic JsonNode model object.
The data types help to transform the Kamelet source output into such a generic JsonNode by using the _"application-x-struct"_ data type.

```yaml
apiVersion: camel.apache.org/v1
kind: Pipe
metadata:
 name: slack-to-kafka
spec:
 source:
   ref:
     kind: Kamelet
     apiVersion: camel.apache.org/v1
     name: slack-source
   properties:
     channel: "{{slack.channel}}"
     token: "{{slack.bot.token}}"
   dataTypes:
     out:
       format: application-x-struct # (1)
 steps:
   - ref:
       kind: Kamelet
       apiVersion: camel.apache.org/v1
       name: extract-field-action
     properties:
       field: text # (2)
 sink:
   ref:
     kind: KafkaTopic
     apiVersion: kafka.strimzi.io/v1beta2
     name: "{{kafka.topic}}"
   dataTypes:
     in:
       format: plain-text # (3)
   properties:
     brokers: "{{kafka.bootstrapServers}}"
```

1. Use "application-x-struct" data type that transforms the Slack Json into a generic JsonNode using the Jackson library
2. Extract the "text" field (user input on the Slack channel) from the JsonNode and set as a new message body
3. Transform the message to "plain-text" before sending the data to Kafka

This example Pipe shows that data types tremendously improve the interaction between Kamelets because it is very easy to transform the message content into different data formats as part of the Pipe processing by just referencing some data types.

The input/output data types on Kamelets perfectly complement the declarative nature of Kamelet and Pipes.

# What’s next!?

The data types feature is available since Camel 4 and the next step is to provide more data type transformer implementations for different types of Camel components.
So please do not hesitate to provide feedback and get involved by adding more data types that everybody can use.
