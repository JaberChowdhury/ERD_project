import Prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/themes/prism-tomorrow.css';

Prism.languages.dsl = {
  'table-name': {
    pattern: /^[a-zA-Z0-9_]+\s*(?=\[|\{)/m,
    alias: 'class-name'
  },
  'property': {
    pattern: /\[.*?\]/,
    inside: {
      'attr-name': /[a-zA-Z0-9]+(?=:)/,
      'punctuation': /:|,|\[|\]/,
      'string': /[a-zA-Z0-9_-]+/
    }
  },
  'keyword': /\b(pk)\b/,
  'type': {
    pattern: /\b(string|number|boolean|timestamp|date|text)\b/,
    alias: 'builtin'
  },
  'operator': /<>|<|-/,
  'punctuation': /\{|\}/
};
