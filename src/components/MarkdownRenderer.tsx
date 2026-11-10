import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopyCode = (codeText: string, index: number) => {
    navigator.clipboard.writeText(codeText);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Split content by code blocks ```lang ... ```
  const codeBlockRegex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let codeBlockCount = 0;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const textBefore = content.slice(lastIndex, match.index);
    if (textBefore) {
      parts.push(renderFormattedText(textBefore, `text-${lastIndex}`));
    }

    const language = match[1] || 'code';
    const codeBody = match[2].trimEnd();
    const currentIndex = codeBlockCount++;

    parts.push(
      <div
        key={`code-${match.index}`}
        className="my-3 rounded-xl overflow-hidden border border-purple-200/40 dark:border-purple-900/40 bg-slate-900 text-slate-100 shadow-sm"
      >
        <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-800/80 border-b border-slate-700/50 text-xs text-slate-400">
          <span className="font-mono lowercase">{language}</span>
          <button
            type="button"
            onClick={() => handleCopyCode(codeBody, currentIndex)}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-xs text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors"
            title="Copy code"
          >
            {copiedIndex === currentIndex ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
        <pre className="p-3.5 overflow-x-auto text-xs md:text-sm font-mono text-slate-100 leading-relaxed">
          <code>{codeBody}</code>
        </pre>
      </div>
    );

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    parts.push(renderFormattedText(content.slice(lastIndex), `text-${lastIndex}`));
  }

  return <div className={`space-y-2 leading-relaxed text-sm md:text-base ${className}`}>{parts}</div>;
};

function renderFormattedText(rawText: string, keyPrefix: string): React.ReactNode {
  const lines = rawText.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];
  let isNumberedList = false;

  const flushList = (idx: number) => {
    if (listItems.length > 0) {
      if (isNumberedList) {
        elements.push(
          <ol key={`${keyPrefix}-list-${idx}`} className="list-decimal pl-5 space-y-1 my-1.5 text-slate-700 dark:text-slate-300">
            {listItems}
          </ol>
        );
      } else {
        elements.push(
          <ul key={`${keyPrefix}-list-${idx}`} className="list-disc pl-5 space-y-1 my-1.5 text-slate-700 dark:text-slate-300">
            {listItems}
          </ul>
        );
      }
      listItems = [];
    }
  };

  lines.forEach((line, lineIdx) => {
    const trimmed = line.trim();

    // Empty line flushes lists
    if (!trimmed) {
      flushList(lineIdx);
      return;
    }

    // Headers
    if (trimmed.startsWith('### ')) {
      flushList(lineIdx);
      elements.push(
        <h4 key={`${keyPrefix}-h4-${lineIdx}`} className="font-semibold text-base mt-2 mb-1 text-slate-900 dark:text-white">
          {formatInline(trimmed.slice(4))}
        </h4>
      );
      return;
    }
    if (trimmed.startsWith('## ')) {
      flushList(lineIdx);
      elements.push(
        <h3 key={`${keyPrefix}-h3-${lineIdx}`} className="font-bold text-lg mt-3 mb-1 text-purple-950 dark:text-purple-100">
          {formatInline(trimmed.slice(3))}
        </h3>
      );
      return;
    }
    if (trimmed.startsWith('# ')) {
      flushList(lineIdx);
      elements.push(
        <h2 key={`${keyPrefix}-h2-${lineIdx}`} className="font-bold text-xl mt-3 mb-1 text-purple-950 dark:text-purple-100">
          {formatInline(trimmed.slice(2))}
        </h2>
      );
      return;
    }

    // Bullet points
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      isNumberedList = false;
      listItems.push(
        <li key={`${keyPrefix}-li-${lineIdx}`} className="leading-snug">
          {formatInline(trimmed.slice(2))}
        </li>
      );
      return;
    }

    // Numbered list items
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (numMatch) {
      isNumberedList = true;
      listItems.push(
        <li key={`${keyPrefix}-oli-${lineIdx}`} className="leading-snug">
          {formatInline(numMatch[2])}
        </li>
      );
      return;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      flushList(lineIdx);
      elements.push(
        <blockquote
          key={`${keyPrefix}-quote-${lineIdx}`}
          className="pl-3 py-1 my-1.5 italic text-slate-600 dark:text-slate-400 border-l-2 border-purple-400 dark:border-purple-600 bg-purple-50/50 dark:bg-purple-950/20 rounded-r-lg"
        >
          {formatInline(trimmed.slice(2))}
        </blockquote>
      );
      return;
    }

    // Regular paragraph
    flushList(lineIdx);
    elements.push(
      <p key={`${keyPrefix}-p-${lineIdx}`} className="text-slate-800 dark:text-slate-200">
        {formatInline(line)}
      </p>
    );
  });

  flushList(lines.length);

  return <React.Fragment key={keyPrefix}>{elements}</React.Fragment>;
}

function formatInline(text: string): React.ReactNode {
  // Bold **text**
  const boldParts = text.split(/(\*\*[^*]+\*\*)/g);
  return boldParts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-semibold text-slate-900 dark:text-white">
          {formatItalicAndCode(part.slice(2, -2))}
        </strong>
      );
    }
    return formatItalicAndCode(part);
  });
}

function formatItalicAndCode(text: string): React.ReactNode {
  // Inline code `code`
  const codeParts = text.split(/(`[^`]+`)/g);
  return codeParts.map((part, j) => {
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={j}
          className="px-1.5 py-0.5 mx-0.5 text-xs font-mono font-medium rounded-md bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-200 border border-purple-200/50 dark:border-purple-800/50"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    // Italic *text* or _text_
    const italicParts = part.split(/(\*[^*]+\*)/g);
    return italicParts.map((sub, k) => {
      if (sub.startsWith('*') && sub.endsWith('*') && sub.length > 2) {
        return (
          <em key={k} className="italic">
            {sub.slice(1, -1)}
          </em>
        );
      }
      return sub;
    });
  });
}
