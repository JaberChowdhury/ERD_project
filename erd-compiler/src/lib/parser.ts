export interface FieldData {
  name: string;
  type: string;
  isPk: boolean;
}

export interface TableData {
  name: string;
  meta: Record<string, string>;
  fields: FieldData[];
}

export interface RelationshipData {
  sourceTable: string;
  sourceField: string;
  type: string;
  targetTable: string;
  targetField: string;
}

export function parseCode(code: string): { tables: TableData[], relationships: RelationshipData[] } {
  const tables: TableData[] = [];
  const relationships: RelationshipData[] = [];

  const tableRegex = /([a-zA-Z0-9_]+)\s*(?:\[(.*?)\])?\s*\{([\s\S]*?)\}/g;
  let match;
  while ((match = tableRegex.exec(code)) !== null) {
    const name = match[1];
    const metaStr = match[2] || '';
    const fieldsStr = match[3];

    const meta: Record<string, string> = {};
    metaStr.split(',').forEach(part => {
      const kv = part.split(':');
      if (kv.length === 2) meta[kv[0].trim()] = kv[1].trim();
    });

    const fields: FieldData[] = [];
    fieldsStr.split('\n').forEach(line => {
      line = line.trim();
      if (!line) return;

      const parts = line.split(/\s+/);
      const fieldName = parts[0];
      const fieldType = parts[1] || '';
      const isPk = parts.some(p => p.toLowerCase() === 'pk');
      fields.push({ name: fieldName, type: fieldType, isPk });
    });
    tables.push({ name, meta, fields });
  }

  const relRegex = /([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)\s*(<>|-|<|>)\s*([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)/g;
  while ((match = relRegex.exec(code)) !== null) {
    relationships.push({
      sourceTable: match[1],
      sourceField: match[2],
      type: match[3],
      targetTable: match[4],
      targetField: match[5]
    });
  }

  return { tables, relationships };
}
