"use client";

import type { ReactNode } from "react";

type Props = { content: string };

function inline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^\)]+\))/g);
  return parts.map((part, i) => {
    if (!part) return null;
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={i}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("`") && part.endsWith("`")) return <code key={i}>{part.slice(1, -1)}</code>;
    const link = part.match(/^\[([^\]]+)\]\(([^\)]+)\)$/);
    if (link) return <a key={i} href={link[2]} target="_blank" rel="noreferrer">{link[1]}</a>;
    return <span key={i}>{part}</span>;
  });
}

function isTableRow(line: string) { return line.trim().startsWith("|") && line.trim().endsWith("|"); }
function isSeparator(line: string) { return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line); }

export function AgentMarkdown({ content }: Props) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const nodes: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const raw = lines[i];
    const line = raw.trim();
    if (!line) { i++; continue; }

    if (isTableRow(line) && i + 1 < lines.length && isSeparator(lines[i + 1])) {
      const headers = line.replace(/^\||\|$/g, "").split("|").map((x) => x.trim());
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && isTableRow(lines[i])) {
        rows.push(lines[i].trim().replace(/^\||\|$/g, "").split("|").map((x) => x.trim()));
        i++;
      }
      nodes.push(<div className="agent-table-wrap" key={`table-${i}`}><table className="agent-table"><thead><tr>{headers.map((h, n) => <th key={n}>{inline(h)}</th>)}</tr></thead><tbody>{rows.map((row, r) => <tr key={r}>{headers.map((_, c) => <td key={c}>{inline(row[c] ?? "")}</td>)}</tr>)}</tbody></table></div>);
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const Tag = heading[1].length === 1 ? "h3" : "h4";
      nodes.push(<Tag className="agent-md-heading" key={`h-${i}`}>{inline(heading[2])}</Tag>);
      i++; continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*[-*]\s+/, "")); i++; }
      nodes.push(<ul className="agent-md-list" key={`ul-${i}`}>{items.map((item, n) => <li key={n}>{inline(item)}</li>)}</ul>);
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*\d+\.\s+/, "")); i++; }
      nodes.push(<ol className="agent-md-list" key={`ol-${i}`}>{items.map((item, n) => <li key={n}>{inline(item)}</li>)}</ol>);
      continue;
    }

    nodes.push(<p className="agent-md-p" key={`p-${i}`}>{inline(line)}</p>);
    i++;
  }

  return <div className="agent-markdown">{nodes}</div>;
}
