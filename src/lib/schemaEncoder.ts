import * as fflate from 'fflate';
import type { Schema, TableData, RelationshipData, FieldData } from './parser';

const STATIC_DICT = [
  "string", "number", "boolean", "timestamp", "date", "text", "uuid", "integer", "jsonb",
  "users", "roles", "user_roles", "posts", "comments", "notifications", "profiles", "sessions", "settings",
  "id", "name", "email", "password", "created_at", "updated_at", "createdAt", "updatedAt",
  "user_id", "userId", "role_id", "roleId", "post_id", "postId", "status", "type", "title", "description",
  "is_active", "isActive", "is_verified", "isVerified", "token", "url", "image", "avatar",
  "<>", "-", "<", ">",
  "icon", "color", "user", "shield", "users", "search", "building", "blue", "purple", "green", "orange", "red", "yellow"
];

const STATIC_DICT_MAP = new Map<string, number>(STATIC_DICT.map((s, i) => [s, i]));

// Varint Encoding (LEB128)
function encodeVarint(value: number, output: number[]) {
  while (value >= 0x80) {
    output.push((value & 0x7f) | 0x80);
    value >>>= 7;
  }
  output.push(value & 0x7f);
}

function decodeVarint(input: Uint8Array, offset: { val: number }): number {
  let result = 0;
  let shift = 0;
  while (true) {
    const byte = input[offset.val++];
    result |= (byte & 0x7f) << shift;
    if ((byte & 0x80) === 0) break;
    shift += 7;
  }
  return result;
}

// Stage 1: Canonicalization
function canonicalizeSchema(schema: Schema): Schema {
  const tables = [...schema.tables].sort((a, b) => a.name.localeCompare(b.name)).map(t => ({
    ...t,
    fields: [...t.fields].sort((a, b) => a.name.localeCompare(b.name))
  }));

  const relationships = [...schema.relationships].sort((a, b) => {
    if (a.sourceTable !== b.sourceTable) return a.sourceTable.localeCompare(b.sourceTable);
    if (a.sourceField !== b.sourceField) return a.sourceField.localeCompare(b.sourceField);
    if (a.targetTable !== b.targetTable) return a.targetTable.localeCompare(b.targetTable);
    if (a.targetField !== b.targetField) return a.targetField.localeCompare(b.targetField);
    return a.type.localeCompare(b.type);
  });

  return { tables, relationships };
}

// Stage 7: URL Encoding (Base91-ish URL Safe)
// We use a custom base64url that is highly efficient
function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  // Use chunking to prevent stack overflow on large arrays
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk as unknown as number[]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBytes(base64url: string): Uint8Array {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function encodeSchema(schema: Schema, benchmark: boolean = false): string {
  const originalJson = JSON.stringify(schema);
  const canonSchema = canonicalizeSchema(schema);
  
  // Stage 2 & 5: Build Dictionary & Frequency Map
  const freqMap = new Map<string, number>();
  const addString = (s: string) => {
    if (!STATIC_DICT_MAP.has(s)) {
      freqMap.set(s, (freqMap.get(s) || 0) + 1);
    }
  };

  canonSchema.tables.forEach(t => {
    addString(t.name);
    Object.entries(t.meta).forEach(([k, v]) => {
      addString(k);
      addString(v);
    });
    t.fields.forEach(f => {
      addString(f.name);
      addString(f.type);
    });
  });

  canonSchema.relationships.forEach(r => {
    addString(r.sourceTable);
    addString(r.sourceField);
    addString(r.type);
    addString(r.targetTable);
    addString(r.targetField);
  });

  // Sort dynamic dict by frequency descending
  const dynamicDict = Array.from(freqMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(e => e[0]);

  const dictMap = new Map<string, number>();
  STATIC_DICT.forEach((s, i) => dictMap.set(s, i));
  dynamicDict.forEach((s, i) => dictMap.set(s, STATIC_DICT.length + i));

  const getId = (s: string) => dictMap.get(s)!;

  // Stage 4: Binary Serialization
  const out: number[] = [];

  // Write dynamic dictionary
  encodeVarint(dynamicDict.length, out);
  const encoder = new TextEncoder();
  dynamicDict.forEach(s => {
    const bytes = encoder.encode(s);
    encodeVarint(bytes.length, out);
    for (let i = 0; i < bytes.length; i++) out.push(bytes[i]);
  });

  // Write Tables
  encodeVarint(canonSchema.tables.length, out);
  canonSchema.tables.forEach(t => {
    encodeVarint(getId(t.name), out);
    
    const metaEntries = Object.entries(t.meta);
    encodeVarint(metaEntries.length, out);
    metaEntries.forEach(([k, v]) => {
      encodeVarint(getId(k), out);
      encodeVarint(getId(v), out);
    });

    encodeVarint(t.fields.length, out);
    t.fields.forEach(f => {
      encodeVarint(getId(f.name), out);
      encodeVarint(getId(f.type), out);
      out.push(f.isPk ? 1 : 0);
    });
  });

  // Write Relationships
  encodeVarint(canonSchema.relationships.length, out);
  canonSchema.relationships.forEach(r => {
    encodeVarint(getId(r.sourceTable), out);
    encodeVarint(getId(r.sourceField), out);
    encodeVarint(getId(r.type), out);
    encodeVarint(getId(r.targetTable), out);
    encodeVarint(getId(r.targetField), out);
  });

  const binArray = new Uint8Array(out);
  
  // Stage 6: Compression
  const compressed = fflate.compressSync(binArray, { level: 9 });
  
  // Stage 7: URL Encoding
  const finalUrl = bytesToBase64Url(compressed);

  if (benchmark) {
    const defaultJsonStr = JSON.stringify(canonSchema);
    const naiveBase64 = bytesToBase64Url(fflate.compressSync(encoder.encode(defaultJsonStr), { level: 9 }));
    console.log(`=== Extreme Encoding Benchmark ===`);
    console.log(`Original Schema (JSON): ${encoder.encode(originalJson).length} bytes`);
    console.log(`Canonical JSON: ${encoder.encode(defaultJsonStr).length} bytes`);
    console.log(`Binary Serialized: ${binArray.length} bytes`);
    console.log(`Compressed Binary: ${compressed.length} bytes`);
    console.log(`Final URL Base64: ${finalUrl.length} characters`);
    console.log(`Naive JSON+fflate+Base64: ${naiveBase64.length} characters`);
    console.log(`Ratio (Final vs Original JSON): ${((finalUrl.length / originalJson.length) * 100).toFixed(2)}%`);
    console.log(`Improvement over Naive: ${((1 - finalUrl.length / naiveBase64.length) * 100).toFixed(2)}% smaller`);
  }

  return finalUrl;
}

export function decodeSchema(encoded: string): Schema {
  const compressed = base64UrlToBytes(encoded);
  const binArray = fflate.decompressSync(compressed);
  const offset = { val: 0 };

  const dynamicDictLength = decodeVarint(binArray, offset);
  const dynamicDict: string[] = [];
  const decoder = new TextDecoder();

  for (let i = 0; i < dynamicDictLength; i++) {
    const len = decodeVarint(binArray, offset);
    const bytes = binArray.subarray(offset.val, offset.val + len);
    dynamicDict.push(decoder.decode(bytes));
    offset.val += len;
  }

  const getString = (id: number) => {
    if (id < STATIC_DICT.length) return STATIC_DICT[id];
    return dynamicDict[id - STATIC_DICT.length];
  };

  const tablesCount = decodeVarint(binArray, offset);
  const tables: TableData[] = [];

  for (let i = 0; i < tablesCount; i++) {
    const name = getString(decodeVarint(binArray, offset));
    
    const metaCount = decodeVarint(binArray, offset);
    const meta: Record<string, string> = {};
    for (let j = 0; j < metaCount; j++) {
      const k = getString(decodeVarint(binArray, offset));
      const v = getString(decodeVarint(binArray, offset));
      meta[k] = v;
    }

    const fieldsCount = decodeVarint(binArray, offset);
    const fields: FieldData[] = [];
    for (let j = 0; j < fieldsCount; j++) {
      const fieldName = getString(decodeVarint(binArray, offset));
      const fieldType = getString(decodeVarint(binArray, offset));
      const isPk = binArray[offset.val++] === 1;
      fields.push({ name: fieldName, type: fieldType, isPk });
    }

    tables.push({ name, meta, fields });
  }

  const relsCount = decodeVarint(binArray, offset);
  const relationships: RelationshipData[] = [];

  for (let i = 0; i < relsCount; i++) {
    relationships.push({
      sourceTable: getString(decodeVarint(binArray, offset)),
      sourceField: getString(decodeVarint(binArray, offset)),
      type: getString(decodeVarint(binArray, offset)),
      targetTable: getString(decodeVarint(binArray, offset)),
      targetField: getString(decodeVarint(binArray, offset)),
    });
  }

  return { tables, relationships };
}

export function schemaToCode(schema: Schema): string {
  let code = "";
  
  schema.tables.forEach((t, i) => {
    if (i > 0) code += "\n\n";
    
    code += t.name;
    
    const metaEntries = Object.entries(t.meta);
    if (metaEntries.length > 0) {
      code += " [" + metaEntries.map(([k, v]) => `${k}: ${v}`).join(", ") + "]";
    }
    
    code += " {\n";
    t.fields.forEach(f => {
      code += `  ${f.name} ${f.type}${f.isPk ? ' pk' : ''}\n`;
    });
    code += "}";
  });

  if (schema.relationships.length > 0) {
    code += "\n\n";
    schema.relationships.forEach(r => {
      code += `${r.sourceTable}.${r.sourceField} ${r.type} ${r.targetTable}.${r.targetField}\n`;
    });
  }

  return code.trim();
}
