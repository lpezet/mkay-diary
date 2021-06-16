# MKay Diary

Very simple daily entries to embed within your Readme.md.

Run `mkay e` to start a new daily entry or edit the existing entry.
Run `mkay g` to generate the full diary and embed it (if specified) in your Readme.md.

# Table of Contents

<!-- START doctoc -->
<!-- END doctoc -->

# Installation

To generate full diary within your `Readme.md`, simply add the following tags:

```html
<!-- START mkay-diary -->
<!-- END mkay-diary -->
```

# Features

The goal of this tool is to help generate and integrate a simple dev diary. Working on lots of small projects, I found it useful to keep a diary, with simple daily entries.
For example, going back to those entries after long periods of coding idleness helps remember where things were left off.
Other times, without being away too long, it helps reading through a train a thought written down.

# Usage

To create a new entry, or edit the current day's entry, run:

```bash
mkay e
```

This will create (or edit) a file in `.diary/entries/` folder, using a path like `YYYY/mm/DD`. So if we are in March 7th 2021, the entry would be `.diary/entries/2021/03/07.md`.

To generate the full diary, run:

```bash
mkay i
```

This will generate `.diary/full.md` using all entries in `.diary/entries/`.

To embed all those entries in your `Readme.md`, add the necessary tags and run:

```bash
mkay g
```

# Configuration

# Diary

This is where the diary of this project is embedded.

<!-- e4a49e0START mkay-diary -->
[//]: # (DO NOT EDIT THE FOLLOWING. This content is automatically generated from diary entries.)

## Entry for 06/02/21

THis is a test.
Here I talk about toto, titi, and tata.

## Entry for 06/03/21

This is also a test. But I only talk about tutu here.

## Entry for 06/06/21

Decided today to spice things up a bit.
Some ideas:

- Some static part of the diary: things that can be edited but outside the normal daily entries.
- Maybe concat all entries WITHIN say the Readme.md (like doctoc). In this case some template/tags are just needed and the static part is just whatever's in the Readme.md already. This should be easy to do with say `sed`.
- Decided to rename boring "my-diary" to something more...different: "mkay-diary", with the binary being "mkay", m'kay?

For #2 above, tags could simply be `START mkay-diary` and `END mkay-diary`, and be replaced by `START mkay-diary generated diary please keep comment here to allow auto update` and `END mkay-diary` (unchanged) respectively, with the content in between.

## Entry for 06/10/21

Need to convert `mkay` from `bash` to `nodejs` (`typescript` of course).
This will allow from better handling of files (tags, replacing, etc.) but more importantly easier, more efficient, cross-platform, and most importantly, more testable.

# Entry for 06/13/2021

First day converting app to Node.js. So far so good.

# Entry for 06/15/2021

New entry.

<!-- e4a49e0END mkay-diary -->

# License

[MIT](LICENSE)
