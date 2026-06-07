export function formatDSL(code: string): string {
  const lines = code.split('\n');
  const formatted: string[] = [];
  let indentLevel = 0;
  let previousBlank = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i].trim();
    
    // Normalize spacing inside table definition (e.g. users [icon: user, color: blue] {)
    if (line.endsWith('{')) {
      line = line.replace(/\s*\{\s*$/, ' {');
    }

    if (!line) {
      if (!previousBlank && formatted.length > 0) {
        formatted.push('');
        previousBlank = true;
      }
      continue;
    }
    
    previousBlank = false;

    if (line.startsWith('}')) {
      indentLevel = Math.max(0, indentLevel - 1);
    }

    const indent = '  '.repeat(indentLevel);
    const endsWithBrace = line.endsWith('{');
    
    // Format relationships spaces around operators (<>, >, <, -)
    if (indentLevel === 0 && !endsWithBrace && !line.startsWith('}')) {
      line = line.replace(/\s*(<>|>|<|-)\s*/g, ' $1 ');
    }

    formatted.push(indent + line);

    if (endsWithBrace) {
      indentLevel++;
    }
  }

  return formatted.join('\n').trim() + '\n';
}
