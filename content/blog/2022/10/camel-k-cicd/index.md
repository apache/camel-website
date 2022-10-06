---
title: "Camel K CICD"
date: 2022-10-06
draft: false
authors: [squakez]
categories: ["Howtos", "Camel K", "Devops"]
preview: "Continuous Integration, Continuous Delivery and Continuous Deployment in Camel K"
---

In [Camel K version 10](/blog/2022/09/camel-k-release-1-10/), we've released the CLI [`promote` feature](/camel-k/1.10.x/running/promoting.html) that provides Camel K an opinionated way of promoting an Integration through the stages of software development. This feature unlock the possibility to combine Camel K with external tooling and let the user develop according to any automated release process. We always ear about CI/CD (Continuous Integration/Continuous Delivery and/or Deployment), and in this blog we're going to see how to make it for any Camel K integration.

The application I'm building is a REST API backed by a PostgreSQL database. It will be realized with Camel K Integration via YAML DSL. The source code is stored in Github and the idea is to build a **Continuous Delivery** pipeline that can be manually triggered when we want to provide a release. The pipeline will:

  1. checkout the code repository with the latest changes,
  2. release the Integration in a development environment,
  3. run a complete suite of automated test,
  4. promote to production environment and
  5. run some smoke test on the production endpoints as last check stage.

It should sound quite a familiar development process. We may just need to implement the first 3 tasks as a basic **Continuous Integration**, but, given the presence of `kamel promote` we can easily extend it to a CD pipeline. But that's not all. As an additional feature we're finally reusing the CD to enable a **Continuous Deployment** process triggering the pipeline when any change is pushed to the repo. Your journey from code to production has never been that fast!!

As a supporting pipeline application, I've chosen to use Tekton because it gives us the flexibility needed to run all the tasks required. However, you may adapt this example to any other pipeline application out there, the concepts are very generic.

# Tekton installation

Let's start installing Tekton. You can install Tekton pipelines operator following the [Tekton official installation guide](https://tekton.dev/docs/pipelines/install/#installing-tekton-pipelines-on-kubernetes).

# Camel K operator installation

We need now to prepare the Kubernetes namespaces that we're using to separate **development** and **production** environment.
```
kubectl create namespace development
kubectl create namespace production
kamel install -n development
kamel install -n production -x camel-k-prod
```
NOTE: make sure development and production operators share the same container registry as required by `kamel promote`.

# Application development

You can find the source code in this [Camel K REST example github repository](https://github.com/squakez/camel-k-rest-cicd).

## Camel K Integration

We're programming through YAML DSL, but here you can put any Camel DSL you prefer:

```
# camel-k: dependency=mvn:io.quarkus:quarkus-jdbc-postgresql
# camel-k: build-property=quarkus.datasource.camel.db-kind=postgresql
# camel-k: config=secret:my-datasource
# camel-k: trait=service.node-port=true

- rest:
    get:
      - to: "direct:get"
        path: "/customers/{name}"
      - to: "direct:getall"
        path: "/customers/"
    post:
      - to: "direct:post"
        path: "/customers/"
    delete:
      - to: "direct:delete"
        path: "/customers/{name}"
- from:
    uri: "direct:getall"
    steps:
      - set-body:
          simple: "select * from customers"
      - to: log:info
      - to: jdbc:camel
      - set-body:
          simple: "${bodyAs(String)}"
- from:
    uri: "direct:get"
    steps:
      - set-body:
          simple: "select * from customers where name='${header.name}'"
      - to: log:info
      - to: jdbc:camel
      - set-body:
          simple: "${bodyAs(String)}"
- from:
    uri: "direct:post"
    steps:
      - unmarshal:
          json: 
            library: Jackson        
      - to: log:info
      - set-body:
          simple: "insert into customers (name, city) values ('${body[name]}', '${body[city]}')"
      - to: jdbc:camel

- from:
    uri: "direct:delete"
    steps:
      - set-body:
          simple: "delete from customers where name = '${header.name}'"
      - to: log:info
      - to: jdbc:camel  
``` 

## Database preparation

As you may have noticed, the Integration above requires a Postgres database. In the repo, I've provided a very basic configuration for a development and a production environment.

```
kubectl apply -f db/conf-dev.yaml -n development
kubectl create secret generic my-datasource --from-file db/datasource-dev.properties -n development

kubectl apply -f db/conf-prod.yaml -n production
kubectl create secret generic my-datasource --from-file db/datasource-prod.properties -n production
```

In this example, I've chosen to deploy the two separated databases in the same namespaces of the applications. You may follow any other topology required by your organization.

NOTE: the database settings are not meant to be used in any production environment without applying proper security policies. The Pod running is ephemeral, so, anything stored there will be lost when restarting.

### Initialize DB

Before starting any activity, we need to create a table as required by our application:

```
kubectl exec -it postgres-dev-xxxxxxxx-yyyyy -n development -- psql -U postgresadmin --password postgresdb -c 'CREATE TABLE customers (name TEXT PRIMARY KEY, city TEXT)'

kubectl exec -it postgres-prod-xxxxxxxx-yyyyy -n production -- psql -U postgresadmin --password postgresdb -c 'CREATE TABLE customers (name TEXT PRIMARY KEY, city TEXT)'
```

We have our baseline installed. You can even run manually the Integration and it should work correctly. But we don't like manual stuff, do we? Checking endpoint in a browser and visually confirm all is good, then promoting the Integration and running another round of verification. We prefer having an automated pipeline and dedicate all our time to code new features instead!

# Continuous Integration and Continuous Delivery pipeline

As I mentioned at the beginning, our pipeline will take care to automatically checkout the code from the repository and run a series of tasks to run and verify that all is working as expected. This is quite straightforward translated into code:

```
apiVersion: tekton.dev/v1beta1
kind: Pipeline
metadata:
  name: pipeline-cicd
spec:
  description: | 
    CICD pipeline for a microservice
  params:
  - name: repo-url
    type: string
    description: The git repo URL to clone from.
  - name: repo-branch
    type: string
    description: The git repo branch.    
  workspaces:
  - name: shared-data
    description: | 
      This workspace contains the cloned repo files, so they can be read by the
      next task.
  tasks:
  # 1. checkout the code repository with the latest changes, 
  - name: fetch-source
    taskRef:
      name: git-clone
    workspaces:
    - name: output
      workspace: shared-data
    params:
    - name: url
      value: $(params.repo-url)
    - name: revision
      value: $(params.repo-branch)      
  # 2. release the Integration in a development environment,
  - name: kamel-run
    runAfter: ["fetch-source"]
    taskRef:
      name: kamel-run
    workspaces:
    - name: source
      workspace: shared-data      
    params:
      - name: filename
        value: my-rest.yaml
      - name: namespace
        value: development
  # 3. run a complete suite of automated test,
  - name: e2e-test
    runAfter: ["kamel-run"]
    taskRef:
      name: execute-test
    workspaces:
    - name: source
      workspace: shared-data
    params:
      - name: script
        value: test/e2e-test.sh    
      - name: hostname
        value: $(tasks.kamel-run.results.integration-name).development
  # 4. promote to production environment and 
  - name: kamel-promote
    runAfter: ["e2e-test"]
    taskRef:
      name: kamel-promote
    workspaces:
    - name: source
      workspace: shared-data      
    params:
      - name: integration-name
        value: $(tasks.kamel-run.results.integration-name)
      - name: namespace
        value: development
      - name: to
        value: production
  # 5. run some smoke test on the production endpoints as last check stage.
  - name: smoke-test
    runAfter: ["kamel-promote"]
    taskRef:
      name: execute-test
    workspaces:
    - name: source
      workspace: shared-data
    params:
      - name: script
        value: test/smoke-test.sh    
      - name: hostname
        value: $(tasks.kamel-run.results.integration-name).production  
```

The `Pipeline` expect from us to provide just a `repo-url` and a `repo-branch`. The repo will contain the Integration source code but to also the suite of test, so that everything is self-contained and "consumable" from the same pipeline. Also CI configuration is there (someone would call this **devops**...). We use a `workspace` that is a way provided by Tekton to share resources among the different tasks (which will run as a separate `Pod`).

As you can see, we have configured several `Tasks` and we can see them in details.

The `git-clone` task is taken from [Tekton hub](https://hub.tekton.dev/tekton/task/git-clone) and it is in charge to checkout the code. You can see the detailed configuration in the documentation page.

The `kamel-run` task is in charge to run an Integration in a given namespace. It accepts a source filename (the Integration code) and the namespace where to run
the Integration. The output is the name of the integration (we will need it both for testing and for following promotion):
```
apiVersion: tekton.dev/v1beta1
kind: Task
metadata:
  name: kamel-run
  description: Run an integration with Kamel CLI
spec:
  params:
    - name: filename
      description: the integration source we want to run
    - name: namespace
      description: the namespace where to run the integration
  results:
    - name: integration-name
      description: The name of the integration    
  workspaces:
  - name: source
  steps:
  - name: run
    # The container provides the kamel binary we need
    image: docker.io/apache/camel-k:1.10.0
    script: |
      cd $(workspaces.source.path)
      # Run the integration and let's use the output to scrape the integration name
      # We need to use the --wait option in order to wait until the Integration is running
      kamel_output=$(kamel run $(params.filename) -n $(params.namespace) --wait)
      echo $kamel_output | grep -oP 'Integration ".*?" (updated|created)' | awk -F ' ' '{print $2}' | sed "s/\"//g" | tr -d '\n' | tee $(results.integration-name.path)
```
Interesting to note that for this task we're using `image: docker.io/apache/camel-k:1.10.0` that have the `kamel` CLI configured (and that's exactly what we need for this task).

Then we can identify a generic `execute-test` task that we're reusing both for end to end test and smoke test (phases 3 and 5). This is in charge to run any arbitrary script and in our case they are `curl` commands that are testing the API endpoints. You can see that they expect a script file and an hostname (which represents the Integration service host to test):

```
apiVersion: tekton.dev/v1beta1
kind: Task
metadata:
  name: execute-test
  description: Execute some smoke test
spec:
  params:
    - name: script
      description: the script to execute 
    - name: hostname
      description: the hostname we want to test
  workspaces:
  - name: source
  steps:
  - name: test
    # use any image containing the tooling required by your test
    image: alpine/curl
    script: |
      cd $(workspaces.source.path)
      $(params.script) $(params.hostname)
```

The test in our case is simple (ie, we are using `alpine/curl`), but you can have here as much as complexity as your suite of test requires:

```
# Create a user
curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"name":"my-name","city":"my-city"}' \
  http://$1/customers/
# Read the user
HTTP_GET=$(curl -o /dev/null -s -w "%{http_code}\n" http://$1/customers/my-name)
if [[ "$HTTP_GET" != "200" ]]; then
    echo "ERROR: expected a 200 HTTP code"
    exit 1
fi
# Delete the user
HTTP_DELETE=$(curl -o /dev/null -s -w "%{http_code}\n" --request DELETE http://$1/customers/my-name)
if [[ "$HTTP_DELETE" != "200" ]]; then
    echo "ERROR: expected a 200 HTTP code"
    exit 2
fi
```
So far, we may stop if we're just interested in a CI pipeline. But you can see that with a bit of automation, we can get the benefit of a full CD solution. The last `Task` we can develope is the `kamel-promote` that is very similar to the `kamel-run`, but takes care to perform the environment promotion:

```
apiVersion: tekton.dev/v1beta1
kind: Task
metadata:
  name: kamel-promote
  description: promote an Integration to an higher environment
spec:
  params:
    - name: integration-name
      description: the integration we want to promote
    - name: namespace
      description: the namespace source
    - name: to
      description: the namespace destination           
  workspaces:
  - name: source
  steps:
  - name: promote
    image: docker.io/apache/camel-k:1.10.0
    script: |
      kamel promote $(params.integration-name) -n $(params.namespace) --to $(params.to)
```

Finally we need to configure a `PipelineRun` which is in charge to run the pipeline (in this case it will be manually triggered):

```
apiVersion: tekton.dev/v1beta1
kind: PipelineRun
metadata:
  name: pipeline-cicd-run
spec:
  pipelineRef:
    name: pipeline-cicd
  taskRunSpecs:
    - pipelineTaskName: kamel-run
      taskServiceAccountName: camel-k-pipeline-sa
    - pipelineTaskName: kamel-promote
      taskServiceAccountName: camel-k-pipeline-sa
  podTemplate:
    securityContext:
      fsGroup: 65532
  workspaces:
  - name: shared-data
    volumeClaimTemplate:
      spec:
        accessModes:
        - ReadWriteOnce
        resources:
          requests:
            storage: 1Gi
  - name: git-credentials
    secret:
      secretName: git-credentials
  params:
  - name: repo-url
    value: https://github.com/squakez/camel-k-rest-cicd.git
  - name: repo-branch
    value: main
```

You can see that we provide here the repository information plus some `Service Account` configuration required for the `kamel-run` and `kamel-promote` tasks.

## Install the pipeline

Before running the pipeline we need to create a service account in the development namespace in order to be able to work both on `development` and `production`:

```
kubectl apply -f ci/sa.yaml -n development
kubectl apply -f ci/rolebinding.yaml -n development
```

We also need to install the [`git-clone` task from Tekton hub](https://hub.tekton.dev/tekton/task/git-clone) in `development` namespace:

```
kubectl apply -f https://raw.githubusercontent.com/tektoncd/catalog/main/task/git-clone/0.8/git-clone.yaml -n development
```

We can now install the pipeline (we have merged also the `Tasks` within it):

```
kubectl apply -f ci/pipeline.yaml -n development
```

### Run the pipeline

The pipeline is installed and ready to go. It only miss someone to pull the trigger. Let's dare:

```
kubectl apply -f ci/pipeline-run.yaml -n development
```

We should be able to monitor it by running:

```
kubectl get pipelinerun pipeline-cicd-run -w -n development
```

If there is any error, the process will stop and we can check pipeline more in details via:

```
kubectl get pipelinerun pipeline-cicd-run -o yaml -n development
```

If all is good, we'll have an Integration running in `development` namespace (the `promote` does not care to stop it) and one running in `production` namespace (possibly the one exposed to the world).

# Continuous Deployment

We have everything we need now to continue with the latest step of automation that will be triggering our process as soon as we have our code pushed to the repo. This last `Trigger` will transform our pipeline in a **Continuous Deployment** pipeline. The solution proposed is based on the blog posted originally at https://www.arthurkoziel.com/tutorial-tekton-triggers-with-github-integration/

The idea is to expose a webhook that will take care to trigger the pipeline. We can configure Github (or Gitlab or any other Git repository type) to call that webhook on each push to the repo (or Pull Request, or any action you need according to your development process).

Once a user `push` some code to the repo, then, our `Pipeline` will start, resulting in the source code released in production right away.

## Pipeline code

The repository we're using as example, has a `feat/cd` branch where you can find all the code required. In the `cd` directory you can find all you need to run the example.

### Install triggers

We first need to [install the Tekton `Triggers`](https://tekton.dev/docs/triggers/install/) as described in the official documentation. Once this is done, we'll need some configuration for a `Service Account`. You can find the configuration required in the `cd` folder of our example project:

```
kubectl apply -f cd/cd-triggers-sa.yaml -n development
```

### Listen for a push

Now we can have provide all the required configuration to let our cluster wait for a git push event. We start defining an `EventListener`:

```
apiVersion: triggers.tekton.dev/v1alpha1
kind: EventListener
metadata:
  name: github-push
spec:
  serviceAccountName: tekton-triggers-cd
  triggers:
    - name: github-listener
      interceptors:
        - ref:
            name: "github"
          params:
            # You may want to include a secure interceptor
            - name: "eventTypes"
              value: ["push"]
      template:
        ref: github-push-pipeline-template
```

This one will be in charge to filter the call received by the webhook. You can see that there is already defined an `interceptor` whose goal is to filter the events we accept. For the sake of simplicity, I've just provided an example interceptor to filter only the `push` events. In a real environment you probably want to secure the incoming requests with some authorization token. The `github` interceptor will allow you to provide any kind of security.

The other thing we have provided is a `template` referenced to `github-push-pipeline-template`, that is the trigger we want to pull when a `push` event is received. Let's look how this `TriggerTemplate` is declared:

```
apiVersion: triggers.tekton.dev/v1alpha1
kind: TriggerTemplate
metadata:
  name: github-push-pipeline-template
spec:
  resourcetemplates:
    - apiVersion: tekton.dev/v1beta1
      kind: PipelineRun
      metadata:
        generateName: github-push-pipeline-run-
      spec:
        pipelineRef:
          name: pipeline-cicd
        taskRunSpecs:
          - pipelineTaskName: kamel-run
            taskServiceAccountName: camel-k-pipeline-sa
          - pipelineTaskName: kamel-promote
            taskServiceAccountName: camel-k-pipeline-sa
        podTemplate:
          securityContext:
            fsGroup: 65532
        workspaces:
        - name: shared-data
          volumeClaimTemplate:
            spec:
              accessModes:
              - ReadWriteOnce
              resources:
                requests:
                  storage: 1Gi
        params:
        - name: repo-url
          value: https://github.com/squakez/camel-k-rest-cicd.git
        - name: repo-branch
          value: feat/cd
```
It should sound very familiar as it is a template based on the `Trigger` we've developed previously. It takes care to call the same `Pipeline` but this time will generate a new name every time (required because we don't call the `PipelineRun` explicitly) and it will work over the `feat/cd` branch.

Both yaml are merged into a single configuration:

```
kubectl apply -f cd/cd-triggers.yaml -n development
```

Now everyting is ready but the last step required is to create an `Ingress` webhook and bind to the `EventListener` so that, everytime the webhook is called, a `Pipeline` is started.

```
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-cd-pipeline
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/ssl-redirect: "false"
spec:
  rules:
    - http:
        paths:
          - path: /my-cd-pipeline
            pathType: Exact
            backend:
              service:
                # Will forward events to an EventListener called github-push
                name: el-github-push
                port:
                  number: 8080
```
It's important to notice how we "linked" the `Ingress` to a `Service` named `el-github-push`. This service is created by the `EventListener` by prepending `el-` to the listener name.

NOTE: you may want to enable the addon on minikube via `minikube addons enable ingress`

```
kubectl apply -f wh-ingress.yaml -n development
```

We're ready to see what is the host we need to call to trigger the `Pipeline`:

```
kubectl get ingress -n development
```

NOTE: if you want to use this on minikube you can see the local host via `minikube service list` (to simuate a webhook post locally)

So, now we're ready to configure our Github repository and wait for any code change that will trigger our CD pipeline. We can start watching it in the while:

```
kubectl get pipelinerun -n development -w
```

### Github repository configuration

We need now to go on our Github repository and configure the webhook. Enter in "Settings >> Webhooks" and create a new Webhook. You will need to fill the form with a "Payload URL" (take the host appearing in the `kubectl get ingress -n development` and use as http://1.2.3.4/my-cd-pipeline), a "Content type" (application/json) and a secret (you may skip this as we did not configure the secret on the `EventListener`). You can also choose the events to send. In our case we're interested in the `push` only, but your pipeline may require to be triggered when other events on the repo happen. Once done, you can have a look at the result of the test `ping` that it's sent after your first setting.

You can also watch the `Pod` created by the event listener to see if the `ping` has reached out your cluster:

```
k logs -n development el-github-push-674dcb5f4-blbrb -f
```

If all is good, let's keep monitoring that `Pod` and make any change to your repository. As soon as you push, you should see it flowing in your log like:

```
{"severity":"info","timestamp":"2022-10-04T11:02:30.537Z","logger":"eventlistener","caller":"sink/sink.go:409","message":"ResolvedParams : []","eventlistener":"github-push","namespace":"development","/triggers-eventid":"b7fda1d3-044e-402a-b2c2-900afd849681","eventlistenerUID":"98b1322c-1793-425a-8577-8fec3e708b3f","/triggers-eventid":"b7fda1d3-044e-402a-b2c2-900afd849681","/trigger":"github-listener"}
{"severity":"info","timestamp":"2022-10-04T11:02:30.539Z","logger":"eventlistener","caller":"resources/create.go:98","message":"Generating resource: kind: &APIResource{Name:pipelineruns,Namespaced:true,Kind:PipelineRun,Verbs:[delete deletecollection get list patch create update watch],ShortNames:[pr prs],SingularName:pipelinerun,Categories:[tekton tekton-pipelines],Group:tekton.dev,Version:v1beta1,StorageVersionHash:RcAKAgPYYoo=,}, name: github-push-pipeline-run-"}
{"severity":"info","timestamp":"2022-10-04T11:02:30.539Z","logger":"eventlistener","caller":"resources/create.go:106","message":"For event ID \"b7fda1d3-044e-402a-b2c2-900afd849681\" creating resource tekton.dev/v1beta1, Resource=pipelineruns"}
```

That means the `Pipeline` was triggered and in a few minutes you should have your shining new feature available in production!

### Test webhook locally

During the development of your pipeline (or if you want to use a local cluster such as `minikube`), you may be interested in simulating the push event. This should be as easy as running something like:

```
http post http://192.168.49.2:32698/my-cd-pipeline X-GitHub-Event:push json=test
```

# Conclusion

It was a long post, but, I am sure you appreciated the effort we've put in wrapping up all the resources required to have a full CICD experience on a Camel K integration. The possibility offered by Tekton or any other pipeline application on Kubernetes are a great complement on the experience we are providing with the `kamel promote` feature.

## Caveat

While working on this blog, I've spotted a problem that may [prevent you updating the Integration](https://github.com/apache/camel-k/issues/3673) via `kamel promote` on a production environment. It was promptly fixed and available by using `1.11` or `1.10` nightly releases. You can change the `Tasks` configured to use `docker.io/testcamelk/camel-k:1.11.0-nightly` instead of `docker.io/apache/camel-k:1.10.0`
