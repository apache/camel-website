---
title: "Community Showcase: How to Rewrite 20+ Critical Banking ETL Applications"
date: 2026-06-11
draft: false
authors: [orpiske]
categories: ["Community", "Usecases"]
keywords: ["apache camel", "banking", "etl", "modernization", "migration", "testing", "validation", "rewrite", "legacy systems"]
preview: "A practical talk on rebuilding critical banking ETL applications safely by validating the old and new systems side by side."
---

Rewriting critical banking ETL applications is risky because these systems handle business data that must stay accurate, stable, and traceable. In his JEurope 2025 talk, Dzmitry Paddubnik explains how his team rebuilt more than 20 banking ETL applications in Java without losing control of production risk.

The main lesson is simple: a rewrite is not just a coding project. It is a testing and validation project.

{{< youtube id="dqOmWhUGd2A" class="video" >}}

## Key takeaways

- Legacy ETL systems often contain years of hidden business rules.
- Unit tests alone are not enough for a large migration.
- The safest rewrite strategy is to compare old and new behavior side by side.
- Strong validation and rollout planning matter more than fancy architecture.
- In banking software, correctness is more important than speed.

## Why this matters

Many rewrite projects fail because teams try to replace too much at once. In critical banking systems, that creates a real risk of data mismatches and production issues.

A safer approach is to preserve the old system as a reference, rebuild carefully, and verify results at every step. That lets teams learn the real business rules embedded in the legacy system instead of assuming they are fully documented.

## What the talk demonstrates

Dzmitry’s talk is a good reminder that large-scale modernization succeeds when teams focus on confidence, not just code volume. Rewriting 20+ ETL applications takes more than a new codebase:

- You need a clear migration path.
- You need a way to compare outputs from both systems.
- You need discipline around rollout and verification.
- You need to protect production stability throughout the change.

That mindset is especially important in banking, where even small discrepancies can have outsized consequences.

## Conclusion

This talk is a practical reminder that successful software modernization depends on trust, testing, and incremental change. If you are planning a banking ETL migration or any legacy system rewrite, the real goal is not just new code. The goal is confidence.
