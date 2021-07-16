---
title: "Camel K 1.5 - New configuration settings"
date: 2021-07-19
draft: false
authors: [squakez]
categories: ["Features", "Camel K"]
preview: "Learn how to include properties and resources in your Camel K integration"
---

Camel K version 1.5 is out. And with it, a new way of providing configuration and resources to your `Integration`. We have worked on a deep code refactoring in order to harmonize the existing configuration settings and add new ones to exploit the power of `camel-quarkus` runtime, which has become the main way to materialize an `Integration`.

We added new features that will simplify your developer life. We also added new checks that will give you useful tips when using a feature in a wrong way.

Through this blog you will learn about:

* New build-time properties feature
* Leverage Kubernetes resources (ie, `Configmap`, `Secret`) for config and resources
* Kubernetes resources key filtering
* Support for plain and binary files
* Specify file destination path
* New warnings and limitations

## Runtime properties

If you're an experienced Camel K developer, you are certainly familiar with the `--property` (abbreviated `--p`) and `--property-file` flags of the `kamel run` command. Through these flags you are instructing the runtime `Integration` to include properties configuration that will be used during the application execution. Within version 1.5 we made a slight change on how to provide a property file. We have deprecated the `--property-file` flag and favoured the new syntax `--property file:my-file.properties` (or shorter, `--p file:my-file.properties`).
Since this version we're also starting to distinguish between **runtime** properties and **build-time** properties. `--property` will be used to identify runtime properties.

Learn more in the [runtime properties documentation page](/camel-k/latest/configuration/runtime-properties.html).

## Build-time properties

You may have noticed that we highlighted the term **runtime** in the previous section. Since version 1.5 we're introducing a new kind of properties in order to distinguish two phases of the `Integration` lifecycle. As Camel Quarkus is gaining importance, we needed to conceive the concept of **build-time** properties, which are consumed by the Camel Quarkus build process. Within the presence of the `--build-property` flag, we can instruct our integrations to include certain build time configuration that may be required by the Camel Quarkus build process.

If you have a look at [build time configuration variables expected by a Quarkus application](https://quarkus.io/guides/config#build-time-configuration), you will be able to spot certain properties that will influence the final build.

A very interesting use case that will benefit from this new flag is the [configuration of a Datasource in Camel K](https://github.com/apache/camel-k/blob/main/examples/databases/PostgresDBAutoDatasource.java).

If you look at the example, you can see that you can quickly setup a **JDBC Datasource** by configuration, just providing certain build and runtime properties to your `Integration`:
```
kamel run PostgresDBAutoDatasource.java --dev 
                                        --build-property quarkus.datasource.camel.db-kind=postgresql 
                                        -p quarkus.datasource.camel.jdbc.url=jdbc:postgresql://postgres:5432/test 
                                        -p quarkus.datasource.camel.username=postgresadmin 
                                        -p quarkus.datasource.camel.password=admin123 
                                        -d mvn:io.quarkus:quarkus-jdbc-postgresql:1.13.7.Final
```
You can learn more about this feature in the [build time properties documentation page](/camel-k/latest/configuration/build-time-properties.html)

## Integration configuration

Until version 1.5, you had several way to provide a configuration file to an `Integration`. You could use the `--resource` to upload a file, `--configmap` to use a `Configmap` or `--secret` to use a `Secret`. We decided to review entirely this part and deprecate `--configmap` and `--secret` and deeply review `--resource` behavior.

We realized that we need to distinguish between two different types of files that can be used by the `Integration`. One is tipically a text configuration file that should be parsed during the startup of the application to spot possible configuration properties. These files should be also made available in the classpath. We are providing these kind of files via `--config` flag.

According to the `kamel run --help`, the `--config`:
```
      --config stringArray             Add a runtime configuration from a Configmap, a Secret or a file (syntax: [configmap|secret|file]:name[/key], where  name represents the local file path or the configmap/secret name and key optionally represents the configmap/secret key to be filtered)

```
You will be able to provide a `Configmap`, a `Secret` or a local file. The new syntax is expecting you to declare the kind of resource ( _configmap_, _secret_ or _file_) and the name or local path where it is located. You may also specify the `Configmap`/`Secret` key, helping therefore to limit the exposure of information that will be needed in your integration.

The whole documentation is available on the [runtime configuration page](https://camel.apache.org/camel-k/latest/configuration/runtime-config.html). You can also refer the different examples provided in [Camel K example repository](https://github.com/apache/camel-k/tree/main/examples/user-config).

## Integration resources

The use case for `--resource` is generally to provide any kind of file available to your integration runtime. Opposed to `--config`, the resource will let you upload a binary or text resource (file, `Configmap` or `Secret`) that won't be parsed by the application looking for properties. The materialized file won't be even added to the classpath (you can do that via `jvm` trait, though).

Let's look at what the `kamel run --help` tells us about `--resource`:
```
      --resource stringArray           Add a runtime resource from a Configmap, a Secret or a file (syntax: [configmap|secret|file]:name[/key][@path], where name represents the local file path or the configmap/secret name, key optionally represents the configmap/secret key to be filtered and path represents the destination path)
```
The syntax is similar on what we had for `--config`. There is a slight powerful addition though. Within a resource we can specify the destination path (_@path_) where we expect the file to be materialized. With this new feature, you will be able to include any file to any destination needed directly through the CLI. As an example, you can check now how easy is to [setup an SSL certificate to your HTTP connection](https://github.com/apache/camel-k/blob/main/examples/http/PlatformHttpsServer.java).

Once you have stored your certificate in a `Secret`, for instance running:

```
kubectl create secret generic my-self-signed-ssl --from-file=server.key --from-file=server.crt
```

Then, the rest will be to let your integration know where to materialize those files. Using the `PlatformHttp` in Camel K, the result will be executing the following command:
```
kamel run PlatformHttpsServer.java -p quarkus.http.ssl.certificate.file=/etc/ssl/my-self-signed-ssl/server.crt \
                                   -p quarkus.http.ssl.certificate.key-file=/etc/ssl/my-self-signed-ssl/server.key \ 
                                   --resource secret:my-self-signed-ssl@/etc/ssl/my-self-signed-ssl \
                                   -t container.port=8443 --dev
```

We are leveraging the **Quarkus** properties to declare where the application is expecting to find the certificate and the key (via `--p` flag). We are also telling the `Integration` to create the files expected in the __my-self-signed-ssl__ `Secret` and to mount at __/etc/ssl/my-self-signed-ssl/__ directory.

You will find more details in the [runtime resource page official documentation](https://camel.apache.org/camel-k/latest/configuration/runtime-resources).html

## Warnings and limitations

We want to dedicate a last section to highlights certain checks that we've added. We think these will simplify your development by providing useful insight when using a feature in a wrong way:

* Warning if using a binary resource with a `--config`. This flag is meant to be used only for text configuration, you must use `--resource` instead.
* Warning if a `Configmap` or a `Secret` you're trying to use is not yet available in the `Namespace`. The `Integration` will be created, but the `Kubernetes` platform won't start until the resource is available.
* File `--config` or `--resource` limited to 1 MiB. This is a limitation of `Kubernetes`. As we store the file content within the `Integration`
 spec, we must ensure it won't break the related `Custom Resource` size limit.
* Destination path limitation. There are reserved paths that you won't be able to use.
