export function convertSqlToDsl(sql: string): string {
  let dsl = '';
  const relationships: string[] = [];
  
  // Remove comments
  const cleanSql = sql.replace(/--.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
  
  // Process ALTER TABLE first
  const alterTableRegex = /ALTER\s+TABLE\s+(?:ONLY\s+)?(?:[a-zA-Z0-9_]+\.)?([a-zA-Z0-9_]+)\s+ADD\s+(?:CONSTRAINT\s+[a-zA-Z0-9_]+\s+)?FOREIGN\s+KEY\s*\(\s*([a-zA-Z0-9_]+)\s*\)\s*REFERENCES\s+(?:[a-zA-Z0-9_]+\.)?([a-zA-Z0-9_]+)\s*\(\s*([a-zA-Z0-9_]+)\s*\)/gi;
  let alterMatch;
  while ((alterMatch = alterTableRegex.exec(cleanSql)) !== null) {
     relationships.push(`${alterMatch[1]}.${alterMatch[2]} > ${alterMatch[3]}.${alterMatch[4]}`);
  }

  // Split by CREATE TABLE
  const chunks = cleanSql.split(/CREATE\s+TABLE\s+/i);

  for (let i = 1; i < chunks.length; i++) {
    const chunk = chunks[i];
    
    // Match table name, ignoring optional IF NOT EXISTS and schema
    const nameMatch = chunk.match(/^(?:IF\s+NOT\s+EXISTS\s+)?(?:[a-zA-Z0-9_]+\.)?([a-zA-Z0-9_]+)\s*\(/i);
    if (!nameMatch) continue;
    
    const tableName = nameMatch[1];
    
    // The columns string is everything after the `(`
    const startIndex = nameMatch[0].length;
    let columnsStr = chunk.substring(startIndex);
    
    const alterIndex = columnsStr.search(/ALTER\s+TABLE/i);
    if (alterIndex !== -1) {
      columnsStr = columnsStr.substring(0, alterIndex);
    }
    
    const lastParen = columnsStr.lastIndexOf(')');
    if (lastParen !== -1) {
      columnsStr = columnsStr.substring(0, lastParen);
    }
    
    dsl += `${tableName} {\n`;
    
    const definitions = columnsStr.split(/,(?![^\(]*\))/g).map(s => s.trim()).filter(Boolean);
    let tablePks: string[] = [];
    
    definitions.forEach(def => {
      // Constraints
      const pkMatch = def.match(/PRIMARY\s+KEY\s*\(\s*([a-zA-Z0-9_]+)\s*\)/i);
      if (pkMatch) { tablePks.push(pkMatch[1]); return; }
      
      const fkMatch = def.match(/FOREIGN\s+KEY\s*\(\s*([a-zA-Z0-9_]+)\s*\)\s*REFERENCES\s+(?:[a-zA-Z0-9_]+\.)?([a-zA-Z0-9_]+)\s*\(\s*([a-zA-Z0-9_]+)\s*\)/i);
      if (fkMatch) { relationships.push(`${tableName}.${fkMatch[1]} > ${fkMatch[2]}.${fkMatch[3]}`); return; }
      
      if (def.toUpperCase().startsWith('CONSTRAINT')) {
         const namedPk = def.match(/CONSTRAINT\s+[a-zA-Z0-9_]+\s+PRIMARY\s+KEY\s*\(\s*([a-zA-Z0-9_]+)\s*\)/i);
         if (namedPk) { tablePks.push(namedPk[1]); return; }
         
         const namedFk = def.match(/CONSTRAINT\s+[a-zA-Z0-9_]+\s+FOREIGN\s+KEY\s*\(\s*([a-zA-Z0-9_]+)\s*\)\s*REFERENCES\s+(?:[a-zA-Z0-9_]+\.)?([a-zA-Z0-9_]+)\s*\(\s*([a-zA-Z0-9_]+)\s*\)/i);
         if (namedFk) { relationships.push(`${tableName}.${namedFk[1]} > ${namedFk[2]}.${namedFk[3]}`); return; }
         return; 
      }
      
      const colParts = def.split(/\s+/);
      if (colParts.length >= 2) {
        const colName = colParts[0];
        let colType = colParts[1].toLowerCase();
        colType = colType.replace(/\(.*/, ''); // remove length/precision
        
        const isInlinePk = /PRIMARY\s+KEY/i.test(def);
        if (isInlinePk && !tablePks.includes(colName)) tablePks.push(colName);
        
        const inlineFk = def.match(/REFERENCES\s+(?:[a-zA-Z0-9_]+\.)?([a-zA-Z0-9_]+)\s*\(\s*([a-zA-Z0-9_]+)\s*\)/i);
        if (inlineFk) relationships.push(`${tableName}.${colName} > ${inlineFk[1]}.${inlineFk[2]}`);
        
        dsl += `  ${colName} ${colType} __PK_PLACEHOLDER_${colName}__\n`;
      } else if (colParts.length === 1 && colParts[0]) {
         dsl += `  ${colParts[0]} string __PK_PLACEHOLDER_${colParts[0]}__\n`;
      }
    });
    
    // Replace placeholders for primary keys
    tablePks.forEach(pk => {
       const pkRegex = new RegExp(`__PK_PLACEHOLDER_${pk}__`, 'g');
       dsl = dsl.replace(pkRegex, 'pk');
    });
    // Remove unused placeholders
    dsl = dsl.replace(/__PK_PLACEHOLDER_[a-zA-Z0-9_]+__/g, '').replace(/ \n/g, '\n');
    
    dsl += `}\n\n`;
  }
  
  if (relationships.length > 0) {
    dsl += relationships.join('\n') + '\n';
  }

  if (!dsl.trim()) {
    throw new Error("No tables found. Please check your SQL syntax.");
  }

  return dsl.trim();
}
