'use client';
import { useState } from 'react';
import { useHelp } from '@/bitcoin-core/components/Help/hooks';

export default function HelpPage() {
  const [query, setQuery] = useState<string>('');
  const [filter, setFilter] = useState('');
  const { help, error, isLoading } = useHelp(query);
  const rpcError = help?.error ?? null;
  const result = help?.result ?? null;

  // Parse help output into sections using '== Section ==' headers
  function parseGeneralHelpSections(text: string) {
    const lines = text.split('\n');
    const sections: Array<{
      header: string;
      items: Array<{ command: string; args?: string }>;
    }> = [];
    let currentSection: {
      header: string;
      items: Array<{ command: string; args?: string }>;
    } = { header: '', items: [] };
    for (const raw of lines) {
      const line = raw.trim();
      if (!line) continue;
      const sectionMatch = line.match(/^==\s*(.*?)\s*==$/);
      if (sectionMatch) {
        if (currentSection.items.length > 0 || currentSection.header) {
          sections.push(currentSection);
        }
        currentSection = { header: sectionMatch[1], items: [] };
        continue;
      }
      // Match: command followed by optional args
      const m = line.match(/^([a-zA-Z0-9_]+)(?:\s+(.*))?$/);
      if (m) {
        const command = m[1];
        const args = m[2]?.trim();
        currentSection.items.push({ command, args });
      }
    }
    if (currentSection.items.length > 0 || currentSection.header) {
      sections.push(currentSection);
    }
    return sections;
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 pt-16">
      <div className="mb-4">
        <h1 className="text-xl font-semibold text-white">Help</h1>
        <p className="mt-1 text-sm text-gray-400">
          <span className="font-semibold">bitcoin-cli help</span> — Browse and
          search Bitcoin Core RPC commands. Click a command to view its detailed
          help.
        </p>
      </div>
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        {!query && (
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter commands by prefix..."
              className="w-full rounded border border-gray-700 bg-gray-900 px-3 py-1.5 pr-10 text-sm text-gray-100 placeholder-gray-500 focus:border-orange-400 focus:outline-none"
            />
            {filter && (
              <button
                type="button"
                onClick={() => setFilter('')}
                className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-400 hover:text-orange-400 focus:outline-none"
                aria-label="Clear filter"
              >
                &#10005;
              </button>
            )}
          </div>
        )}
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="rounded bg-gray-700 px-3 py-1.5 text-sm text-white hover:bg-gray-600"
          >
            Back to list
          </button>
        )}
      </div>

      <div className="mt-4">
        {isLoading ? (
          <div className="rounded border border-gray-700 bg-gray-800 p-3 text-center text-sm text-gray-300">
            Loading…
          </div>
        ) : rpcError ? (
          <div className="rounded border border-red-700 bg-red-900/30 p-3 text-sm text-red-200">
            RPC Error: {rpcError.message} (code {rpcError.code})
          </div>
        ) : error ? (
          <div className="rounded border border-red-700 bg-red-900/30 p-3 text-sm text-red-200">
            {(() => {
              try {
                return JSON.stringify(error);
              } catch {
                return String(error);
              }
            })()}
          </div>
        ) : result ? (
          !query ? (
            <div className="space-y-6">
              {(() => {
                const sections = parseGeneralHelpSections(result);
                if (sections.length === 0) {
                  return (
                    <div className="rounded border border-gray-700 bg-gray-800 p-3 text-sm text-gray-300">
                      No commands found in help output.
                    </div>
                  );
                }
                return sections.map((section, sidx) => {
                  // Filter items by prefix if filter is not empty
                  const filteredItems = filter
                    ? section.items.filter((item) =>
                        item.command
                          .toLowerCase()
                          .startsWith(filter.toLowerCase())
                      )
                    : section.items;
                  if (filteredItems.length === 0) return null;
                  return (
                    <div
                      key={section.header || sidx}
                      className="mb-4 rounded border border-gray-700 bg-gray-800 p-4"
                    >
                      {section.header && (
                        <div className="mb-2 text-sm font-semibold tracking-wide text-orange-300 uppercase">
                          {section.header}
                        </div>
                      )}
                      <div className="flex flex-col gap-0">
                        {filteredItems.map(({ command, args }, idx) => (
                          <div
                            key={`${command}-${idx}`}
                            className="flex items-start py-1"
                          >
                            <button
                              type="button"
                              className="px-1 py-0 text-sm font-medium text-gray-300 hover:underline focus:outline-none"
                              style={{
                                background: 'none',
                                border: 'none',
                                fontWeight: 500,
                                color: '#d1d5db',
                                padding: 0,
                                margin: 0,
                                minWidth: 0,
                              }}
                              onClick={() => {
                                setQuery(command);
                              }}
                            >
                              {command}
                            </button>
                            <div className="ml-3 flex-1 text-xs text-gray-200">
                              {args ? (
                                <span className="font-mono">{args}</span>
                              ) : (
                                <span className="text-gray-400">
                                  No arguments
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                });
              })()}
            </div>
          ) : (
            <CommandHelpDetail result={result} />
          )
        ) : (
          <div className="rounded border border-gray-700 bg-gray-800 p-3 text-sm text-gray-300">
            Submit to fetch general help or a specific command.
          </div>
        )}
      </div>
    </div>
  );
}

// Helper component to format command help details
function CommandHelpDetail({ result }: { result: string }) {
  // Split into lines and basic parsing
  const lines = result.split('\n');
  const title = lines[0] || '';
  // Find the first non-empty, non-title line as subtitle
  let subtitle = '';
  let i = 1;
  while (i < lines.length && !subtitle) {
    const l = lines[i].trim();
    if (l && l !== title) subtitle = l;
    i++;
  }
  // The rest is the body
  const bodyLines = lines.slice(i);

  // Helper: is a code/example line
  function isCodeLine(line: string) {
    return (
      /^\s/.test(line) ||
      line.includes('bitcoin-cli') ||
      line.includes('bitcoin-qt') ||
      line.includes('curl') ||
      line.startsWith('$') ||
      /Usage:|Example:|^[a-zA-Z0-9_]+\(.*\)/.test(line)
    );
  }

  // Helper: is a JSON line or part of a JSON block
  function isJsonLine(line: string) {
    const trimmed = line.trim();
    if (!trimmed) return false;
    // Heuristic: starts with { or [ or ends with } or ] or looks like a key-value
    if (/^[{\[]/.test(trimmed) || /[}\]]$/.test(trimmed)) return true;
    if (/^\s*"[^"]+"\s*:\s*/.test(trimmed)) return true;
    // Try to parse as JSON (single line)
    try {
      const parsed = JSON.parse(trimmed);
      return typeof parsed === 'object';
    } catch {
      return false;
    }
  }

  // Improved: Group lines into blocks, keeping multi-line JSON objects/arrays together
  type BlockType =
    | 'code'
    | 'json'
    | 'text'
    | 'arguments-header'
    | 'argument-item';
  const blocks: Array<{ type: BlockType; lines: string[] }> = [];
  let current: { type: BlockType; lines: string[] } | null = null;
  let inJsonBlock = false;
  let jsonBracketStack: string[] = [];
  let inArgumentsSection = false;
  for (let idx = 0; idx < bodyLines.length; idx++) {
    const line = bodyLines[idx];
    const trimmed = line.trim();
    // If we see 'Arguments:' alone, treat as header and start arguments section
    if (trimmed === 'Arguments:') {
      if (current) blocks.push(current);
      blocks.push({ type: 'arguments-header', lines: [line] });
      inArgumentsSection = true;
      continue;
    }
    // If in arguments section, look for numbered argument lines
    if (inArgumentsSection) {
      const argMatch = trimmed.match(/^(\d+)\.\s+(\S+)(.*)$/);
      if (argMatch) {
        // argMatch[2] is the argument, argMatch[3] is the description
        blocks.push({
          type: 'argument-item',
          lines: [argMatch[2], argMatch[3].trim()],
        });
        continue;
      }
      // End arguments section on blank line or non-matching line
      if (!trimmed) {
        inArgumentsSection = false;
        continue;
      }
      // If not blank and not matching, treat as normal text
      inArgumentsSection = false;
    }
    // If we see 'Examples:' alone, always break any block and treat as text
    if (trimmed === 'Examples:') {
      if (current) blocks.push(current);
      current = { type: 'text', lines: [line] };
      inJsonBlock = false;
      jsonBracketStack = [];
      continue;
    }
    // Detect start of JSON block
    if (!inJsonBlock && (trimmed.startsWith('{') || trimmed.startsWith('['))) {
      inJsonBlock = true;
      jsonBracketStack = [trimmed[0]];
      if (current) blocks.push(current);
      current = { type: 'json', lines: [line] };
      continue;
    }
    // If inside JSON block, track brackets to find the end
    if (inJsonBlock) {
      if (current) current.lines.push(line);
      // Count brackets/braces
      for (const char of trimmed) {
        if (char === '{' || char === '[') jsonBracketStack.push(char);
        if (char === '}' || char === ']') jsonBracketStack.pop();
      }
      if (jsonBracketStack.length === 0) {
        // End of JSON block
        if (current) blocks.push(current);
        current = null;
        inJsonBlock = false;
      }
      continue;
    }
    // Not in JSON block: use heuristics for code/text
    const type = isJsonLine(line) ? 'json' : isCodeLine(line) ? 'code' : 'text';
    if (!current || current.type !== type) {
      if (current) blocks.push(current);
      current = { type, lines: [line] };
    } else {
      current.lines.push(line);
    }
  }
  if (current) blocks.push(current);

  return (
    <div className="rounded border border-gray-700 bg-gray-800 p-4 text-gray-100">
      <div className="mb-1 text-lg font-bold text-orange-200">{title}</div>
      {subtitle && <div className="mb-3 text-sm text-gray-300">{subtitle}</div>}
      <div className="space-y-1 text-sm">
        {blocks.map((block, idx) => {
          if (block.type === 'code') {
            return (
              <pre
                key={idx}
                className="rounded bg-gray-900/60 px-2 py-1 font-mono text-xs wrap-break-word whitespace-pre-wrap text-blue-200"
              >
                {block.lines.join('\n')}
              </pre>
            );
          } else if (block.type === 'json') {
            return (
              <pre
                key={idx}
                className="rounded bg-green-900/60 px-2 py-1 font-mono text-xs wrap-break-word whitespace-pre-wrap text-green-200"
              >
                {block.lines.join('\n')}
              </pre>
            );
          } else if (block.type === 'arguments-header') {
            return (
              <div
                key={idx}
                className="mt-3 mb-1 font-semibold text-orange-300"
              >
                Arguments:
              </div>
            );
          } else if (block.type === 'argument-item') {
            return (
              <div key={idx} className="ml-4 flex items-start gap-2">
                <span className="rounded bg-gray-900/40 px-2 py-0.5 font-mono text-xs text-blue-200">
                  {block.lines[0]}
                </span>
                <span className="text-gray-200">{block.lines[1]}</span>
              </div>
            );
          } else {
            return block.lines.map((l, i) => <div key={i}>{l}</div>);
          }
        })}
      </div>
    </div>
  );
}
