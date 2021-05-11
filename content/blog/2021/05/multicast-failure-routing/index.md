---
title: "Routing multicast output after encountering partial failures"
date: 2021-05-10
draft: true
authors: [hokutor]
categories: ["Usecases"]
preview: "Routing multicast output after encountering partial failures"
---

## Problem description

Multicast is a powerful EIP which supports parallel execution paths in asynchronous manner. There are various ways a camel user can configure a multicast EIP. Check out the extensive documentation [here](https://camel.apache.org/components/3.4.x/eips/multicast-eip.html)
1. One can configure to execute all the child paths independently and continue routing the last reply as the outgoing message (default behavior unless you provide an aggregation strategy)
2. Additionally, you can plug in an implementation of [camel aggregation strategy]( https://github.com/apache/camel/blob/camel-3.7.x/core/camel-api/src/main/java/org/apache/camel/AggregationStrategy.java ) with user defined logic to aggregate the output from each of those child path before continuing further downstream routing. 

For the use case discussed below, the requirement is to aggregate the computed results from all child paths before it gets routed to the downstream processors in the flow. The idea is to keep routing the aggregated results if atleast one child route completes successfully without an exception. We also want to stop routing further if all the child exchanges experienced failures.

## Use case 

Check out the following camel routes 

```java
@Override
public void configure() throws Exception {
    onException(Exception.class)
        .useOriginalMessage()
        .handled(true)
        .log("Exception handler invoked")
        .transform().constant("{\"data\" : \"err\"}")
        .end();

    from("jetty:http://localhost:8081/myapi?httpMethodRestrict=GET")
        .log("received request")
        .log("Entering multicast")
        .multicast(new SimpleFlowMergeAggregator())
        .parallelProcessing().to("direct:A", "direct:B")
        .end()
        .log("Aggregated results ${body}")
        .log("Another log")
        .transform(simple("{\"result\" : \"success\"}"))
        .end();

    from("direct:A")
        .log("Executing PATH_1 - exception path")
        .transform(constant("DATA_FROM_PATH_1"))
        .log("Starting exception throw")
        .throwException(new Exception("USER INITIATED EXCEPTION"))
        .log("PATH_1")
        .end();

    from("direct:B")
        .log("Executing PATH_2 - success path")
        .delayer(1000)
        .transform(constant("DATA_FROM_PATH_2"))
        .log("PATH_2")
        .end();
}
````


Following strategy aggregates the output of each multicast child route as a java list

```java
public class SimpleFlowMergeAggregator implements AggregationStrategy {
    private static final Logger LOGGER = LoggerFactory.getLogger(SimpleFlowMergeAggregator.class.getName());
    @Override
    public Exchange aggregate(Exchange oldExchange, Exchange newExchange) {
        LOGGER.info("Inside aggregator " + newExchange.getIn().getBody());
        if(oldExchange == null) {
            String data = newExchange.getIn().getBody(String.class);
            List<String> aggregatedDataList = new ArrayList<>();
            aggregatedDataList.add(data);
            newExchange.getIn().setBody(aggregatedDataList);
            return newExchange;
        }

        List<String> oldData = oldExchange.getIn().getBody(List.class);
        oldData.add(newExchange.getIn().getBody(String.class));
        oldExchange.getIn().setBody(oldData);

        return oldExchange;
    }
}
```

On executing the same, we see following logs
```log
2021-05-06 12:43:18.565  INFO 13956 --- [qtp916897446-42] route1                                   : received request
2021-05-06 12:43:18.566  INFO 13956 --- [qtp916897446-42] route1                                   : Entering multicast
2021-05-06 12:43:18.575  INFO 13956 --- [ #4 - Multicast] route2                                   : Executing PATH_1 - exception path
2021-05-06 12:43:18.575  INFO 13956 --- [ #4 - Multicast] route2                                   : Starting exception throw
2021-05-06 12:43:18.578  INFO 13956 --- [ #4 - Multicast] route2                                   : Exception handler invoked
2021-05-06 12:43:18.579  INFO 13956 --- [ #4 - Multicast] c.e.d.m.SimpleFlowMergeAggregator        : Inside aggregator {"data" : "err"}
2021-05-06 12:43:19.575  INFO 13956 --- [ #3 - Multicast] route3                                   : Executing PATH_2 - success path
2021-05-06 12:43:21.576  INFO 13956 --- [ #3 - Multicast] route3                                   : PATH_2
2021-05-06 12:43:21.576  INFO 13956 --- [ #3 - Multicast] c.e.d.m.SimpleFlowMergeAggregator        : Inside aggregator DATA_FROM_PATH_2
```

## What could take you by by a surprise?

- When the multicast completes aggregating exchanges from child branches, one might intermittently note that it stops routing the remaining processors (those 2 additional log and a transform step in above example). On running a debugger, you will notice this happens in a special scenario when the very first exchange which arrives in the aggregator (from first completed child branch) had encountered an exception during its course or/and was handled via onException flows. On the flip side, if the first exchange was a successful and even though all the remaining ones experienced a failure, it still continued routing the remaining processors/steps.


## Analysis

To understand this better, lets deep dive into the open source codebase. Notice the [Pipeline class]( https://github.com/apache/camel/blob/6dff85675e9b73e8a528bc2683935ec3c1ed26b7/core/camel-core-processor/src/main/java/org/apache/camel/processor/Pipeline.java ). PipelineProcessor (part of camel core framework processors) performs an evaluation after every user processors (user added steps in a camel flow) on whether it should continue routing to the next processor.
This decision is made inside Pipeline class on [this if block](https://github.com/apache/camel/blob/6dff85675e9b73e8a528bc2683935ec3c1ed26b7/core/camel-core-processor/src/main/java/org/apache/camel/processor/Pipeline.java#L79) <br>

The Pipeline stops routing to next processor under following 3 conditions
- If previous processors have [marked route stop](https://github.com/apache/camel/blob/6dff85675e9b73e8a528bc2683935ec3c1ed26b7/core/camel-core-processor/src/main/java/org/apache/camel/processor/Pipeline.java#L74) on the exchange object.
- There are [no more processors](https://github.com/apache/camel/blob/6dff85675e9b73e8a528bc2683935ec3c1ed26b7/core/camel-core-processor/src/main/java/org/apache/camel/processor/Pipeline.java#L76) in the pipeline
- [PipelineHelper.continueProcessing()](https://github.com/apache/camel/blob/6dff85675e9b73e8a528bc2683935ec3c1ed26b7/core/camel-core-processor/src/main/java/org/apache/camel/processor/PipelineHelper.java#L41) returns false. On further study of the helper method, you might realized it returns false (not to route further) if any of [these states](https://github.com/apache/camel/blob/6dff85675e9b73e8a528bc2683935ec3c1ed26b7/core/camel-core-processor/src/main/java/org/apache/camel/processor/PipelineHelper.java#L43-L44) on the exchange is flagged as true. Such flagging happens when an exchange encounters java exception during the course of routing and gets handled in an exception handler which mark exception as handled. <br>
 
Well, what if you still want to continue routing?
- From our above aggregator, you will notice that the very first exchange which arrives in aggregator becomes the base exchange on which the aggregator continues to pile up body content (with incoming results from other child routes). Infact, a lot of camel users follow this pattern of writing an aggregator strategy. Unfortunately, if done this way, [the states set by exception handlers](https://github.com/apache/camel/blob/6dff85675e9b73e8a528bc2683935ec3c1ed26b7/core/camel-core-processor/src/main/java/org/apache/camel/processor/PipelineHelper.java#L43-L44) get carried forward to the next evaluation point in [Pipeline](https://github.com/apache/camel/blob/camel-3.7.x/core/camel-core-processor/src/main/java/org/apache/camel/processor/Pipeline.java#L79) and qualify to stop routing. 
<br>

## Solution 

There are many ways a user could neutralize the states set by the exception handling framework. However, for the scope of this article, we chose the following strategy. 
- If first child route exchange never encountered an exception, then continue processing the rest of aggregation cycle as usual.
- If the first child encountered an excetion, then introspect the incoming exchanges for success case. If found, shift the base to be the first succeess exchange and move the aggregated results on to it and continue the rest of aggregation lifecycle as usual.

Updated AggregationStrategy
```java
public class SimpleFlowMergeAggregator implements AggregationStrategy {
    private static final Logger LOGGER = LoggerFactory.getLogger(SimpleFlowMergeAggregator.class.getName());
    @Override
    public Exchange aggregate(Exchange oldExchange, Exchange newExchange) {
        LOGGER.info("Inside aggregator " + newExchange.getIn().getBody());
        if(oldExchange == null) {
            String data = newExchange.getIn().getBody(String.class);
            List<String> aggregatedDataList = new ArrayList<>();
            aggregatedDataList.add(data);
            newExchange.getIn().setBody(aggregatedDataList);
            return newExchange;
        }

        if(hadException(oldExchange)) {
            if(!hadException(newExchange)) {
                // aggregate and swap the base
                LOGGER.info("Found new exchange with success. swapping the base exchange");
                List<String> oldData = oldExchange.getIn().getBody(List.class);
                oldData.add(newExchange.getIn().getBody(String.class));
                newExchange.getIn().setBody(oldData); // swapped the base here
                return newExchange;
            }
        }

        List<String> oldData = oldExchange.getIn().getBody(List.class);
        oldData.add(newExchange.getIn().getBody(String.class));
        oldExchange.getIn().setBody(oldData);

        return oldExchange;
    }


    private boolean hadException(Exchange exchange) {

        if(exchange.isFailed()) {
            return true;
        }

        if(exchange.isRollbackOnly()) {
            return true;
        }

        if(exchange.isRollbackOnlyLast()) {
            return true;
        }

        if(((ExtendedExchange)exchange).isErrorHandlerHandledSet()
                && ((ExtendedExchange)exchange).isErrorHandlerHandled()) {
            return true;
        }

        return false;
    }
}
````

```log
2021-05-06 12:46:19.122  INFO 2576 --- [qtp174245837-45] route1                                   : received request
2021-05-06 12:46:19.123  INFO 2576 --- [qtp174245837-45] route1                                   : Entering multicast
2021-05-06 12:46:19.130  INFO 2576 --- [ #3 - Multicast] route2                                   : Executing PATH_1 - exception path
2021-05-06 12:46:19.130  INFO 2576 --- [ #3 - Multicast] route2                                   : Starting exception throw
2021-05-06 12:46:19.134  INFO 2576 --- [ #3 - Multicast] route2                                   : Exception handler invoked
2021-05-06 12:46:19.135  INFO 2576 --- [ #3 - Multicast] c.e.d.m.SimpleFlowMergeAggregator        : Inside aggregator {"data" : "err"}
2021-05-06 12:46:20.130  INFO 2576 --- [ #4 - Multicast] route3                                   : Executing PATH_2 - success path
2021-05-06 12:46:22.132  INFO 2576 --- [ #4 - Multicast] route3                                   : PATH_2
2021-05-06 12:46:22.132  INFO 2576 --- [ #4 - Multicast] c.e.d.m.SimpleFlowMergeAggregator        : Inside aggregator DATA_FROM_PATH_2
2021-05-06 12:46:22.132  INFO 2576 --- [ #4 - Multicast] c.e.d.m.SimpleFlowMergeAggregator        : Found new exchange with success. swapping the base exchange
2021-05-06 12:46:22.133  INFO 2576 --- [ #4 - Multicast] route1                                   : Aggregated results {"data" : "err"},DATA_FROM_PATH_2
2021-05-06 12:46:22.133  INFO 2576 --- [ #4 - Multicast] route1                                   : Another log
```

With the new aggregator implementation, you can now see the exchange getting routed down to the remaining processors.

Hope this article helps users who hit upon this issue. 