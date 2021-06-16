/*
 * Based on doctoc's transform.js
 */
import * as _ from "underscore";
import anchorMarkdownHeader from "@technote-space/anchor-markdown-header";
import { parse, ParseResult, updateSection } from "./update-section";
import getHtmlHeaders from "./get-html-headers";
import * as md from "@textlint/markdown-to-ast";
import { TxtNode } from "@textlint/ast-node-types";
/*
const _ = require("underscore"),
  anchor = require("anchor-markdown-header"),
  updateSection = require("update-section"),
  getHtmlHeaders = require("./get-html-headers"),
  md = require("@textlint/markdown-to-ast");
*/
/*
type MarkdownHeader = {
  rank: number;
  name: string;
  line: string;
};
*/

export const start =
  "<!-- START mkay-diary generated TOC please keep comment here to allow auto update -->\n" +
  "<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->";
export const end =
  "<!-- END mkay-diary generated TOC please keep comment here to allow auto update -->";

const matchesStart = (line: string): boolean => {
  return /<!-- START mkay-diary /.test(line);
};

const matchesEnd = (line: string): boolean => {
  return /<!-- END mkay-diary /.test(line);
};

const notNull = (x: any): boolean => {
  return x !== null;
};

const addAnchor = (mode: string, header: TxtNode): TxtNode => {
  header.anchor = anchorMarkdownHeader(header.name, mode, header.instance);
  return header;
};
/*
const isString = (y: any): boolean => {
  return typeof y === "string";
};
*/
const getMarkdownHeaders = (
  lines: string[],
  maxHeaderLevel?: number
): TxtNode[] => {
  function extractText(header: TxtNode) {
    return header.children
      .map(function (x: TxtNode) {
        if (x.type === md.Syntax.Link) {
          return extractText(x);
        } else if (x.type === md.Syntax.Image) {
          // Images (at least on GitHub, untested elsewhere) are given a hyphen
          // in the slug. We can achieve this behavior by adding an '*' to the
          // TOC entry. Think of it as a "magic char" that represents the iamge.
          return "*";
        } else {
          return x.raw;
        }
      })
      .join("");
  }

  const res = md
    .parse(lines.join("\n"))
    .children.filter(function (x: TxtNode) {
      return x.type === md.Syntax.Header;
    })
    .map(function (x: TxtNode) {
      return !maxHeaderLevel || x.depth <= maxHeaderLevel
        ? { rank: x.depth, name: extractText(x), line: x.loc.start.line }
        : null;
    })
    .filter(notNull);
  return res;
};

const countHeaders = (headers: TxtNode[]): TxtNode[] => {
  const instances: { [key: string]: number } = {};

  for (let i = 0; i < headers.length; i++) {
    const header = headers[i];
    const name = header.name;

    if (Object.prototype.hasOwnProperty.call(instances, name)) {
      // `instances.hasOwnProperty(name)` fails when there’s an instance named "hasOwnProperty".
      instances[name]++;
    } else {
      instances[name] = 0;
    }

    header.instance = instances[name];
  }

  return headers;
};

function getLinesToToc(
  lines: string[],
  currentToc: string,
  info: ParseResult,
  processAll?: boolean
): string[] {
  if (processAll || !currentToc) return lines;

  let tocableStart = 0;

  // when updating an existing toc, we only take the headers into account
  // that are below the existing toc
  if (info.hasEnd) tocableStart = info.endIdx + 1;

  return lines.slice(tocableStart);
}

// Use document context as well as command line args to infer the title
const determineTitle = (
  title?: string,
  notitle?: boolean,
  lines?: string[],
  info?: ParseResult
) => {
  const defaultTitle =
    "**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*";

  if (notitle) return "";
  if (title) return title;
  if (!lines) return defaultTitle;
  return info?.hasStart ? lines[info.startIdx + 2] : defaultTitle;
};

export type TransformResult = {
  transformed: boolean;
  data?: string;
  toc?: string;
  wrappedToc?: string;
};

export function transform(
  content: string,
  mode?: string,
  maxHeaderLevel?: number,
  title?: string,
  notitle?: boolean,
  entryPrefix?: string,
  processAll?: boolean,
  updateOnly?: boolean
): TransformResult {
  mode = mode || "github.com";
  entryPrefix = entryPrefix || "-";

  // only limit *HTML* headings by default
  const maxHeaderLevelHtml = maxHeaderLevel || 4;

  const lines = content.split("\n"),
    info = parse(lines, matchesStart, matchesEnd);

  if (!info.hasStart && updateOnly) {
    return { transformed: false };
  }

  const inferredTitle = determineTitle(title, notitle, lines, info);

  const titleSeparator = inferredTitle ? "\n\n" : "\n";

  const currentToc =
    (info.hasStart && lines.slice(info.startIdx, info.endIdx + 1).join("\n")) ||
    "";
  const linesToToc = getLinesToToc(lines, currentToc, info, processAll);

  const headers = getMarkdownHeaders(linesToToc, maxHeaderLevel).concat(
    getHtmlHeaders(linesToToc, maxHeaderLevelHtml)
  );

  headers.sort(function (a: TxtNode, b: TxtNode) {
    return a.line - b.line;
  });

  const allHeaders = countHeaders(headers),
    lowestRank = _(allHeaders).chain().pluck("rank").min().value(),
    linkedHeaders = _(allHeaders).map(addAnchor.bind(null, mode));

  if (linkedHeaders.length === 0) return { transformed: false };

  // 4 spaces required for proper indention on Bitbucket and GitLab
  const indentation =
    mode === "bitbucket.org" || mode === "gitlab.com" ? "    " : "  ";

  const toc =
    inferredTitle +
    titleSeparator +
    linkedHeaders
      .map(function (x: TxtNode) {
        const indent = _(_.range(x.rank - lowestRank)).reduce(function (
          acc,
          _x
        ) {
          return acc + indentation;
        },
        "");

        return indent + entryPrefix + " " + x.anchor;
      })
      .join("\n") +
    "\n";

  const wrappedToc = start + "\n" + toc + "\n" + end;

  if (currentToc === toc) return { transformed: false };

  const data = updateSection(
    lines.join("\n"),
    wrappedToc,
    matchesStart,
    matchesEnd,
    true
  );
  return { transformed: true, data: data, toc: toc, wrappedToc: wrappedToc };
}
