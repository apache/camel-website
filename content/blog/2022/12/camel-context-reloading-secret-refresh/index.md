---
title: "Load properties from Vault/Secrets cloud services: introducing Camel Context automatic refresh on secrets updates"
date: 2022-12-20
draft: false
authors: [oscerd]
categories: ["Camel"]
preview: "Starting from Camel 3.19.0 we are able to reload automatically the camel context on secret updates events"
---

Starting from Camel 3.19.0 we have four cloud services supported for loading properties as secrets:

- AWS Secret Manager
- Google Cloud Secret Manager
- Azure Key Vault
- Hashicorp Vault

One of the problems we faced in the development was related to finding a way to automatically refresh the secret value on the secrets update.

The main players in the cloud game are providing solutions based on their services:
AWS provides multiple ways to be notified about secret updates and secret rotations through AWS Cloudtrail or AWS Cloud events, GCP leverages Google Pubsub to deliver messages with events related to secret, 
while Azure provides multiple ways of getting notified about events related to a vault in the Azure Key Vault service, mostly by using Azure Eventgrid as an intermediate service.
Hashicorp Vault as of today doesn't provide an API to get secrets notification.

### Enabling Automatic Camel context reloading after Secrets Refresh 

#### AWS Secrets Manager

The automatic context reloading could be achieved through Camel's main properties. In particular, the authentication to AWS service (Cloudtrail) could be set through the default credentials provider or through access key/secret key/region credentials. The camel's main properties are:

```
camel.vault.aws.refreshEnabled=true 
camel.vault.aws.refreshPeriod=60000 
camel.vault.aws.secrets=Secret 
camel.main.context-reload-enabled = true
```

where `camel.vault.aws.refreshEnabled` will enable the automatic context to reload, `camel.vault.aws.refreshPeriod` is the interval of time between two different checks for update events, and `camel.vault.aws.secrets` is a regex representing the secrets we want to track for updates.
The property `camel.vault.aws.secrets` is not mandatory: if not specified the task responsible for checking updates events will take into account the properties with an aws: prefix.

The mechanism behind this feature, for what is related to AWS Secrets Manager, involves the AWS Cloudtrail service. The task will search for Secrets in camel properties associated with AWS prefixes and look for events in the Cloudtrail entries related to them. Once the task will find an update operation it will trigger the context reloading.

At the following URL, we provide a simple example through camel-jbang: [AWS Secrets Manager Example](https://github.com/apache/camel-kamelets-examples/tree/main/jbang/aws-secrets-manager)

#### Google Secret Manager

The automatic context reloading could be achieved through Camel's main properties. In particular, the authentication to Google service (Pubsub) could be set through the default google instance or through the service account key file. The camel's main properties are:

```
camel.vault.gcp.projectId= projectId 
camel.vault.gcp.refreshEnabled=true 
camel.vault.gcp.refreshPeriod=60000 
camel.vault.gcp.secrets=hello* 
camel.vault.gcp.subscriptionName=subscriptionName 
camel.main.context-reload-enabled = true
```

where `camel.vault.gcp.refreshEnabled` will enable the automatic context reloading, `camel.vault.gcp.refreshPeriod` is the interval of time between two different checks for update events, and `camel.vault.gcp.secrets` is a regex representing the secrets we want to track for updates.
The property `camel.vault.gcp.secrets` is not mandatory: if not specified the task responsible for checking updates events will take into account the properties with a gcp: prefix.
The `camel.vault.gcp.subscriptionName` is the subscription name created about the Google PubSub topic associated with the tracked secrets.

This mechanism while making use of the notification system related to Google Secret Manager: through this feature, every secret could be associated with one up to ten Google Pubsub Topics. These topics will receive events related to the life cycle of the secret.

At the following URL, we provide a simple example through camel-jbang: [Google Secret Manager Example](https://github.com/apache/camel-kamelets-examples/tree/main/jbang/gcp-secret-manager-reloading)

#### Azure Key Vault

The automatic context reloading could be achieved through Camel's main properties. In particular, the authentication to Azure service (Storage Blob) could be set through client id/client secret/tenant id. The camel's main properties are:

```
camel.vault.azure.refreshEnabled=true 
camel.vault.azure.refreshPeriod=60000 
camel.vault.azure.secrets=Secret 
camel.vault.azure.eventhubConnectionString=eventhub_conn_string 
camel.vault.azure.blobAccountName=blob_account_name 
camel.vault.azure.blobContainerName=blob_container_name 
camel.vault.azure.blobAccessKey=blob_access_key 
camel.main.context-reload-enabled = true
```

where `camel.vault.azure.refreshEnabled` will enable the automatic context to reload, `camel.vault.azure.refreshPeriod` is the interval of time between two different checks for update events, and `camel.vault.azure.secrets` is a regex representing the secrets we want to track for updates.
The property `camel.vault.azure.eventhubConnectionString` is the eventhub connection string to get notifications from, `camel.vault.azure.blobAccountName`, `camel.vault.azure.blobContainerName`, and `camel.vault.azure.blobAccessKey` are the Azure Storage Blob parameters for the checkpoint store needed by Azure Eventhub.
The property `camel.vault.azure.secrets` is not mandatory: if not specified the task responsible for checking updates events will take into account the properties with an azure: prefix.

At the following URL, we provide a simple example through camel-jbang: [Azure Key Vault Example](https://github.com/apache/camel-kamelets-examples/tree/main/jbang/azure-key-vault-secrets-reloading)

#### A real example

While working on the feature I tried to set up a real use-case scenario. In my case, I've been trying to update a database administrator password while a running camel integration was querying the database.

This is well explained in this example the reader could run through camel-jbang: [MySQL Database Password Refresh Example](https://github.com/apache/camel-kamelets-examples/tree/main/jbang/aws-database-admin-secrets-refresh)

### Future

In the next Camel development for what concerns the secret updates feature, we would like to provide the ability to select a different kinds of tasks/policies to trigger a context reloading. For example, we would like to support the secret rotations events coming from AWS Services supporting the rotation. This is in our roadmap.

If you find this feature useful and you feel there is something to improve, don't hesitate to contact us via the usual channels: [Camel Support](https://camel.apache.org/community/support/)

Thanks for your attention and see you online.
