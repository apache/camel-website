---
title: "TypeSafe Jev meets Apache Camel: semantic decisions in Camel routes"
date: 2026-09-24
draft: false
authors: [ luigidemasi ]
categories: ["AI", "EIP"]
keywords: ["apache camel", "typesafe ai", "jev", "system one", "semantic evaluation", "yaml", "routing", "validation"]
preview: "Use Camel's Semantic language with Jev to classify messages, score ticket severity, validate actions, group related feedback, and review outgoing messages in camel routes."
---

Jev is gaining momentum, and there is a reason why: it addresses a practical problem in automation. Many workflows need a model to make a small, specific judgment:

- *Which team should handle this request?*
- *How severe is this reported issue?*
- *Does this action fit the approved task?*

[TypeSafe AI built Jev as a System One model](https://typesafe.ai/blog/introducing-system-one-models-and-jev), designed for **fast, structured decisions**. Give it the relevant state and a question, and it returns a category, a score or a probability that your application can use directly.

When every message needs a decision, inference latency becomes part of the route's processing time.
A general-purpose generative LLM can answer these questions, but its generation overhead can be costly for a small judgment
repeated throughout a workflow.
System One models target this role with structured decisions designed for low latency.

For an integration developer, the appeal is concrete. We can use a model to judge the meaning of a customer message,
then let ordinary code decide what happens next.
<br/>
<br/>
A **category** selects a support team.
<br/>
A **probability** feeds a validation predicate.
<br/>
A **score** helps prioritize support tickets.
<br/>
<br/>
**Camel still controls the workflow:** destinations, permissions, retry budgets and failure handling.

An ecosystem is starting to form around this approach:

- **[Jev](https://typesafe.ai/)** provides typed decisions through TypeSafe's hosted service.
- **[Laya](https://github.com/NandhaKishorM/laya)** offers open model weights for typed decisions.
- **[System One SDK](https://github.com/asynq-io/system-one)** provides a Python interface to hosted and local backends.
- **[System One Models](https://systemonemodels.org/)** is an independent directory of models, use cases, examples and guides.

Open-weight models such as [Laya](https://huggingface.co/convaiinnovations/laya) also make local deployment practical.
With checkpoints containing hundreds of millions of parameters and support for CPU and GPU execution,
they can run as an inference service alongside Camel—even on the same machine.
This avoids a round trip to a hosted provider, while performance still depends on the hardware and the amount of context being evaluated.

**`camel-semantic` is the abstraction your routes use.** It exposes semantic decisions as Camel expressions and predicates, making them available to existing EIPs and control flow independently of the model provider.

Provider integration happens behind an adapter. In these examples, [`camel-typesafe-ai`](/components/next/typesafe-ai-component.html) supplies that adapter and delegates inference to TypeSafe AI’s Jev models. **Other System One model providers can plug into the same abstraction through compatible adapters**, keeping provider-specific APIs and request handling out of your routes.

We'll follow a support workflow through six practical examples, using YAML throughout: classify and filter requests, score ticket severity, validate proposed actions, group related feedback, and check outgoing replies.

> **Version requirement:** These examples require **Camel 4.23 or later**. Before the 4.23 release, use a current `4.23.0-SNAPSHOT` build and keep all Camel dependencies on the same version.
>
> The Semantic language is initially available with *Preview* support status.

## What a System One model returns

[TypeSafe AI describes Jev](https://docs.typesafe.ai/introduction) as a System One model: it evaluates questions about supplied state and returns structured decisions. Its three primitives map to familiar route operations:

| TypeSafe question | Result | Camel use |
| --- | --- | --- |
| Choice | One supplied category, with probabilities and confidence | Store the category, then route on it |
| Noul | A probability that a statement is true | Apply a threshold to obtain a predicate |
| Score | A position on a predefined rating scale, with probabilities and confidence | Store the score, then compare or sort |

A general-purpose LLM with structured output can also perform these classifications. **System One models are designed around focused, typed decisions**, with probability information the application can use. With `camel-semantic`, those results become ordinary Camel expressions and predicates.

**Camel makes this straightforward:** once the provider is configured, you declare a question and reference it from a Filter or Validate step. The route keeps control of what happens next, including business rules and failure handling.

For example:

- *“Which department handles this request?”* has a small, predefined answer set.
- *“Does this action fit the approved task?”* is a yes/no judgment.
- *“How severe is the reported issue?”* uses an ordered scale with descriptions of the impact at each level.

**Keep questions narrow** and give the model the relevant context. Separate questions can evaluate separate concerns; Camel combines their results and controls the workflow. A structured result can still be wrong, so evaluate questions and thresholds against representative messages before relying on them.

Treat incoming messages and generated proposals as untrusted data. [Jev 1.13 can be influenced by misleading or adversarial wording](https://docs.typesafe.ai/model-jaggedness/jev-1.13#adversarial-content). Semantic evaluation supplements deterministic checks; it does not establish identity or grant permissions.

## A common Camel layer for System One models

`camel-semantic` is **Camel's abstraction layer above System One model providers**. It exposes semantic decisions as standard Camel expressions and predicates, so they can participate directly in existing EIPs and control flow:

- **Choice:** select a branch using a semantic decision.
- **Filter and Validate:** check whether a message should proceed.
- **Loop:** decide whether another iteration is needed.
- **Redelivery:** decide whether an operation is worth retrying.

Question declarations define the instructions, select the state to evaluate and set the decision policy. Routes reference those questions by name. A provider adapter performs the evaluation and returns the result through a common contract. This keeps provider-specific request and response handling out of the route's decision logic.

`camel-typesafe-ai` supplies **the Jev adapter for `camel-semantic`**. The component handles communication with TypeSafe AI, including credentials, HTTP transport, timeouts and concurrency limits. Its adapter:

- Translates Camel's question definitions into TypeSafe requests.
- Queries Jev with the selected message state.
- Maps Jev's answers back to Camel's common semantic results.

For a boolean question, the adapter requests a Noul probability from Jev, and Camel applies the configured threshold and uncertainty policy to produce a predicate result. A category can be evaluated once, stored in an exchange variable and used by ordinary Choice branches. Loop and redelivery predicates can use semantic decisions while retaining explicit iteration and retry limits in the route.

Every example below invokes the **`semantic` language** from the route. Camel delegates evaluation to the TypeSafe adapter, which queries Jev and returns the result to the EIP.

With the TypeSafe adapter as the sole provider on the classpath, Camel discovers it automatically. **Each semantic invocation performs an evaluation**; results are reused only when the route stores them explicitly.

## Configure the provider

The examples use `camel-yaml-dsl`, `camel-semantic` and `camel-typesafe-ai`, all at the **same Camel version**.

The adapter uses the TypeSafe AI component configuration. For Camel Main or JBang, put these settings in `application.properties`:

```properties
camel.component.typesafe-ai.api-key={{env:TYPESAFE_API_KEY}}
camel.component.typesafe-ai.model=jev-1.13.0
camel.component.typesafe-ai.request-timeout=5000
camel.component.typesafe-ai.max-concurrent-requests=8
```

Provide `TYPESAFE_API_KEY` through your deployment environment. The five-second timeout is an example budget, not a latency claim.

The limit of eight concurrent requests is shared by semantic questions using the adapter's endpoint. Excess evaluations fail immediately instead of being queued. HTTP errors, timeouts and malformed responses follow Camel's normal error handling.

**Pin the [model version](https://docs.typesafe.ai/models)** when tuning decision thresholds: an alias such as `jev-latest` can move independently of your routes.

Each example keeps its question beside the route or interceptor for readability. Questions can also be declared in separate YAML resources, or after the routes that refer to them. **Question names must be unique across the CamelContext.** Reloading a resource replaces that resource's questions, including removing declarations no longer present. Loading a question definition does not call the provider.

A question reads the **body by default**. Its `state` option can select a variable, header or exchange property using Simple.
The selected value must be a string, map or list.
A map is sent as a JSON object with named fields; JSON text remains a string and is not parsed automatically.

For an HTTP stream, convert explicitly with `state: ${bodyAs(String)}`. Use stream caching if subsequent processors also need that stream.

For a boolean question, `threshold: 0.8` selects the decision boundary. With `uncertainty: 0.05`, probabilities from **0.75 through 0.85** fall in the uncertainty band, including the endpoints:

- **`fail`** raises an evaluation error within that band.
- **`non-match`** returns false within that band.

These values are *illustrative policy choices*, not an 80% accuracy guarantee. Provider errors remain errors under either policy.

After a successful evaluation, Camel stores the detailed result in the **`CamelSemanticResult` exchange property**. The EIP receives the category, score or boolean decision directly; the property makes the supporting information available to later route steps.

With the TypeSafe adapter, it contains:

| Field | Contents |
| --- | --- |
| `value` | The selected category or numeric score; `null` for boolean questions |
| `probability` | The probability that a boolean question is true; `null` for Choice and Score |
| `probabilities` | Probabilities for each category or score level; empty for boolean questions |
| `confidence` | Provider confidence for Choice and Score, from 0 to 1; `null` for boolean questions |
| `metadata` | Provider name, model identifier and token usage |

Read these fields with Simple, for example `${exchangeProperty.CamelSemanticResult.confidence}`. Camel clears the property before the next semantic evaluation, so store a copy if you need to retain an earlier result.

Each `direct:` destination such as `direct:billing` or `direct:performAction` represents an application route you supply. They make the integration boundary explicit; these fragments are not a complete support application.

## 1. Classify once, then route

The first useful decision is ownership. Pass a string such as *“I was charged twice for my subscription”* to `direct:classify`:

```yaml
- semantic:
    question:
      department:
        type: choice
        instructions: >-
          Which team should handle this support request? If the state is
          an envelope, classify `message` and use `serviceScope` only
          as background context.
        criteria:
          billing: Invoices, payments, subscriptions and refunds
          technical: Product failures, outages and configuration problems
          other: Requests that do not belong to either team

- route:
    id: classify-ticket
    from:
      uri: direct:classify
      steps:
        - setVariable:
            name: department
            expression:
              language:
                language: semantic
                expression: ref:department
        - choice:
            when:
              - expression:
                  simple:
                    expression: "${variable.department} == 'billing'"
                steps:
                  - to:
                      uri: direct:billing
              - expression:
                  simple:
                    expression: "${variable.department} == 'technical'"
                steps:
                  - to:
                      uri: direct:technical
            otherwise:
              steps:
                - to:
                    uri: direct:review
```

The route has three responsibilities:

1. **Evaluate once:** Set Variable stores the category and preserves the message body.
2. **Reuse the result:** Choice compares the stored category, so additional branches do not add provider calls.
3. **Handle the third category, `other`:** the question defines this category for requests that belong to neither `billing` nor `technical`. When the model selects `other`, the Choice EIP's `otherwise` branch sends the message to `direct:review`.

This also gives us a reusable department variable for metrics or later routing. Exchange variables hold application state without adding message headers; copy a value into a header only when a destination needs it. It stays valid only as long as the relevant input stays the same. Reevaluate if a later step changes the content on which the decision depends.

The same approach works for Recipient List, Routing Slip, Enrich and To Dynamic: map a category to destinations defined by the route author. For instance, `billing` can select a billing knowledge source. Keep endpoint URIs and processing sequences in application configuration.

## 2. Filter messages before doing more work

A relevance check needs both the customer message and a description of the service. Here, a support intake application sends an envelope to `support.incoming`. The body contains the following fields, shown as JSON:

```json
{
  "message": "I can't access my subscription invoices.",
  "serviceScope": "Acme Billing manages subscriptions, invoices, payments, and account access."
}
```

**The intake application supplies `serviceScope` from trusted configuration.** The customer supplies the message. The model judges whether that message contains a support request relevant to the supplied scope; it does not establish product ownership.

This example takes a conservative approach: a generic “I can't log in” with no identifiable connection to the service goes to manual triage. The question and its criteria make that policy explicit.

The route uses `camel-jms` with a connection factory configured for your broker. The envelope can arrive as JSON text or as a map; both are supported semantic state types:

```yaml
- semantic:
    question:
      relevant:
        type: boolean
        instructions: >-
          Does `message` request help with the service described in
          `serviceScope`? A generic account question with no identifiable
          connection to this service is not enough.
        state: "${body}"
        criteria:
          "true": A support request with a clear connection to the capabilities described in serviceScope
          "false": Another service, an unsolicited promotion, or insufficient information to establish relevance
        threshold: 0.8
        uncertainty: 0.05
        uncertaintyPolicy: non-match

- route:
    id: filter-support-ticket
    from:
      uri: jms:queue:support.incoming
      steps:
        - filter:
            expression:
              language:
                language: semantic
                expression: ref:relevant
            steps:
              - to:
                  uri: direct:classify
              - stop: {}
        - to:
            uri: jms:queue:support.manual-triage
```

**The complete envelope stays in the body.** Both the Filter and the classifier receive the customer message and service scope. The classifier from the first example explicitly evaluates `message`, using `serviceScope` as background context.

A message that passes the Filter makes two provider calls: one for relevance and one for classification. A negative or uncertain relevance result makes only the first call.

With this question's `non-match` policy:

- A **positive decision** reaches classification. The following `stop` prevents it from also reaching manual triage.
- A **negative or uncertain decision** skips the Filter's child steps. The complete envelope goes to `support.manual-triage`.
- A **timeout or malformed provider response** fails the exchange and follows normal Camel error handling. It does not automatically become a manual-triage decision.

**Steps following Filter still run when its predicate does not match.** This route uses that behavior to retain requests that need a human decision.

This predicate can also run inside Split when an existing collection contains records that need individual checks. The split supplies the records; semantic evaluation does not extract a collection from prose.

## 3. Score the severity of a ticket

A support queue contains everything from a misaligned button to a feature that nobody can use. A Score question assesses the reported severity against an ordered scale, and Camel uses the result to select a handling route.

Pass the ticket text in the body to `direct:prioritize`, for example: *“The export button fails, but I can still download the data from the reports page.”*

```yaml
- semantic:
    question:
      severity:
        type: score
        instructions: How severe is the reported issue?
        criteria:
          - Cosmetic issue with no impact on functionality
          - Broken functionality with a workaround
          - Blocking issue with no workaround

- route:
    id: prioritize-ticket
    from:
      uri: direct:prioritize
      steps:
        - setVariable:
            name: severity
            expression:
              language:
                language: semantic
                expression: ref:severity
        - choice:
            when:
              - expression:
                  simple:
                    expression: "${variable.severity} >= 1.5"
                steps:
                  - to:
                      uri: direct:urgent
              - expression:
                  simple:
                    expression: "${variable.severity} >= 0.5"
                steps:
                  - to:
                      uri: direct:normal
            otherwise:
              steps:
                - to:
                    uri: direct:lowPriority
```

The three criteria define levels **0, 1 and 2**, in that order. Scores can fall between levels, so the route uses decimal boundaries:

- **1.5 or higher:** send to `direct:urgent`.
- **0.5 up to, but not including, 1.5:** send to `direct:normal`.
- **Below 0.5:** send to `direct:lowPriority`.

The question is evaluated once. Set Variable stores the score while preserving the original ticket body for the selected route. The boundaries are application policy choices to tune against representative tickets; the score is a position on the scale, not a percentage.

## 4. Check whether an allowed action fits the task

An action can be permitted by the user's role and still be the wrong action for the current task. A support agent asked to explain an invoice should not decide to cancel the subscription.

**Keep ordinary authorization first**, then add a contextual check:

```yaml
- semantic:
    question:
      withinScope:
        type: boolean
        instructions: Does `proposedAction` serve the task described in `approvedTask`?
        threshold: 0.8
        uncertainty: 0.05
        uncertaintyPolicy: fail

- route:
    id: check-action
    from:
      uri: direct:checkAction
      steps:
        - to:
            uri: direct:checkPermissions
        - to:
            uri: direct:loadApprovedTask
        - validate:
            expression:
              language:
                language: semantic
                expression: ref:withinScope
        - to:
            uri: direct:performAction
```

The first two steps are application responsibilities:

- **`direct:checkPermissions`** checks identity, permissions and tenant boundaries. It must reject unauthorized requests.
- **`direct:loadApprovedTask`** loads the task from trusted application state and produces a map in the body, shown here as JSON:

```json
{
  "approvedTask": "Explain the duplicate subscription charge; do not change the account.",
  "proposedAction": {
    "operation": "cancelSubscription",
    "parameters": {
      "subscriptionId": "sub-123"
    }
  }
}
```

**The approved task must come from trusted application state.** The proposed action must not be able to overwrite it. Only after both checks succeed does `direct:performAction` execute.

This is useful for AI tool and MCP-backed routes as well as ordinary application commands; [Camel's tool authorization example](/blog/2026/09/securing-ai-agent-tools/) shows the underlying permission pattern.

> **Stop before the action.** A negative decision, uncertainty or evaluation failure must stop execution or divert it to review. Do not configure the error handler to continue processing after those failures, because that would resume the route toward the action.

Semantic validation adds a contextual judgment; **identity and permissions remain authoritative**.

## 5. Group related feedback into batches

Customers describe the same issue in different words. “You took my money twice” and “My card shows two identical charges” both concern billing, while “I cannot find the export button” concerns usability. A semantic category can group those messages without maintaining a list of keyword rules.

[Aggregate](/components/next/eips/aggregate-eip.html) accepts an expression for its correlation key. Here, that expression asks which topic best describes each incoming feedback message:

```yaml
- semantic:
    question:
      feedbackTopic:
        type: choice
        instructions: Which topic best describes this customer feedback?
        criteria:
          billing: Payments, invoices and subscription charges
          reliability: Failures, crashes and outages
          usability: Difficulty finding or using a product feature
          other: Feedback that does not fit the other topics

- route:
    id: group-customer-feedback
    from:
      uri: direct:feedback
      steps:
        - aggregate:
            aggregationStrategy: "#class:org.apache.camel.processor.aggregate.GroupedBodyAggregationStrategy"
            correlationExpression:
              language:
                language: semantic
                expression: ref:feedbackTopic
            completionSize: 5
            completionTimeout: "60000"
            steps:
              - to:
                  uri: direct:reviewFeedbackBatch
```

**This example processes feedback for one tenant and product.** If a shared deployment handles several tenants or products, its correlation key must also include their authoritative identities. A topic alone does not provide that isolation.

Each incoming body is one feedback message as text. The semantic expression evaluates it once, and Aggregate uses the returned category as the group key. `GroupedBodyAggregationStrategy` collects the original bodies into a list:

- **Same topic:** messages join the same open group, even when their wording differs.
- **Five messages or about one minute of inactivity:** that topic's group completes and its list is sent to `direct:reviewFeedbackBatch`, an application route that stores or reviews the batch.
- **Evaluation failure:** the incoming message is not added to a group and follows normal Camel error handling.

The size and inactivity limits apply independently to each topic. Later messages start a new group after the previous one completes. The destination can read the topic from Camel's `CamelAggregatedCorrelationKey` exchange property.

Here, **Aggregate consumes the semantic category directly**. No intermediate variable, header or property is needed to pass the decision to the EIP, and completed groups use ordinary deterministic completion rules.

## 6. Share a check across outgoing messages

Several routes may send replies to customers. Instead of repeating the same check in each route, use [Intercept Send To Endpoint](/components/next/eips/intercept.html) at their shared sending boundary.

Here the body contains the prepared reply text. A semantic predicate checks whether it promises financial compensation and should go to human review:

```yaml
- semantic:
    question:
      needsReview:
        type: boolean
        instructions: Does this outgoing reply promise a refund, discount or other financial compensation?
        threshold: 0.3
        uncertainty: 0.05
        uncertaintyPolicy: fail

- interceptSendToEndpoint:
    uri: "direct:outbound-*"
    skipSendToOriginalEndpoint: true
    onWhen:
      expression:
        language:
          language: semantic
          expression: ref:needsReview
    steps:
      - to:
          uri: direct:humanReview
      - stop: {}

- route:
    id: reply-by-email
    from:
      uri: direct:replyByEmail
      steps:
        - to:
            uri: direct:outbound-email

- route:
    id: reply-by-chat
    from:
      uri: direct:replyByChat
      steps:
        - to:
            uri: direct:outbound-chat
```

The action-validation example requires a strong positive answer before allowing an action. Here, a positive answer requests human review, so the lower threshold favors catching possible compensation promises. The illustrative uncertainty band is **0.25 through 0.35**, inclusive; results inside it fail before delivery. Tune these values against representative replies.

The interceptor covers matching sends from both routes:

- **Review needed:** the reply goes to `direct:humanReview`. The original send is skipped, and `stop` ends processing of that exchange.
- **Review not needed:** the reply reaches the selected outbound route normally.
- **Uncertain decision or provider failure:** the exchange fails before either outbound route is called.

`direct:outbound-email` and `direct:outbound-chat` are application routes that perform the actual delivery. The review route must retain the reply for a separate approval workflow; it does not send it automatically.

**Keep the interceptor before any routes in its YAML file.** If you combine these examples into one file, move the interceptor above all route declarations. It can also affect matching sends from routes in other YAML files in the same CamelContext. Each matching send performs a check, so sending twice performs two evaluations. Avoid continuing past evaluation failures in the error handler, just as in the action-validation example.

## Choosing the next integration point

The same approach extends to other parts of a Camel workflow. The six examples above cover classification, filtering, scoring, validation, aggregation and shared checks. Other useful integration points include:

| If the workflow needs… | Apply the same idea through… | Keep in application control |
| --- | --- | --- |
| Several destinations or a processing sequence | Recipient List, Routing Slip, Enrich or Poll Enrich | Map categories to configured endpoints or sequences |
| Another refinement step | Loop | An iteration or time budget and an explicit stopping condition |
| The next processing step | Dynamic Router | Map labels to configured endpoint URIs, enforce a hop budget and return `null` to finish |
| Different limits for different workloads | Throttle | Fixed rates or concurrency limits for each classified group |
| Follow-up after processing | On Completion | Auditing or follow-up only; it cannot prevent an action already performed |

The practical benefit is that a semantic judgment becomes a small, visible part of the route. The surrounding Camel workflow still owns destinations, permissions, retry limits and the point at which an action happens.

## What I would like to see next

For me, `camel-semantic` is a starting point for a closer relationship between semantic evaluation and Camel's EIPs.

Filter and Validate already consume semantic predicates directly, and the Aggregate example uses a semantic expression as its correlation key. The classification example shows where I would like that integration to go further: it uses a separate step to evaluate the question and store its answer before Choice uses it.

My vision is for **the semantic question to become a parameter of the EIP itself**. The route author would supply the question, the state to evaluate and the rules for using the answer. The EIP would request the evaluation through `camel-semantic` and consume the result internally, without requiring an intermediate variable, header or exchange property.

I am keeping the form of that integration open. It could mean extending existing EIPs, or introducing new EIPs with built-in semantic evaluation that live alongside the existing ones. What matters to me is being able to express the question where the decision is made, with Camel managing the evaluation.

Either approach would need to make **evaluation timing explicit**: when to evaluate a question, when to reuse its answer and when updated state requires a fresh evaluation. Thresholds, uncertainty handling and provider failures would remain explicit parts of the route's behavior.

Keeping a result for auditing or reuse by later processors would still be an option. It would no longer be a required step just to connect a semantic question to the EIP that needs its answer.

I would keep this integration built on `camel-semantic` and its provider adapters. The route would describe the decision and the workflow, while the adapter would remain responsible for querying Jev or another System One model.
