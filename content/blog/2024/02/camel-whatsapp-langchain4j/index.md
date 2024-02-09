---
title: "Integrate your AI models effortlessly with Camel"
date: 2024-02-09
draft: true
authors: [croway]
categories: ["Camel Spring Boot"]
preview: "Build a conversational AI integration with Camel, langchain4j and WhatsApp."
---

This blog shows how Camel can help integrating multiple systems with an AI model, in particular the [camel-whatsapp](https://camel.apache.org/components/4.0.x/whatsapp-component.html) component is used to build a chat (about Camel contributions) on WhatsApp, an user can easily communicate with the LLM via WhatsApp.

## Workflow

The idea is simple, I'd like to have argument specific conversations with an LLM via WhatsApp. In this context WhatsApp is just an example, Camel offers 300+ components that can be easily integrated!

The idea is could be simple, but what about the implementation? Well, libraries like langchain4j and Camel helps a lot with this kind of usecases. In particular, we will leverage the following features, camel-whatsapp will take care of the integration with WhatsApp APIs and thanks to the camel-webhook feature the communication with the WhatsApp APIs is effortless. On the other hand, langchain4j offers abstractions and toolkit that help developers interact with LLMs, in this example, the model [GPT-3.5 Turbo](https://platform.openai.com/docs/models/gpt-3-5-turbo) is used, and the [camel core contribution documentation](https://camel.apache.org/camel-core/contributing/) is used as an embedding, in this way it will be possible to have clear conversations about camel contributions.

## Set up

This is the hardest part, if you would like to test it by yourself there are some requirements, in particular:

* A business WhatsApp account is needed, for development purposes is free, you can follow documentation in the [Camel WhatsApp component](https://camel.apache.org/components/4.0.x/whatsapp-component.html)
* An OpenAI API key, the [langchain4j getting started](https://github.com/langchain4j#getting-started) contains informations how to generate the API key
* [Webhook](https://developers.facebook.com/docs/whatsapp/cloud-api/guides/set-up-webhooks) need to be configured in the WhatsApp business account, so that way WhatsApp API can communicate with the running camel application
* If you are testing locally, the running application has to be exposed to the internet, for example via [ngrok](https://ngrok.com/)
* Finally, the [sample application](https://github.com/Croway/camel-whatsapp-chatbot) can be cloned and run via `mvn spring-boot:run`

# Camel route

Given a chat service, that return a String reply to an input String message `ConversationalAIAgent.chat(...)`, let's focus on the Camel route.

We would like to achieve the following, an user send a message to a WhatsApp business account, WhatsApp API, somehow, send the message to our running application, the application invoke `ConversationalAIAgent.chat(...)`, the output is sent to the WhatsApp API and, finally, to the user. This integration, can be easily implemented by the following Camel route:

```
@Autowired
ConversationalAIAgent agent;

...


fromF("webhook:whatsapp:%s", businessAccountId)
        .choice().when().jsonpath("$.entry[0].changes[0].value.messages", true)
        .setHeader("CamelWhatsappBody").jsonpath("$.entry[0].changes[0].value.messages[0].text.body")
        .setHeader("CamelWhatsappPhoneNumber").jsonpath("$.entry[0].changes[0].value.contacts[0].wa_id")
        .process(exchange -> {
            TextMessageRequest request = new TextMessageRequest();
            request.setTo(exchange.getIn().getHeader("CamelWhatsappPhoneNumber").toString());
            request.setText(new TextMessage());
            request.getText().setBody(
                    agent.chat(exchange.getIn().getHeader("CamelWhatsappBody").toString()));
            exchange.getIn().setBody(request);
        })
        .toF("whatsapp:%s", businessAccountId)
```

`ConversationalAIAgent` is implemented with langchain4j, uses the camel-contributing.txt to gain information regarding the contriutions rules, and GPT-3.5 to generate the response.

`fromF("webhook:whatsapp:%s", businessAccountId)` Expose an HTTP endpoint that is known to the WhatsApp Business account, and, every time an user generate an event with the WhatsApp Business account associated number (events like message sent, message read, writing message and so on) the HTTP endpoint is invoked with a json containing all the information, in particular, we are leveraging camel jsonpath capabilities to retrieve the message sent by the user `jsonpath("$.entry[0].changes[0].value.messages[0].text.body")`, and the user phone number `jsonpath("$.entry[0].changes[0].value.contacts[0].wa_id")` that we store in header variables for further computation.

The processor is straightforward, in this case only text messages are handled, but the camel-whatsapp component contains models for many usecases (like images), in the processor we finally use the agent to generate a reply to the given question.

And finally, `.toF("whatsapp:%s", businessAccountId)` we reply to the phone number that initiated the conversation.
