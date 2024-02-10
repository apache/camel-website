---
title: "Integrate your AI models effortlessly with Apache Camel"
date: 2024-02-09
draft: true
authors: [croway]
categories: ["Camel Spring Boot", "Usecases"]
preview: "Build a conversational AI integration with Apache Camel, langchain4j and WhatsApp."
---

This blog shows how Apache Camel can help integrate multiple systems with an AI model, in particular, the [camel-whatsapp](https://camel.apache.org/components/4.0.x/whatsapp-component.html) component is used to build a chat on WhatsApp; so that a user can easily communicate with the LLM via WhatsApp.

# Workflow

The objective is the following, I'd like to have specific conversations about some topic, in this case, how to contribute to Apache Camel, with an LLM via WhatsApp. In this context WhatsApp is just an example, Apache Camel offers 300+ components that can be easily integrated!

The objective is clear, but what about the implementation? Libraries like langchain4j and Apache Camel help a lot with this kind of use case, in particular, we will leverage the following features: 
* camel-whatsapp will take care of the integration with WhatsApp APIs and thanks to the camel-webhook feature the communication with the WhatsApp APIs is effortless.
* On the other hand, langchain4j offers abstractions and toolkits that help developers interact with LLMs.

In this example, the model [GPT-3.5 Turbo](https://platform.openai.com/docs/models/gpt-3-5-turbo) is used, and the [camel core contribution documentation](https://camel.apache.org/camel-core/contributing/) is used as an embedding, in this way it will be possible to have clear conversations about camel contributions.

# Set up

This is the hardest part, if you would like to test it by yourself some requirements need to be fulfilled before executing the code, in particular:

* A business WhatsApp account is needed, for development purposes this is free, you can follow the documentation in the [Camel WhatsApp component](https://camel.apache.org/components/4.0.x/whatsapp-component.html)
* An OpenAI API key, the [langchain4j getting started](https://github.com/langchain4j#getting-started) contains information how to generate the API key
* [Webhook](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/set-up-webhooks) needs to be configured in the WhatsApp business account, so that way WhatsApp API can communicate with the running Apache Camel application
* If you are testing locally, the running application's webhook has to be exposed to the internet, for example via [ngrok](https://ngrok.com/)
* Finally, the [sample application](https://github.com/Croway/camel-whatsapp-chatbot) can be cloned and run via `mvn spring-boot:run`

# Apache Camel route

Given a chat service that returns a String to an input String message `ConversationalAIAgent.chat(...)`, let's focus on the Camel route.

We would like to achieve the following:
* a user sends a message to a WhatsApp business account
* the WhatsApp API then sends the message to our running application
* the application invokes `ConversationalAIAgent.chat(...)`
* behind the hood, via langchain4j abastraction, the GPT-3.5 is used to produce a response message
* the message is sent to the WhatsApp API and, finally, to the user. 

This integration can be easily implemented by the following Camel route:

```java
@Autowired
ConversationalAIAgent agent; // [1]

...


fromF("webhook:whatsapp:%s", businessAccountId) // [2]
        .choice().when().jsonpath("$.entry[0].changes[0].value.messages", true)
        .setHeader("CamelWhatsappBody").jsonpath("$.entry[0].changes[0].value.messages[0].text.body")
        .setHeader("CamelWhatsappPhoneNumber").jsonpath("$.entry[0].changes[0].value.contacts[0].wa_id") // [3]
        .process(exchange -> {
            TextMessageRequest request = new TextMessageRequest();
            request.setTo(exchange.getIn().getHeader("CamelWhatsappPhoneNumber").toString());
            request.setText(new TextMessage());
            request.getText().setBody(
                    agent.chat(exchange.getIn().getHeader("CamelWhatsappBody").toString()));
            exchange.getIn().setBody(request); // [4]
        })
        .toF("whatsapp:%s", businessAccountId) // [5]
```

[1] `ConversationalAIAgent` is implemented with langchain4j, it uses the camel-contributing.txt to gain information regarding the contributions rules, and GPT-3.5 to generate the response.

[2] `fromF("webhook:whatsapp:%s", businessAccountId)` Expose an HTTP endpoint that is known to the WhatsApp Business account, and, every time a user generates an event with the WhatsApp Business account associated number, events like a message sent, message read, writing message and so on, the HTTP endpoint is invoked with a JSON containing all the information.

[3] We are leveraging Apache Camel jsonpath capabilities to retrieve the message sent by the user `jsonpath("$.entry[0].changes[0].value.messages[0].text.body")`, and the user phone number `jsonpath("$.entry[0].changes[0].value.contacts[0].wa_id")` that we store in header variables for further computation.

[4] The processor is straightforward, in this case only text messages are handled, but the camel-whatsapp component contains models for many use cases (like images, polls and so on), in the processor we finally use the agent to generate a reply to the given question.

[5] And finally, `.toF("whatsapp:%s", businessAccountId)` we reply to the phone number that initiated the conversation.

# Conclusions

This blog post shows how Apache Camel can be leveraged to integrate LLMs with bulletproof enterprise integration patterns, we just showed how few lines of code can implement such a complex use case.