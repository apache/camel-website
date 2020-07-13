---
title: "CAPI Gateway: Using Apache Camel at the European Commission"
date: 2020-01-02
authors: [rodrigoserracoelho]
categories: ["Usecases"]
preview: How an API Gateway is implemented using Camel at the European Comission
---

I've been working at the European Commission for the last 4 years as a Software Architect, working for a unit responsible for developing reusable components, and advocating open source software. In this context, we organized already a couple of Hackathons and Bug bounties open to all the open source communities.

In the team, we worked already a couple of times with Apache Camel, and I like the elegance and performance compared with other integration frameworks.

Recently I was challenged to find alternatives to the existing API Gateway infrastructure and immediately started to search for products implemented on top of Apache Camel.

Not being able to find any solution with all we need to offer, I decided to work on a small POC with the following features:

* Easy to customize API Gateway (since we have several customers, with a wide scope of needs and technologies, we need to be able to easily build custom components on top of an API Gateway core.) Ex.: Customize processors, Integrate with externals IdP, Implement custom API Manager Interface.)
* Light and easy to install.
* Decoupled components, Observability, Metrics, Database, API Manager Interface, Authorization, and Gateway.
* Traffic management (Applied per API or API Path)
* Automated traceability. (When a user deploys an API, we create Zipkin traces)
* Automated Metrics (When a user deploys an API, we create Prometheus metrics)
* Automated Dashboards (When a user deploys an API, we create Grafana dashboards)
* Block APIs after failed attempts.
* REST endpoints to manage your API's, Clients, Subscriptions, Certificates.
* Authorization integration with Keycloak.

SO, WHY APACHE CAMEL?

* Open Source.
* Big and active community.
* Fast and reliable.
* Deep integration with Spring Boot.
* DSL Language.
* Know-how in the team.
* It supports all the integration patterns that you can remember.

As part of the POC, I've decided already to combine other technologies:

* Spring Boot
* Hazelcast distributed cache
* Prometheus
* Grafana
* Zipkin
* MongoDB
* Keycloak

The POC is available, and currently being tested, already working with Apache Camel 3.0.0.
Let's then go for some technical details...

## Architecture Overview

{{< image "CAPI-Gateway.png" "Architecture Overview" >}}

## Basic Route Definition

```
routeDefinition
  .streamCaching()
  .setHeader(...) //core headers
  .process(authenticationProcessor)
  .choice()
      .when(...) //check execution of the authentication processor
      .process(pathProcessor) //evaluates the path
      .toF(toEndpoint) //proxy to the deployed backend
      .removeHeader(...) //remove some core headers
      .process(metricsProcessor) //process metrics

  //api was not authenticated (ex.: expired token)
  .otherwise()
      .setHeader(...) //core error headers
      .toF(apiGatewayErrorEndpoint) //proxy to default error endpoint
      .removeHeader(...) //remove some core headers
      .process(metricsProcessor) //process metrics
      .end()
      .setId(routeID);
```

The *toEndpoint* contains the default configuration:

```
throwExceptionOnFailure=false //we will catch the exceptions
connectTimeout=...
bridgeEndpoint=true
copyHeaders=true
connectionClose=true
```

Since we want to be able to catch Network, IO exceptions we also do this on the route definition:

```
routeDefinition
  .onException(exceptionClass)
  .continued(continued)
  .setHeader(...) //exception headers
  .toF(apiGatewayErrorEndpoint) //proxy to default error endpoint
  .removeHeader(...) //remove some core headers
  .end();
```

All information about a running API can be found in the shared cache. This allows the component that manages APIs to know if an API must be suspended or temporarily blocked (due to failed attempts and/or many calls exceeding the defined threshold.)
Information about a running API includes:

* Route ID
* Secured
* Zipkin Service Name and Prometheus Metrics Name
* Context
* Path
* Verb
* Failed calls
* Max allowed failed calls
* Disabled (temporarily disabled, a candidate to be removed)
* Removed (removed Route)
* Suspended info (type [ERROR, THROTTLING] and reason)

Main components Managing enabled Routes:

* @Component @Scheduled *ThrottlingInspector* - Periodically checks the traffic on the deployed API Path level
* @Component @Scheduled *Running API's* - Periodically checks for API errors, candidates routes to suspend.

## Example of an API definition

```
{
    "_id" : "XXX-XXX-XXX-XXX",
    "endpoint" : "remote.domain.com:8080",
    "endpointType" : "HTTPS",
    "name" : "Friendly API Name",
    "secured" : true,
    "context" : "context-name",
    "swagger" : true,
    "swaggerEndpoint" : "https://remote.domain.com:8080/v2/api-docs",
    "blockIfInError" : true,
    "maxAllowedFailedCalls" : 10, //after 10 failed calls, the route will be removed
    "unblockAfter" : true,
    "unblockAfterMinutes" : 2, //after 2 minutes of being removed, the route is added
    //100 calls per minute, above this, the route is suspended.
    "throttlingPolicy" : {
        "maxCallsAllowed" : "100",
        "periodForMaxCalls" : "60000",
        "applyPerPath" : true
    }
}
```

With the following configuration your service will be available at:

```
https://localhost:8380/gateway/context-name/
```

The following configuration will be applied:
* secured: true - Meaning, that the CAPI Gateway expects a Bearer token sign by the authorization server (currently integrating with Keycloak) provided by the CAPI Rest Server.
* blockIfInError: true - Means that for instance if you send more than 10 times (maxAllowedFailedCalls) the wrong token your API will be suspended for 2 minutes (unblockAfterMinutes).
* throttlingPolicy.maxCallsAllowed: 100 / throttlingPolicy.periodForMaxCalls - You can only call your API/Path 100 times per minute.
* throttlingPolicy.applyPerPath: true - If true the policy will be applied by the path and NOT the total amount for the API.

## Optional Configuration
You can define custom paths, in case you don't have a Swagger Endpoint (Swagger 2/Open API), so if swagger: false, then CAPI will look for a list of PATH like the below example:

```
 {
     "_id" : "XXX-XXX-XXX-XXX",
     "endpoint" : "remote.domain.com:8080",
     "endpointType" : "HTTPS",
     "name" : "Friendly API Name",
     //this time, the API will be available for everyone
     "secured" : false,
     "context" : "context-name",
     "blockIfInError" : false,
     //no swagger definition present, you need to define the available paths.
     "swagger" : false,
     "paths" : [
         {
         "verb" : "GET",
         "path" : "/services/path"
         },
         {
         "verb" : "POST",
         "path" : "/services/path"
         }
     ]
 }
```

## Client (consumer) object
This will change after the integration with Keycloak.
Example of a client (with the password: web-client-secret)

```
{
    "_id" : "XXX-XXX-XXX-XXX",
    "clientId" : "web-publisher",
    "resourceIds" : [],
    "secretRequired" : true,
    "clientSecret" : "$2a$10$oQBqS4ZOEiIGVNiZnB0nMuFw/n/Od57IG/uy4nFuOJxLtHE/Z5jDC",
    "scoped" : false,
    "scope" : [
        "read-foo"
    ],
    "authorizedGrantTypes" : [
        "refresh_token",
        "client_credentials",
    ],
    "registeredRedirectUri" : [],
    "authorities" : [
        {
            "role" : "ROLE_USER",
            "_class" : "org.springframework.security.core.authority.SimpleGrantedAuthority"
        },
        {
            "role" : "ROLE_PUBLISHER",
            "_class" : "org.springframework.security.core.authority.SimpleGrantedAuthority"
        }
        // All the API's you subscribe will be an authority
    ],
    "accessTokenValiditySeconds" : 60,
    "refreshTokenValiditySeconds" : 14400,
    "autoApprove" : false
}
```

## Consuming your API
If you wish to enable security for your API (api.secured = true), then you will need to define a *client*.
Your API ID will be added as an authority in the authorities list of your client.

```
"authorities" : [
    {
        "role" : "ROLE_USER",
        "_class" : "org.springframework.security.core.authority.SimpleGrantedAuthority"
    },
    {
        "role" : "ROLE_PUBLISHER",
        "_class" : "org.springframework.security.core.authority.SimpleGrantedAuthority"
    },
    {
        "role" : "YOUR API ID",
        "_class" : "org.springframework.security.core.authority.SimpleGrantedAuthority"
    }
]
```

## Play with CAPI Gateway
* Clone the project.
* Execute

```
$ sudo docker-compose up -d
```

* If you are starting a new MongoDB instance, a default CAPI Client will be created for you.
* Request your first access token:

```
$ curl -X POST https://localhost:8080/oauth/token -H 'Authorization: Basic d2ViLXB1Ymxpc2hlcjp3ZWItY2xpZW50LXNlY3JldA==' -H 'Content-Type: multipart/form-data;' -F grant_type=client_credentials -F 'response_type=access_token'
```

* Go to http://localhost:8080/swagger-ui.html
* Authenticate with the token you obtained from the previous step. (Don't forget to specify: Bearer _the token_)
* Publish your first API:

```
$ curl -X POST "http://localhost:8080/route/simple-rest" -H "accept: application/json" -H "Content-Type: application/json" -d "<your-api>" (see Example of an API definition)
```

* Imagine that your context was: test and one of your GET path was /user you can then test: http://localhost:8380/gateway/test/user

Docker Compose will create instances of Grafana, Prometheus and Zipkin, but if you wish to use already existing instances you just need to change this environment variables:

```
api.gateway.prometheus.endpoint=http://prometheus:9090
api.gateway.zipkin.endpoint=http://zipkin:9411/api/v2/spans
api.gateway.grafana.endpoint=http://localhost:8080/grafana
```

## Some load results (Calling a protected service)
#### Using apache benchmark on a 1 node docker container with SSL

    Results for 20k calls 1000 concurrency level:
    Server Hostname:        localhost
    Server Port:            8380
    SSL/TLS Protocol:       TLSv1.2,ECDHE-RSA-AES256-GCM-SHA384,2048,256
    Server Temp Key:        ECDH P-256 256 bits
    TLS Server Name:        localhost

    Document Path:          /gateway/myctx/internal/12345
    Document Length:        33 bytes

    Concurrency Level:      1000
    Time taken for tests:   65.563 seconds
    Complete requests:      20000
    Failed requests:        0
    Total transferred:      6560000 bytes
    HTML transferred:       660000 bytes
    Requests per second:    305.05 [#/sec] (mean)
    Time per request:       3278.129 [ms] (mean)
    Time per request:       3.278 [ms] (mean, across all concurrent requests)
    Transfer rate:          97.71 [Kbytes/sec] received

    Connection Times (ms)
                  min  mean[+/-sd] median   max
    Connect:        7 2431 1388.0   2260   18381
    Processing:     5  798 883.7    684   13862
    Waiting:        3  796 883.3    681   13862
    Total:         58 3229 1683.6   3091   18639

It would be amazing to have feedback from the Apache Camel Community. If you have any questions, feel free to contact me.
The repo is located at https://github.com/rodrigoserracoelho/capi-gateway
