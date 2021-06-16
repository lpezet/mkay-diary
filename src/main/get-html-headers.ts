import * as htmlparser from "htmlparser2";
import * as md from "@textlint/markdown-to-ast";
import { TxtNode } from "@textlint/ast-node-types";

const addLinenos = (lines: string[], headers: TxtNode[]) => {
  let current = 0;
  let line;

  return headers.map(function (x) {
    for (let lineno = current; lineno < lines.length; lineno++) {
      line = lines[lineno];
      if (new RegExp(x.text[0]).test(line)) {
        current = lineno;
        x.line = lineno;
        x.name = x.text.join("");
        return x;
      }
    }

    // in case we didn't find a matching line, which is odd,
    // we'll have to assume it's right on the next line
    x.line = ++current;
    x.name = x.text.join("");
    return x;
  });
};

const rankify = (headers: TxtNode[], max: number) => {
  return headers
    .map(function (x) {
      x.rank = parseInt(x.tag.slice(1), 10);
      return x;
    })
    .filter(function (x) {
      return x.rank <= max;
    });
};

export default function go(lines: string[], maxHeaderLevel: number) {
  const source = md
    .parse(lines.join("\n"))
    .children.filter(function (node: TxtNode) {
      return node.type === md.Syntax.HtmlBlock || node.type === md.Syntax.Html;
    })
    .map(function (node: TxtNode) {
      return node.raw;
    })
    .join("\n");

  //const headers = [], grabbing = null, text = [];
  let headers: any[] = [];
  const grabbing: string[] = [];
  let text: string[] = [];

  const parser = new htmlparser.Parser(
    {
      onopentag: function (name, _attr) {
        // Short circuit if we're already inside a pre
        if (grabbing[grabbing.length - 1] === "pre") return;

        if (name === "pre" || /h\d/.test(name)) {
          grabbing.push(name);
        }
      },
      ontext: function (text_) {
        // Explicitly skip pre tags, and implicitly skip all others
        if (grabbing.length === 0 || grabbing[grabbing.length - 1] === "pre")
          return;

        text.push(text_);
      },
      onclosetag: function (name) {
        if (grabbing.length === 0) return;
        if (grabbing[grabbing.length - 1] === name) {
          const tag = grabbing.pop();
          headers.push({ text: text, tag: tag });
          text = [];
        }
      },
    },
    { decodeEntities: true }
  );

  parser.write(source);
  parser.end();

  headers = addLinenos(lines, headers);
  // consider anything past h4 to small to warrant a link, may be made configurable in the future
  headers = rankify(headers, maxHeaderLevel);
  return headers;
}
