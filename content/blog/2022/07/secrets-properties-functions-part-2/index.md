---
title: "Load properties from Vault/Secrets cloud services: an update"
date: 2022-07-26
draft: false
authors: ["oscerd"]
categories: ["Camel"]
preview: "An update about loading properties from a Cloud vault service"
---

In Camel 3.16.0 we introduced the ability to load properties from vault and use them in the Camel context.

This post aims to show the updates and improvements we've done in the last two releases.

### Supported Services

In 3.16.0 we're supporting two of the main services available in the cloud space:

- AWS Secret Manager
- Google Cloud Secret Manager

In 3.19.0, to be released, we're going to have four services available:

- AWS Secret Manager
- Google Cloud Secret Manager
- Azure Key Vault
- Hashicorp Vault

### Setting up the Properties Function 

Each of the Secret management cloud services require different parameters to complete authentication and authorization.

For both the Properties Functions currently available we provide two different approaches:
- Environment variables
- Main Configuration properties

You already have the information for AWS and GCP in the old blog post.

Let's explore Azure Key Vault and Hashicorp Vault.

#### AWS Secrets Manager

The Azure Key Vault Properties Function configurations through enviroment variables are the following:

```
export $CAMEL_VAULT_AZURE_TENANT_ID=tenantId
export $CAMEL_VAULT_AZURE_CLIENT_ID=clientId
export $CAMEL_VAULT_AZURE_CLIENT_SECRET=clientSecret
export $CAMEL_VAULT_AZURE_VAULT_NAME=vaultName
```

While as Main Configuration properties it is possible to define the credentials through the following:

```
camel.vault.azure.tenantId = accessKey
camel.vault.azure.clientId = clientId
camel.vault.azure.clientSecret = clientSecret
camel.vault.azure.vaultName = vaultName
```

To recover a secret from azure you might run something like:

```xml
<camelContext>
    <route>
        <from uri="direct:start"/>
        <to uri="{{azure:route}}"/>
    </route>
</camelContext>
```


#### Hashicorp Vault

The Hashicorp Vault Properties Function configurations through enviroment variables are the following:

```
export $CAMEL_VAULT_HASHICORP_TOKEN=token
export $CAMEL_VAULT_HASHICORP_ENGINE=secretKey
export $CAMEL_VAULT_HASHICORP_HOST=host
export $CAMEL_VAULT_HASHICORP_PORT=port
export $CAMEL_VAULT_HASHICORP_SCHEME=http/https
```

While as Main Configuration properties it is possible to define the credentials through the following:

```
camel.vault.hashicorp.token = token
camel.vault.hashicorp.engine = engine
camel.vault.hashicorp.host = host
camel.vault.hashicorp.port = port
camel.vault.hashicorp.scheme = scheme
```

To recover a secret from Hashicorp Vault you might run something like:

```xml
<camelContext>
    <route>
        <from uri="direct:start"/>
        <to uri="{{hashicorp:route}}"/>
    </route>
</camelContext>
```


### Multi fields Secrets and Default value

As for AWS Secrets Manager and Google Secrets Manager, the multi fields secrets and default value are both supported by Azure Key Vault and Hashicorp Vault Properties functions.

### Versioning

In the next Camel version we are going to release the support for recovering a secret with a particular version. This will be supported by all the vault we currently support in Camel.

In particular you'll be able to recover a specific version of a secrets with the following syntax.

```xml
<camelContext>
    <route>
        <from uri="direct:start"/>
        <log message="Username is {{hashicorp:database/username:admin@2}}"/>
    </route>
</camelContext>
```

In this example we're going to recover the field username from the secret database, with version "2". In case the version is not available, we're going to have a default value of 'admin'.

### Future

We plan to work on the ability to reload the whole context once a secret has been rotated or updated. This is something still in the design phase, but we really would like to see it implemented soon.

Stay tuned for more news!

