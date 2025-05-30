---
title: "Support"
---

## Getting help

If you are experiencing problems using Camel, then please report your problem to our mailing list or the Zulip chat.
This allows the entire community to help with your problem.
If indeed a bug has been identified in the Camel software,
then document the problem in our [Issue Tracker](https://issues.apache.org/jira/browse/CAMEL).
Please refrain
from immediately opening a ticket in the issue tracker unless you are certain it's a problem in the Camel software.

If you are in doubt, we appreciate asking the [mailing list](/community/mailing-list/) or [Zulip](https://camel.zulipchat.com) chat first.

Please read the section below (How to get help), and follow the bullets advised there first:

* [Issue tracker](https://issues.apache.org/jira/browse/CAMEL)
* [FAQ](/manual/faq/index.html)

### Reporting bugs - Please read this first

We prefer people to get in touch first using the mailing list, or Zulip chat. Or take time to read FAQs, or search in the mailing list archives to find answers.
Unfortunately, some people create a JIRA ticket as first thing. **Please don't do that!** Only if you are sure it really is a bug etc. JIRA tickets create noise
for the Camel team to react on issues that are not bugs but are already covered in FAQs, in the mailing lists etc., or in the existing documentation.
Also on the mailing lists, there are more people active to help you better.

Before you can create a JIRA ticket you need to request an account. When requesting the account please be specific about the reason you need it. Please give a brief synopsis of the bug you’re encountering or feature you need. If you’re not quite sure you’re hitting an actual bug or you’re not sure if the feature you need is valid, etc. please contact us on the users mailing list or Zulip chat to get some clarity. Account requests with vague reasons will be rejected.

Also, please avoid sending direct emails to members of the Camel team (we are busy already).
And conversations about Camel should happen in the public mailing lists, instead of via private emails.

### Reporting security issues

If you have found a security issue in Camel,
please contact the Apache Software Foundation [security team](https://www.apache.org/security/).
Don't share the details in public (i.e., chat or users/developer mailing lists).
We will receive details you send and resolve the issue as soon as possible.
We might also contact you requesting further details as needed.

### Alternative discussion forums

There are a number of sites outside Apache that offer discussion forums on Camel.
For example,[Stack Overflow](http://stackoverflow.com/) is a popular Q & A site with a dedicated [Apache Camel forum](http://stackoverflow.com/questions/tagged/apache-camel).
You are also likely to find helpful discussions on technical blogs, on [Google](https://www.google.com/search?q=apache+camel),
or even on [Twitter](https://twitter.com/#!/search/apache%20camel).

### Using deprecated components

Deprecated components are *not* supported and issues such as bugs may not be fixed. We encourage users to migrate away from using any deprecated component.
A list of deprecated components is listed on the GitHub page at: https://github.com/apache/camel/tree/master/components#components

### How to get help

Before you report a problem, you may wish to read the [FAQ](/manual/faq/index.html).
When you report an issue, please be sure to include as much information as possible. The more we know, the easier it is to reach an effective solution quickly.

The **most important information** you can provide us is the **version of Apache Camel** that you are using.  

But not only that. Remember to also include information such as:

*  what are the version numbers of involved software components? (this is crucial)
*  what platform and JDK?
*  any particular container being used? and if so, what version?
*  stack traces generally really help! (Remember to post which version of Camel you use, this is important to know when posting stacktraces.) If in doubt, include the whole thing; often exceptions get wrapped in other exceptions and the exception right near the bottom explains the actual error, not the first few lines at the top. It's very easy for us to skim-read past unnecessary parts of a stack trace.
*  log output can be useful too; sometimes [enabling DEBUG logging] (/manual/faq/how-do-i-change-the-logging.html) can help
*  your code & configuration files are often useful
*  did it work before? what have you changed to break it?
*  try upgrading to the latest release and see if it's fixed there
*  try the latest SNAPSHOT to see if it's fixed in the pre-release
*  search the user forum to see if it has been discussed before
*  see the "known issues" section in the release notes
*  and check the issue tracker to see if the issue has already been reported
*  do *not* send private emails to Camel Team members to ask them to help you faster. Apache Camel support is volunteer-based and must happen in the open on the public Mailing Lists. If you want to get help faster or in private, then see further below.

### How to get help faster

We can help you much quicker if you try the following

*  provide us with a JUnit test case that demonstrates your issue. For instance, if you think you've found a bug, can you create a test case to demonstrate the bug?
*  [submit a patch](/community/contributing/) fixing the bug. We may also buy you beer when we meet you if you submit bug fixes :)
*  for memory leak or performance related issues, attach the profiler or report output as a file (or zipped file if it's huge) to the JIRA we can normally fix things much faster. For example, you could run `jmap`/`jhat`, `perf`, the async profiler, JProfiler or YourKit on your code and send us the output. To find memory leaks, it's quicker to resolve if you can tell us what classes are taking up all the RAM; we can normally figure out what's wrong with that.

## Commercial Support

This is an open source project, so the amount of time we have available to help resolve your issue is often limited as all help is provided on a volunteer basis.
If you want to get priority help, need to get up to speed quickly, require some training or mentoring, or need full 24 x 7 production support, you could contact one of the following companies with [Commercial Camel Offerings](/manual/commercial-camel-offerings.html).
