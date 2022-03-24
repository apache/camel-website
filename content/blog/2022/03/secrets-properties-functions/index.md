---
title: "Camel 3.16.0 new feature: Load properties from Vault/Secrets cloud services"
date: 2022-03-24
draft: false
authors: ["oscerd"]
categories: ["Camel"]
preview: "How to retrieve properties from a Cloud vault service"
---

In the last weeks, together with Claus, we've been working on a new feature: loading properties from Vault/Secrets cloud services.

It will arrive with Camel 3.16.0, currently on vote and to be released by the end of this week (24/3).

This post introduces the new features and provide some examples.

## Secrets Management in Camel

In the past there were many discussions around the possibility of managing secrets in Camel through Vault Services. 

The hidden troubles are a lot when we talk about Secrets Management:
- Ability to automatically retrieve secrets after a secret rotation has been completed
- Writing the function (script, serverless function etc.) to operate the rotation
- Being notified once a rotation happens

We choose to start from the beginning: retrieve secrets from a vault service and use them as properties in the Camel configuration.

### Supported Services

In 3.16.0 we're supporting two of the main services available in the cloud space:

- AWS Secret Manager
- Google Cloud Secret Manager

### How it works

The Vault feature works by specifying a particular prefix while using the Properties component.

For example for AWS:

```
<camelContext>
    <route>
        <from uri="direct:start"/>
        <log message="Username is {{aws:username}}"/>
    </route>
</camelContext>
```

or

```
<camelContext>
    <route>
        <from uri="direct:start"/>
        <log message="Username is {{gcp:username}}"/>
    </route>
</camelContext>
```

This notation will allow to run the following workflow while starting a camel route:
- Connect and authenticate to AWS Secret Manager (or GCP)
- Retrieve the value related to the secret named `username`
- Substitute the property with the secret value just returned

For using the particular Properties Function the two requirements are adding the `camel-aws-secret-manager` JAR for using the AWS one or 
adding the `camel-google-secret-manager` JAR for GCP and setting up the credentials to access the cloud service.

### Setting up the Properties Function 

Each of the Secret management cloud services require different parameters to complete authentication and authorization.

For both the Properties Functions currently available we provide two different approaches:
- Environment variables
- Main Configuration properties

#### AWS Secrets Manager

The AWS Secret Manager Properties Function configurations through enviroment variables are the following:

```
export $CAMEL_VAULT_AWS_USE_DEFAULT_CREDENTIALS_PROVIDER=accessKey
export $CAMEL_VAULT_AWS_SECRET_KEY=secretKey
export $CAMEL_VAULT_AWS_REGION=region
```

While as Main Configuration properties it is possible to define the credentials through the following:

```
camel.vault.aws.accessKey = accessKey
camel.vault.aws.secretKey = secretKey
camel.vault.aws.region = region
```

The above examples are not considering the Default Credentials Provider chain coming from AWS SDK, but the Properties Function can be configured even in that way. This is how to do that through enviroment variables:

```
export $CAMEL_VAULT_AWS_USE_DEFAULT_CREDENTIALS_PROVIDER=true
export $CAMEL_VAULT_AWS_REGION=region
```

This could be done even with main configuration properties:

```
camel.vault.aws.defaultCredentialsProvider = true
camel.vault.aws.region = region
```

#### GCP Secret Manager

The GCP Secret Manager Properties Function configurations through enviroment variables are the following:

```
export $CAMEL_VAULT_GCP_SERVICE_ACCOUNT_KEY=file:////path/to/service.accountkey
export $CAMEL_VAULT_GCP_PROJECT_ID=projectId
```

While as Main Configuration properties it is possible to define the credentials through the following:

```
camel.vault.gcp.serviceAccountKey = accessKey
camel.vault.gcp.projectId = secretKey
```

The above examples are not considering the Default Credentials Provider coming from GCP, but the Properties Function can be configured even in that way. This is how to do that through enviroment variables:

```
export $CAMEL_VAULT_GCP_USE_DEFAULT_INSTANCE=true
export $CAMEL_VAULT_GCP_PROJECT_ID=projectId
```

This could be done even with main configuration properties:

```
camel.vault.gcp.useDefaultInstance = true
camel.vault.aws.projectId = region
```

### Multi fields Secrets

Some of the Secret manager services allow users to create multiple fields in a secret, like for example:

```
{
  "username": "admin",
  "password": "password123",
  "engine": "postgres",
  "host": "127.0.0.1",
  "port": "3128",
  "dbname": "db"
}
```

Usually the format of the secret will be a JSON. With the Properties Function related to secrets we can retrieve a single value of the secret and use it. As example:

You're able to do get single secret value in your route, like for example:

```
<camelContext>
    <route>
        <from uri="direct:start"/>
        <log message="Username is {{gcp:database/username}}"/>
    </route>
</camelContext>
```

In this route the property will be replaced by the field `username` of the value of the secret named `database`.

### Default Values

It is possible to fallback to a default value. Taking back the example above, we could use:

You could specify a default value in case the particular field of secret is not present on GCP Secret Manager:

```
<camelContext>
    <route>
        <from uri="direct:start"/>
        <log message="Username is {{gcp:database/username:admin}}"/>
    </route>
</camelContext>
```

And in case something is not working, like authentication fails, secret doesn't exists or service is down, the value returned will be `admin`.

### Future

In the next Camel version we are planning to work on more Secret Management Services. In particular we want to add two main components to the list:

- Azure Key Vault
- Hashicorp Vault

Follow the Camel's development to know more about the work in progress.

Use the Properties Functions in your projects and give us feedback, once the release 3.16.0 will be out (it's on vote in these days).

Stay tuned!

