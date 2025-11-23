/**
 * Renders markdown content with custom styling for chat messages.
 * Supports GitHub Flavored Markdown (GFM) and provides role-specific
 * styling for user and assistant messages, including custom formatting
 * for code blocks, lists, links, headings, and blockquotes.
 */

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type MarkdownProps = {
  content: string;
  role: 'user' | 'assistant';
};

export function Markdown({ content, role }: MarkdownProps) {
  return (
    <div className='prose prose-sm max-w-none'>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className='mb-2 last:mb-0'>{children}</p>,
          ul: ({ children }) => (
            <ul className='list-disc pl-4 mb-2'>{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className='list-decimal pl-4 mb-2'>{children}</ol>
          ),
          li: ({ children }) => <li className='mb-1'>{children}</li>,
          code: ({ className, children }) => {
            const isInline = !className;
            return isInline ? (
              <code
                className={`px-1 py-0.5 rounded text-sm font-mono ${
                  role === 'user'
                    ? 'bg-blue-400 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {children}
              </code>
            ) : (
              <code
                className={`${className} block p-2 rounded text-sm font-mono overflow-x-auto ${
                  role === 'user'
                    ? 'bg-blue-400 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className='mb-2 last:mb-0'>{children}</pre>
          ),
          h1: ({ children }) => (
            <h1 className='text-2xl font-bold mb-2'>{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className='text-xl font-bold mb-2'>{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className='text-lg font-bold mb-2'>{children}</h3>
          ),
          blockquote: ({ children }) => (
            <blockquote
              className={`border-l-4 pl-4 italic mb-2 ${
                role === 'user' ? 'border-blue-300' : 'border-gray-300'
              }`}
            >
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className={`hover:underline ${
                role === 'user' ? 'text-blue-100' : 'text-blue-600'
              }`}
              target='_blank'
              rel='noopener noreferrer'
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
