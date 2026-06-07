import { useAppStore } from '../store/useAppStore';
import Editor from '@monaco-editor/react';
import { TEMPLATES } from '../lib/templates';
import { formatDSL } from '../lib/formatter';
import { Wand2 } from 'lucide-react';

export const Sidebar = () => {
  const code = useAppStore(state => state.code);
  const setCode = useAppStore(state => state.setCode);

  const handleEditorWillMount = (monaco: any) => {
    monaco.languages.register({ id: 'erd-dsl' });
    monaco.languages.setMonarchTokensProvider('erd-dsl', {
      tokenizer: {
        root: [
          [/\[icon:[^\]]*\]/, 'custom-icon'],
          [/\[color:[^\]]*\]/, 'custom-color'],
          [/\b(?:pk|string|text|integer|decimal|boolean|date|timestamp)\b/, 'keyword'],
          [/[a-zA-Z_]\w*/, 'identifier'],
          [/<|>|-/, 'operator']
        ]
      }
    });

    // Define custom theme
    monaco.editor.defineTheme('erd-theme', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'custom-icon', foreground: '10b981' },
        { token: 'custom-color', foreground: '3b82f6' },
        { token: 'keyword', foreground: 'f59e0b', fontStyle: 'bold' },
        { token: 'identifier', foreground: 'e2e8f0' },
        { token: 'operator', foreground: 'ef4444' }
      ],
      colors: {
        'editor.background': '#1e1e1e'
      }
    });

    monaco.languages.registerCompletionItemProvider('erd-dsl', {
      provideCompletionItems: (model: any, position: any) => {
        const textUntilPosition = model.getValueInRange({
          startLineNumber: position.lineNumber,
          startColumn: 1,
          endLineNumber: position.lineNumber,
          endColumn: position.column
        });
        const word = model.getWordUntilPosition(position);
        const range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn
        };

        const suggestions: any[] = [];
        
        if (textUntilPosition.match(/\[icon:\s*[\w-]*$/)) {
          const iconsList = ['user', 'users', 'file-text', 'package', 'building', 'shopping-cart', 'mail', 'heart', 'star', 'truck', 'database', 'globe', 'shield', 'search', 'briefcase', 'list', 'message-circle'];
          iconsList.forEach(icon => {
            suggestions.push({
              label: icon,
              kind: monaco.languages.CompletionItemKind.EnumMember,
              insertText: icon,
              range
            });
          });
        }
        
        if (textUntilPosition.match(/\[color:\s*[#\w]*$/)) {
          const colorsList = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', 'blue', 'red', 'green'];
          colorsList.forEach(color => {
            suggestions.push({
              label: color,
              kind: monaco.languages.CompletionItemKind.Color,
              insertText: color,
              range
            });
          });
        }

        ['string', 'text', 'integer', 'decimal', 'boolean', 'date', 'timestamp', 'pk'].forEach(kw => {
          suggestions.push({
            label: kw,
            kind: monaco.languages.CompletionItemKind.Keyword,
            insertText: kw,
            range
          });
        });

        return { suggestions };
      }
    });
  };

  return (
    <div className="w-[340px] h-full border-r border-slate-800 bg-[#1e1e1e] flex flex-col shrink-0 z-40 shadow-xl">
      <div className="h-14 border-b border-white/5 flex items-center justify-between px-4 shrink-0 bg-black/20">
        <span className="text-slate-400 text-xs font-semibold tracking-wider">LIVE EDITOR</span>
        <button 
          onClick={() => setCode(formatDSL(code))}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-white/5 hover:bg-white/10 px-2 py-1 rounded-md transition-colors"
          title="Format Code"
        >
          <Wand2 className="w-3.5 h-3.5" />
          Format
        </button>
      </div>
      
      <div className="px-4 py-3 flex-1 flex flex-col min-h-0 gap-3">
        <select 
          className="w-full bg-slate-800/50 border border-slate-700/50 text-slate-300 text-xs rounded-full px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary appearance-none hover:bg-slate-800 transition-colors cursor-pointer"
          defaultValue=""
          onChange={(e) => {
            const val = parseInt(e.target.value);
            if (!isNaN(val) && TEMPLATES[val]) setCode(TEMPLATES[val].code);
            e.target.value = '';
          }}
        >
          <option value="" disabled>Load Complex Example...</option>
          {TEMPLATES.map((t, i) => (
            <option key={i} value={i}>{t.title}</option>
          ))}
        </select>
        
        <div className="flex-1 rounded-xl overflow-hidden relative border border-slate-800">
          <Editor
            height="100%"
            language="erd-dsl"
            theme="erd-theme"
            value={code}
            onChange={(val) => setCode(val || '')}
            beforeMount={handleEditorWillMount}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: '"JetBrains Mono", "Fira Code", monospace',
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              padding: { top: 16 }
            }}
          />
        </div>
      </div>
    </div>
  );
};
