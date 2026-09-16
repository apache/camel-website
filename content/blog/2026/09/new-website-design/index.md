---
title: "A New Look for the Camel Website"
date: 2026-09-16
draft: false
authors: [ammachado]
categories: ["Website"]
keywords: ["apache camel", "website", "redesign", "design"]
preview: "The Camel website has a new look: self-hosted Archivo and JetBrains Mono fonts, a new color palette, and reworked home, blog, download, docs, and trust pages."
---

The Camel website has a new look. Over the last few weeks we rebuilt the design foundation and reworked most of the pages on top of it: the home page, header and footer, blog, downloads, docs listing, community, security advisories, and the trust page.

## Type and color

The text now renders using the Archivo typeface for headings and body copy, and JetBrains Mono for code, both self-hosted instead of pulled from a font CDN. The color palette was rebuilt from the ground up at the CSS variable level, so the change reaches every page rather than a handful of components someone remembered to update.

Our marketing pages (home, downloads, community) now sit in a 1200px container. Docs pages kept their wider 1366px container, since a documentation article needs the room a landing page doesn't.

## Search moved to DocSearch v5

Just before the redesign landed, search moved off a hand-rolled Algolia integration onto DocSearch v5. The result curation carried over: core docs still rank above component docs, sub-project results are still filtered out, and each page is still capped at two hits so one document can't fill the whole list. The widget itself is now themed to match the site instead of showing Algolia's default styling.

## The blog got the most work

The blog list showed three posts per page. It's ten posts per page now, easier to navigate. The post card is tighter too: a smaller date block, less padding, a 22px title, previews cut at 180 characters, and no more redundant "Continue reading" link under a card that's already a link.

The sidebar rail opens with eight hand-picked posts under "Start here", above the usual category list. If a picked post is ever removed or renamed, the build fails instead of the link going quietly dead.

## Trust page, fixed and easier to find

The trust page's icons (padlock, community, gear) were designed for a dark navbar and had gone nearly invisible against the new off-white background. They're back to the Camel orange used by every other icon on that page.

The bigger problem was that almost nobody could find the page: it only showed up under About > Trust in the footer. "Why Camel" is now the first link in the top bar, and the home page's features section ends with a "Why teams trust Camel in production" button pointing at it.

## What didn't change

URLs, RSS feeds, and the docs content itself are untouched. This is a visual and structural pass on the Hugo site and the Antora UI shared chrome, not a content migration.

If something looks broken or a link points at the wrong place, please [open an issue](https://github.com/apache/camel-website/issues).
