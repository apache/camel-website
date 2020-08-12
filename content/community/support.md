---
title: "Support"
---

## Getting help

If you are experiencing problems using Camel then please report your problem to our mailing list. This allows the entire community to help with your problem.
If indeed a bug has been identified in the Camel software, then document the problem in our [Issue Tracker](https://issues.apache.org/jira/browse/CAMEL).
Please refrain from immediately opening a ticket in the issue tracker unless you are certain it's a problem in the Camel software.

If you are in doubt, we appreciate asking the [mailing list](/community/mailing-list/) or [Gitter](https://gitter.im/apache/apache-camel) chat first.

Please read the section below (How to get help), and follow the bullets advised there first:

* [Issue tracker](https://issues.apache.org/jira/browse/CAMEL)
* [FAQ](/manual/latest/faq/index.html)

### Reporting bugs - Please read this first

We prefer people to get in touch first using the mailing list, or Gitter chat. Or take time to read FAQs, or search in the mailing list archives to find answers.
Unfortunately some people create a JIRA ticket as first thing. Please don't do that! Only if you are sure it really is a bug etc. JIRA tickets create noise
for the Camel team to react on issues that are not bugs. But already covered in FAQs, in the mailing lists etc. Or in the existing documentation.
Also on the mailing lists there is more people active to help you better.

### Alternative discussion forums

There's a number of sites outside Apache that offer discussion forums on Camel. For example, [Stack Overflow](http://stackoverflow.com/) is a popular Q & A site with a dedicated [Apache Camel forum](http://stackoverflow.com/questions/tagged/apache-camel).
You are also likely to find helpful discussions on technical blogs, on [Google](https://www.google.com/search?q=apache+camel), or even on [Twitter](https://twitter.com/#!/search/apache%20camel).

### Using deprecated components

Deprecated components are not supported and issues such as bugs may not be fixed. We encourage users to migrate away from using any deprecated component.
A list of deprecated components is listed on the github page at: https://github.com/apache/camel/tree/master/components#components

### How to get help

Before you report a problem, you may wish to read the [FAQ](/manual/latest/faq/index.html).
When you report an issue, please be sure to include as much information as possible. The more we know, the easier it is to reach an effective solution quickly.

*What version do you use*

What version of Camel do you use! Remember to include this information.

*  what are the version numbers of involved software components? (this is very important to detail)
*  what platform and JDK?
*  any particular container being used? and if so, what version?
*  stack traces generally really help! (Remember to post which version of Camel you use, this is important to know when posting stacktraces) If in doubt, include the whole thing; often exceptions get wrapped in other exceptions and the exception right near the bottom explains the actual error, not the first few lines at the top. It's very easy for us to skim-read past unnecessary parts of a stack trace.
*  log output can be useful too; sometimes enabling DEBUG logging can help
*  your code & configuration files are often useful
*  did it work before? what have you changed to break it?
*  try upgrading to the latest release and see if it's fixed there
*  try the latest SNAPSHOT to see if it's fixed in the pre-release
*  search the user forum to see if has been discussed before
*  see the "known issues" section in the release notes
*  and check the issue tracker to see if the issue has already been reported
*  do not send private emails to Camel Team members to ask them to help you faster, or in the private only. Help on Apache Camel is volunteer based and must happen in the open on the public Mailing Lists. If you want to get help faster or in private, then see further below.

### How to get help faster

We can help you much quicker if you try the following

*  provide us with a JUnit test case that demonstrates your issue. e.g. if you think you've found a bug, can you create a test case to demonstrate the bug?
*  [submit a patch](/manual/latest/contributing.html) fixing the bug! (We also buy you beer when we meet you if you submit bug fixes (smile) )
*  for memory leak or performance related issues, if you can run a profiler on your test case and attach the output as a file (or zipped file if it's huge) to the JIRA we can normally fix things much faster. e.g. you could run jmap/jhat, JProfiler or YourKit on your code and send us the output. To find memory leaks it's quicker to resolve if you can tell us what classes are taking up all of the RAM; we can normally figure out what's wrong from that.

## Commercial Support

This is an open source project, so the amount of time we have available to help resolve your issue is often limited as all help is provided on a volunteer basis.
If you want to get priority help, need to get up to speed quickly, require some training or mentoring, or need full 24 x 7 production support you could contact one of the following companies with [Commercial Camel Offerings](/manual/latest/commercial-camel-offerings.html).
