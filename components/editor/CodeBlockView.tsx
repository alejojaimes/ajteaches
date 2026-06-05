'use client';

import { NodeViewContent, NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';

const LANGUAGES = [
  { value: '', label: 'Auto' },
  { value: 'bash', label: 'Bash' },
  { value: 'c', label: 'C' },
  { value: 'cpp', label: 'C++' },
  { value: 'css', label: 'CSS' },
  { value: 'go', label: 'Go' },
  { value: 'html', label: 'HTML' },
  { value: 'java', label: 'Java' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'json', label: 'JSON' },
  { value: 'python', label: 'Python' },
  { value: 'rust', label: 'Rust' },
  { value: 'sql', label: 'SQL' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'xml', label: 'XML' },
  { value: 'yaml', label: 'YAML' },
];

export function CodeBlockView({ node, updateAttributes }: NodeViewProps) {
  const lang = (node.attrs as { language: string | null }).language ?? '';

  return (
    <NodeViewWrapper className="code-block-wrapper">
      <div className="code-block-meta" contentEditable={false}>
        <select
          value={lang}
          onChange={(e) => updateAttributes({ language: e.target.value || null })}
          className="code-lang-select"
        >
          {LANGUAGES.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
      </div>
      <pre>
        <NodeViewContent as={'code' as 'div'} />
      </pre>
    </NodeViewWrapper>
  );
}
