function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function inlineFormat(text) {
  // Pull out inline code spans first so ** / * inside them aren't touched
  const codeSpans = [];
  text = text.replace(/`([^`]+?)`/g, (_, code) => {
    codeSpans.push(code);
    return `@@CODE${codeSpans.length - 1}@@`;
  });

  text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\*(.+?)\*/g, '<em>$1</em>');

  text = text.replace(/@@CODE(\d+)@@/g, (_, idx) => `<code>${codeSpans[Number(idx)]}</code>`);
  return text;
}

// Converts a small markdown subset (headings, bold, italic, inline code,
// fenced code blocks, bullet lists, blockquote, paragraphs) into safe HTML.
// Input is escaped first, so this never introduces raw HTML.
export function renderMarkdownLite(raw) {
  if (!raw) return '';
  let escaped = escapeHtml(raw);

  // Extract fenced code blocks first so their contents are never touched
  // by line-based parsing or inline formatting
  const codeBlocks = [];
  escaped = escaped.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) => {
    codeBlocks.push(code.replace(/\n$/, ''));
    return `\n@@CODEBLOCK${codeBlocks.length - 1}@@\n`;
  });

  const lines = escaped.split('\n');
  const output = [];
  let paraBuffer = [];
  let listBuffer = [];
  let quoteBuffer = [];

  const flushPara = () => {
    if (paraBuffer.length) {
      output.push(`<p>${paraBuffer.join('<br/>')}</p>`);
      paraBuffer = [];
    }
  };
  const flushList = () => {
    if (listBuffer.length) {
      output.push(`<ul>${listBuffer.map((li) => `<li>${li}</li>`).join('')}</ul>`);
      listBuffer = [];
    }
  };
  const flushQuote = () => {
    if (quoteBuffer.length) {
      output.push(`<blockquote>${quoteBuffer.join('<br/>')}</blockquote>`);
      quoteBuffer = [];
    }
  };
  const flushAll = () => {
    flushPara();
    flushList();
    flushQuote();
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed === '') {
      flushAll();
      continue;
    }

    const codeBlockMatch = trimmed.match(/^@@CODEBLOCK(\d+)@@$/);
    if (codeBlockMatch) {
      flushAll();
      output.push(`<pre><code>${codeBlocks[Number(codeBlockMatch[1])]}</code></pre>`);
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,6})\s+(.*)$/);
    if (headingMatch) {
      flushAll();
      const level = headingMatch[1].length;
      output.push(`<h${level}>${inlineFormat(headingMatch[2])}</h${level}>`);
      continue;
    }

    const hrMatch = trimmed.match(/^(-{3,}|\*{3,}|_{3,})$/);
    if (hrMatch) {
      flushAll();
      output.push('<hr/>');
      continue;
    }

    const listMatch = line.match(/^\s*[-*]\s+(.*)$/);
    if (listMatch) {
      flushPara();
      flushQuote();
      listBuffer.push(inlineFormat(listMatch[1]));
      continue;
    }

    const quoteMatch = line.match(/^&gt;\s?(.*)$/);
    if (quoteMatch) {
      flushPara();
      flushList();
      quoteBuffer.push(inlineFormat(quoteMatch[1]));
      continue;
    }

    flushList();
    flushQuote();
    paraBuffer.push(inlineFormat(line));
  }
  flushAll();

  return output.join('');
}

// Wraps (or unwraps) the current textarea selection with prefix/suffix,
// e.g. for bold (**), italic (*), or inline code (`). Falls back to
// inserting placeholder text when nothing is selected.
export function wrapSelection(textarea, value, onChange, marker, placeholder) {
  if (!textarea) return;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = value.slice(start, end);
  const already =
    selected &&
    value.slice(start - marker.length, start) === marker &&
    value.slice(end, end + marker.length) === marker;

  let newValue, newStart, newEnd;
  if (already) {
    newValue =
      value.slice(0, start - marker.length) + selected + value.slice(end + marker.length);
    newStart = start - marker.length;
    newEnd = newStart + selected.length;
  } else {
    const text = selected || placeholder;
    newValue = value.slice(0, start) + marker + text + marker + value.slice(end);
    newStart = start + marker.length;
    newEnd = newStart + text.length;
  }

  onChange(newValue);
  requestAnimationFrame(() => {
    textarea.focus();
    textarea.setSelectionRange(newStart, newEnd);
  });
}

// Prefixes (or un-prefixes) every line touching the current selection with "> "
export function toggleQuote(textarea, value, onChange) {
  if (!textarea) return;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const lineStart = value.lastIndexOf('\n', start - 1) + 1;
  let lineEnd = value.indexOf('\n', end);
  if (lineEnd === -1) lineEnd = value.length;

  const block = value.slice(lineStart, lineEnd);
  const allQuoted = block.split('\n').every((l) => l.startsWith('> ') || l === '');
  const newBlock = block
    .split('\n')
    .map((l) => {
      if (allQuoted) return l.startsWith('> ') ? l.slice(2) : l;
      return l.startsWith('> ') ? l : `> ${l}`;
    })
    .join('\n');

  const newValue = value.slice(0, lineStart) + newBlock + value.slice(lineEnd);
  onChange(newValue);
  requestAnimationFrame(() => {
    textarea.focus();
    textarea.setSelectionRange(lineStart, lineStart + newBlock.length);
  });
}

// Inserts a fenced code block around the current selection (or a placeholder)
export function insertCodeBlock(textarea, value, onChange, placeholder) {
  if (!textarea) return;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = value.slice(start, end) || placeholder;
  const before = value.slice(0, start);
  const after = value.slice(end);

  const prefix = before.length === 0 || before.endsWith('\n') ? '' : '\n';
  const suffix = after.length === 0 || after.startsWith('\n') ? '' : '\n';
  const block = '```\n' + selected + '\n```';

  const newValue = before + prefix + block + suffix + after;
  onChange(newValue);

  const codeStart = before.length + prefix.length + 4;
  requestAnimationFrame(() => {
    textarea.focus();
    textarea.setSelectionRange(codeStart, codeStart + selected.length);
  });
}

// Toggles a "### " heading marker on the current line
export function toggleHeading(textarea, value, onChange, level = 3) {
  if (!textarea) return;
  const start = textarea.selectionStart;
  const lineStart = value.lastIndexOf('\n', start - 1) + 1;
  let lineEnd = value.indexOf('\n', start);
  if (lineEnd === -1) lineEnd = value.length;

  const line = value.slice(lineStart, lineEnd);
  const marker = '#'.repeat(level) + ' ';
  const stripped = line.replace(/^#{1,6}\s+/, '');
  const newLine = line.startsWith(marker) ? stripped : marker + stripped;

  const newValue = value.slice(0, lineStart) + newLine + value.slice(lineEnd);
  onChange(newValue);
  requestAnimationFrame(() => {
    textarea.focus();
    textarea.setSelectionRange(lineStart + newLine.length, lineStart + newLine.length);
  });
}

// Prefixes (or un-prefixes) every line touching the current selection with "* "
export function toggleList(textarea, value, onChange) {
  if (!textarea) return;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const lineStart = value.lastIndexOf('\n', start - 1) + 1;
  let lineEnd = value.indexOf('\n', end);
  if (lineEnd === -1) lineEnd = value.length;

  const block = value.slice(lineStart, lineEnd);
  const allListed = block.split('\n').every((l) => /^[-*]\s/.test(l) || l === '');
  const newBlock = block
    .split('\n')
    .map((l) => {
      if (allListed) return l.replace(/^[-*]\s+/, '');
      return /^[-*]\s/.test(l) ? l : `* ${l}`;
    })
    .join('\n');

  const newValue = value.slice(0, lineStart) + newBlock + value.slice(lineEnd);
  onChange(newValue);
  requestAnimationFrame(() => {
    textarea.focus();
    textarea.setSelectionRange(lineStart, lineStart + newBlock.length);
  });
}
