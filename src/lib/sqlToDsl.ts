import { Parser } from 'node-sql-parser';

function extractColumnName(colObj: any): string {
  if (typeof colObj === 'string') return colObj;
  if (!colObj) return '';
  if (colObj.expr && colObj.expr.value) {
    return extractColumnName(colObj.expr.value);
  }
  if (colObj.value) {
    return extractColumnName(colObj.value);
  }
  if (colObj.column) {
    return extractColumnName(colObj.column);
  }
  return String(colObj);
}

export function convertSqlToDsl(sql: string): string {
  const parser = new Parser();
  let astList: any[] = [];
  try {
    let ast;
    try {
      ast = parser.astify(sql, { database: 'Postgresql' });
    } catch (e) {
      try {
        ast = parser.astify(sql, { database: 'MySQL' });
      } catch (e2) {
        ast = parser.astify(sql);
      }
    }
    astList = Array.isArray(ast) ? ast : [ast];
  } catch (err) {
    console.error("SQL Parse error:", err);
    throw new Error("Failed to parse SQL. Please check your syntax.");
  }

  let dsl = '';
  const relationships: string[] = [];

  // Parse tables
  astList.forEach((node) => {
    if (node.type === 'create' && node.keyword === 'table') {
      const tableName = node.table[0].table;
      dsl += `${tableName} {\n`;
      
      const columns = node.create_definitions?.filter((d: any) => d.resource === 'column') || [];
      const constraints = node.create_definitions?.filter((d: any) => d.resource === 'constraint') || [];

      columns.forEach((col: any) => {
        const colName = extractColumnName(col.column?.column);
        const dataType = (col.definition.dataType || 'string').toLowerCase();
        const isPk = col.primary_key ? ' pk' : '';
        dsl += `  ${colName} ${dataType}${isPk}\n`;
      });
      
      dsl += `}\n\n`;

      // Inline foreign keys in CREATE TABLE
      constraints.forEach((cons: any) => {
        if (cons.constraint_type === 'FOREIGN KEY' || cons.constraint_type === 'FOREIGN key') {
          const sourceCols = cons.definition.map((d: any) => extractColumnName(d.column));
          const targetTable = cons.reference_definition.table[0].table;
          const targetCols = cons.reference_definition.definition.map((d: any) => extractColumnName(d.column));
          
          if (sourceCols.length && targetCols.length) {
            relationships.push(`${tableName}.${sourceCols[0]} - ${targetTable}.${targetCols[0]}`);
          }
        }
      });
    }

    // ALTER TABLE ADD CONSTRAINT FOREIGN KEY
    if (node.type === 'alter' && node.table) {
      const tableName = node.table[0].table;
      node.expr?.forEach((expr: any) => {
        if (expr.action === 'add' && expr.create_definitions?.constraint_type === 'FOREIGN KEY') {
          const cons = expr.create_definitions;
          const sourceCols = cons.definition.map((d: any) => extractColumnName(d.column));
          const targetTable = cons.reference_definition.table[0].table;
          const targetCols = cons.reference_definition.definition.map((d: any) => extractColumnName(d.column));
          if (sourceCols.length && targetCols.length) {
            relationships.push(`${tableName}.${sourceCols[0]} - ${targetTable}.${targetCols[0]}`);
          }
        }
      });
    }
  });

  if (relationships.length > 0) {
    dsl += relationships.join('\n') + '\n';
  }

  return dsl.trim();
}
