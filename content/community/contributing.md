---
title: Contributing
---

## Contributing to Apache Camel
First of all, thank you for having an interest in contributing to Apache Camel.

Here are some guidelines on how to best approach the Apache Camel community and how to best apply yourself.
There are many ways you can help make Camel a better piece of software - please dive in and help!

- Try surfing the documentation - if something confuses you, [bring it to our attention or suggest an improvement](#working-on-the-documentation).
- Download the code & try it out and see what you think.
- Browse the source code. Got an itch to scratch, want to tune some operation, or add some feature?
- Want to do some hacking on Camel? Try surfing our [issue tracker](https://issues.apache.org/jira/browse/CAMEL) for open issues or features that need to be implemented. Take ownership of a particular issue, and try to fix it.
- If you are a new Camel rider and would like to help us, you can also find [some easy to resolve issues](https://issues.apache.org/jira/issues/?filter=12348073) or [issues we need help with](https://issues.apache.org/jira/issues/?filter=12348074).
- Leave a comment on the issue to let us know you are working on it, and add yourself as a watcher to get informed about all modifications.

Identify areas you can contribute first. You don't have to be an expert in an area, the Apache Camel developers are available to offer help and guidance.

Introduce yourself on the [developer's mailing list] (#getting-in-touch), tell us what area of work or problem you wish to address in Camel. Create a draft of your solution, this can be simple 1-2 sentences on the change you wish to make. Try to be as specific as you can: include a short description of your intent, what you tried and what didn't work, or what you need help with. The best way of approaching the developers is by describing what you would like to work on and asking specific questions on how to get started. We'll do our best to guide you and help you make your contribution.

We also participate in Google Summer of Code and Outreachy programs; for information about those look at those program websites. If you wish to participate in either of those follow the guidelines and schedule set by those programs. If you are unsure please reach out via official communication channels of those programs, or ask on the developer's mailing list for help.

## Getting in touch

Apache Camel is an Apache Software Foundation project, all communication is done in the open on the project mailing lists. You can [read more on the reasoning behind this](https://www.apache.org/foundation/mailinglists.html) to get a better understanding of this.

All communication is subject to the [ASF Code of Conduct](https://www.apache.org/foundation/policies/conduct.html).

There are various ways of communicating with the Camel community.
For questions and guidance around contributing subscribe to the developer's mailing list by sending an e-mail to dev-subscribe@camel.apache.org.
[This page](../mailing-list/) describes all the Camel mailing lists.

We can also be reached on the Zulip chat at https://camel.zulipchat.com.

## If you find a bug or problem

Please raise a new issue in our [issue tracker](https://issues.apache.org/jira/browse/CAMEL). This way we’ll know when the issue has been fixed and we can ensure that the problem stays fixed in future releases. Please describe the bug/issue clearly, and add pictures/screenshots if necessary.
If you can create a JUnit test case which demonstrates the problem, then your issue is more likely to be resolved quickly.
For examples, take a look at some of the existing [unit test cases](https://github.com/apache/camel/tree/main/core/camel-core/src/test/java/org/apache/camel).

**NOTE:** you will need to register to create or comment on JIRA issues. The "Log In" link in the upper right will allow you to login with an existing account or sign up for an account.

## Working on the documentation

Documentation is extremely important to help users make the most of Apache Camel and it's probably the area that needs the most help!
So if you are interested in helping the documentation effort; whether it's just to fix a page here or there, correct a link or even write a tutorial or improve existing documentation please do dive in and help! Most of the documentation is managed in the same repositories as the related source code so the process is similar to working on the code. For more details please refer to [Improving the documentation in the User Manual](/manual/improving-the-documentation.html).

## Working on the code

We recommend working on the code from the [camel GitHub repository](https://github.com/apache/camel/). Camel subprojects are maintained in [separate repositories in GitHub](https://github.com/apache?q=camel).

    git clone https://github.com/apache/camel.git
    cd camel

**NOTE:** If you are an Apache Camel committer, then you may also clone the [ASF git repo](https://gitbox.apache.org/repos/asf/camel.git).

Build the project with [Maven](http://maven.apache.org/download.html). Maven 3.6.x or newer is required to build Camel 3 or later. The following command will do a fast build.

    mvn clean install -Pfastinstall

**NOTE:** You might need to build multiple times (if you get a build error) because sometimes maven fails to download all the required jars.
Then import the projects into your workspace.

You can find more details about building camel in the User Manual [Building](/manual/building.html) page.

If you aren't able to build a component after adding some new URI parameters due to `Empty doc for option: [OPTION], parent options: <null>` please make sure that you either added properly javadoc for get/set method or description in `@UriPath` annotation.


### Verify Karaf features

Camel-Karaf now lives in its own repository, so to verify a Karaf feature, you'll need to fork the [camel-karaf repository](https://github.com/apache/camel-karaf).

To check a new Karaf feature or an existing one, you should run a verification on the features.xml file. You'll need to follow these steps:
The first step is to run a full build of Camel. Then

    cd platform/karaf/features/
    mvn clean install

If you modified a component/dataformat or updated a dependency in the main camel repository, you'll first need to build the main camel locally and then run a full build of camel-karaf.



## Testing the changes

If you need to implement tests for your changes (highly recommended!), you will probably need to handle 3 separate things:

- simulate the infrastructure required for the test (ie.: JMS brokers, Kafka, etc),
- writing testable code,
- the test logic itself.
Naturally, there is no rule of
thumb for how the code changes and test logic should be written. The [Testing](/manual/testing.html) page in the User Manual provides detailed information and examples for writing Camel unit tests.
With regard to simulating the test infrastructure, there is a
growing library of reusable components that can be helpful. These components are located in the test-infra module and provide
support for simulating message brokers, cloud environments, databases and much more.

Using these components is usually as simple as registering them as JUnit 5 extensions:

    @RegisterExtension
    static NatsService service = NatsServiceFactory.createService();

Then you can access the service by using the methods and properties provided by the services. This varies according to each service.

If you need to implement a new test-infra service, check the [readme on the test-infra module](https://github.com/apache/camel/tree/main/test-infra#readme) for additional details.

## Running checkstyle

Apache Camel source code uses a coding style/format that can
be verified for compliance using the checkstyle plugin.
To enable source style checking with checkstyle, build Camel with the -Psourcecheck parameter:

    mvn clean install -Psourcecheck

Please remember to run this check on your code changes before submitting a patch or Github PR. You do not need to run this against the entire project, but only in the modules you modified. Let's say you do some code changes in the camel-ftp component, following which you can run the check from within this directory:

    cd camel-ftp
    mvn clean install -Psourcecheck


## Submitting your contribution
We gladly accept patches if you can find ways to improve, tune, or fix Camel in some way.
Make sure you have followed the steps and guidelines outlined in this document. For larger changes, make sure that you have discussed them on the developer's mailing list or in the Jira issue tracker before hand. To get the best response from the team, make sure that the reasoning behind the contribution you wish to make is clear: outline the problem and explain your solution for it. Describe any changes you have made for which you are unaware or unsure of any consequences or side effects.

Be mindful of the source checks, formatting and the structure of the git commit message we abide by. In particular, if there is a JIRA issue, reference it in the first line of your commit message, for example:

    CAMEL-9999: Some message goes here

Ensure that the unit tests include proper assertions, and not only system.out or logging.
Please also avoid unnecessary changes, like reordering methods and fields, which will make your PR harder to review.

Following these guidelines will help you in getting your contribution accepted.

### Creating a Pull Request at Github
The *preferred* way of submitting your contribution is to fork the camel Github repository and push your changes there.
You can find many resources online explaining how to work on GitHub projects and how to submit work to these projects.
After updating your private repository, create a Pull Request (PR). One of the committers then needs to accept your PR to bring the code into the ASF codebase.

Expect that your Pull Request will receive a review and that you will need to respond and correspond to that via comments at GitHub.

Stay engaged, follow and respond to comments or questions you might be asked.

After the code has been included into the ASF codebase, you need to close the Pull Request because we can't do that...

### Manual patch files

For smaller patches, you may also submit a patch file instead of using a Pull Request. To do this:

- [create a new JIRA issue](https://issues.apache.org/jira/browse/CAMEL)
- attach the patch or tarball as an attachment
- **tick the Patch Attached** button on the issue

Most IDEs can create nice patches now very easily. e.g., on Eclipse, right-click on a file/directory, and select Team -> Create Patch. Then save the patch as a file and attach it to the corresponding JIRA issue.
If you prefer working on the command-line, try the following to create the patch:

    diff -u Main.java.orig Main.java >> patchfile.txt

or

    git diff --no-prefix > patchfile.txt

### Automated Code Analysis

As part of our [Continuous Integration](https://ci-builds.apache.org/job/Camel/job/Apache%20Camel/job/main/), the code is automatically analyzed for issues using a [SonarQube instance](https://sonarcloud.io/project/overview?id=apache_camel) managed by the ASF Infra.
Apache Camel Committers and contributors are encouraged to analyze the quality reports and suggest fixes and improvements.


## Becoming a committer

Once you've become involved as above, we may well invite you to be a committer. See [How do I become a committer](/manual/faq/how-do-i-become-a-committer.html) for more details.

