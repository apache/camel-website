---
title: "Apache Camel 4.10 What's New"
date: 2025-02-12
authors: [davsclaus, orpiske, tadayosi, croway]
categories: ["Releases"]
preview: Details of what we have done in the Camel 4.10 release.
---

Apache Camel 4.10 LTS has just been [released](/blog/2025/02/RELEASE-4.10.0/).

This release introduces a set of new features and noticeable improvements that we will cover in this blog post.

## Camel Core

Added `customize` to `RouteBuilder` to make it easier to configure a specific Camel component / dataformat, service
in a Java lambda style, such as follows:

```java
@Override
public void configure() throws Exception {
    customize(KServeComponent.class, k -> {
        k.getConfiguration().setTarget("localhost:8888");
    });

    from("timer:kserve?repeatCount=1")
        .to("kserve:model/metadata?modelName=myModel")
        .log("${body}");
}
```

This makes it possible for low-code users that want to have a single Java file with the Camel route
and all the Java based configuration done entirely from the same `configure` method.

## Camel JBang

Using _modeline_ has been deprecated. It is recommended to configure externally in the `application.properties`
file, and then include this file when running with Camel JBang:

```bash
$ camel run foo.camel.yaml application.properties
```

Or use `*` to include all files from the current folder:

```bash
$ camel run *
```

We have continued to improve the `run` and `export` to work better and also when using different runtimes.

The `debug` command now supports step in and step over. For example debugging a splitter allows
now to step over and continue after the entire split is complete, while step in, will step
inside the splitter (default mode).

The `shell` command has been improved, and can now be used for sub commands such as `log` and `trace` or `--watch` mode,
and be able to exit logging and still be within the shell. Previously you would quit the shell when pressing `ctrl + c`.

### Camel JBang Infra

The new Camel JBang `infra` command provides access to external services used for testing Apache Camel. 
This feature enables developers to quickly set up testing environments and create prototypes using real services.

The `infra` command offers two sub-commands:

* `camel infra list`: Available external services
* `camel infra run $SERVICE_ALIAS`: Run a service from the list

For example, to start an FTP service, use:

```bash
$ camel infra run ftp

Starting service ftp
{
  "getPort" : 52472,
  "getFtpRootDir" : "file://path/to/current/directory/target/ftp/camel-test-infra-test-directory/camel-test-infra-configuration-test-directory"
}
```

The command returns a JSON response containing service configuration details that can be directly integrated into your Camel routes. 
In this example, the response includes:

* The dynamically assigned port number
* The FTP root directory path

This structured output makes it easy to programmatically access service details in your development workflow.

### Camel JBang Update

The new Camel JBang `update` command streamlines the process of upgrading Apache Camel applications to newer versions.
The `update` command provides two sub-commands:

* `list`: Displays all available Apache Camel versions that you can upgrade to.
* `run`: Performs the actual update process, automatically migrating your application to the specified Camel version.

The update process leverages the [Apache Camel Open Rewrite recipes](https://github.com/apache/camel-upgrade-recipes) and supports three runtimes:

* Plain Camel (camel-main)
* Camel Quarkus (quarkus)
* Camel Spring Boot (spring-boot)

More information can be found in [Apache Camel JBang documentation](/manual/camel-jbang.html#_update).

### Camel JBang Kubernetes

We have done many improvements and bug fixes to make camel kubernetes work well on Openshift and [Minikube](/manual/camel-jbang-kubernetes.html#_minikube_deployment_tips_and_troubleshooting).

The option `--name` has been added to allow the user to explicitly define the integration name. It is available on all `camel kubernetes` commands.

The `--quiet` mode for camel kubernetes run command has been modified to only show errors for build/deploy. Alternatively to display Maven build output and JIB logs you can use `--verbose` mode.

## Camel Kamelet

The error handling of the kamelets has been aligned to be Camel _standard_ and act
similar to Camel routes. See the migration guide for more details.

You can now also configure the `bridgeErrorHandler` option on a Kamelet.

And it's now also possible to call another Kamelet from within a Kamelet.

## Camel AI

Camel AI has added three new components (see [New Components](#new-components)).

Two of them (TensorFlow Serving and KServe) are components that support integration with AI model servers, allowing Camel routes to send inference requests with trained models to these model servers. Together with the TorchServe component already introduced in Camel 4.9, Camel now supports the two major AI frameworks PyTorch and TensorFlow, as well as other popular model servers (OpenVINO, Triton, etc.) that support the KServe API. The KServe component will also prepare Camel for integration into MLOps platforms such as Kubeflow.

Neo4j has been introduced as a new component in Apache Camel. Neo4j is a popular graph database. In addition to its traditional graph database functionalities, it also supports vector embeddings for RAG (Retrieval AugmentedGeneration). The Neo4j component provides support for graph database queries. Furthermore, it also supports LangChain4j embeddings, which enables AI-enhanced RAG capabilities.

## Camel Micrometer

We have fixed a flawed behavior when using dynamic endpoints which made the generation of endpoint events
to grow in an uncontrolled way. From now on the component will generate events for the endpoint base URI as a default behavior.
If you still want to collect events for the extended URI (including the parameters), then,
you can use the `camel.metrics.baseEndpointURIExchangeEventNotifier=false` configuration.
Mind that this is strongly discouraged as it can make your number of events growing out of control.

## Camel Groovy

Camel now reports a bit better when Groovy scripts have compilation errors, to indicate at what
position the error is located.

## Camel Attachments / Camel Platform HTTP

We have improved the `platform-http` component to better handle file uploads using `multipart/data-form`
across all runtimes. The files are stored in `camel-attachments`, and this API has been made
easier to use from Java, and simple and Groovy languages. And if there is a single file
uploaded, then the file content is automatically stored in the message body, and the file name
in `CamelFileName` header, length in `CamelFileLength` header, and content-type in `CamelFileContentType`.

We have also included a mime-detector algorithm that has a huge list of well known types,
(similar to what Spring Boot uses). This means if xml,json,cxf, and various image files is uploaded,
then the content-type refers to these types instead of the default `application/octet-stream`.

## Camel Kafka

This release brings a couple of fixes for minor performance issues when evaluating Kafka record metadata.

Added `pollIntervalMs` to allow Kafka batching mode to complete an incomplete group after a given time. 

## Camel SJMS / SJMS2

This release brings a couple of fixes for minor performance issues when working with standard JMS headers. 

## Camel MLLP

Added support for TLS/SSL for secured network communications.

## Camel Vault

The hashicorp vault can now be configured to use cloud-based vault as well.

Camel can now configure beans using property placeholders which are sourced from secure vaults.

## Camel Test

The `camel-test` can now easily dump route (or route coverage) to files in the target folder.
You would then be able to run a suite of tests and be able to inspect the routes (dumped as XML or YAML)
that was loaded into Camel during the tests.

For example, you run:

```bash
$ mvn clean test -DCamelTestRouteDump=yaml -DCamelTestRouteCoverage=true
```
This requires adding camel-yaml-io and camel-management JAR as dependency (can be set as test scoped)
You can also configure this programmatically with annotations in the test class.

## Camel Spring Boot

The `camel-spring-boot` is upgraded to latest Spring Boot 3.4.2 release.

### Camel Spring Boot Platform HTTP

The platform-http component has been enhanced to fully align with REST services best practices, introducing several significant improvements to request and response handling.
A major change affects Content-Type validation in requests and responses. The component now strictly enforces Content-Type headers, 
returning a 415 Unsupported Media Type error when requests contain unexpected Content-Types. This change may require updates to existing implementations to ensure compatibility.
This is a high level list of the new features:

* Attachment
* Produces/Consumes Headers
* Optimize Response Write (always use Streams where possible)
* Camel Headers
* Streaming large files
* Camel Cookie handler
* HTTP Form
* CORS
* URI Matcher

## Miscellaneous

Upgraded many third-party dependencies to the latest releases at the time of release.

The `camel-file` component has been optimized when filtering based on file-names to
be faster.

The `camel-smb` component has been refactored to include many more shared features from the `camel-file` component.

The `camel-http` component has a new `logHttpActivity` option you can enable, to make it easy to log
all HTTP request/response when using this component to call external HTTP services.

## New Components

We have added a few new components:

- `camel-kserve` - Provide access to AI model servers with the KServe standard to run inference
- `camel-neo4j` - Perform operations on the Neo4j Graph Database
- `camel-tensorflow-serving` - Provide access to TensorFlow Serving model servers to run inference with TensorFlow saved models remotely

## Upgrading

Make sure to read the [upgrade guide](/manual/camel-4x-upgrade-guide-4_10.html) if you are upgrading from a previous Camel version.

If you are upgrading from, for example, 4.4 to 4.8, then make sure to follow the upgrade guides for each release in-between, i.e.
4.4 -> 4.5, 4.5 -> 4.6, and so forth.

The Camel Upgrade Recipes tool can also be used to automate upgrading.
See more at: https://github.com/apache/camel-upgrade-recipes

## Release Notes

You can find more information about this release in the list of JIRA tickets resolved in the release:

- [Release notes 4.10](/releases/release-4.10.0/)

## Roadmap

The following 4.11 release is planned for Apr 2025.

