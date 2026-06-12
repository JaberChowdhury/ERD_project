import { encodeSchema, decodeSchema } from './schemaEncoder';
import type { Schema } from './parser';

const testSchema: Schema = {
  tables: [
    {
      name: 'users',
      meta: { icon: 'user', color: 'blue' },
      fields: [
        { name: 'id', type: 'string', isPk: true },
        { name: 'fullName', type: 'string', isPk: false },
        { name: 'email', type: 'string', isPk: false },
        { name: 'createdAt', type: 'timestamp', isPk: false },
      ]
    },
    {
      name: 'roles',
      meta: { icon: 'shield', color: 'purple' },
      fields: [
        { name: 'id', type: 'string', isPk: true },
        { name: 'name', type: 'string', isPk: false }
      ]
    },
    {
      name: 'user_roles',
      meta: { icon: 'users', color: 'purple' },
      fields: [
        { name: 'userId', type: 'string', isPk: false },
        { name: 'roleId', type: 'string', isPk: false }
      ]
    }
  ],
  relationships: [
    {
      sourceTable: 'users',
      sourceField: 'id',
      type: '<>',
      targetTable: 'user_roles',
      targetField: 'userId'
    },
    {
      sourceTable: 'roles',
      sourceField: 'id',
      type: '<>',
      targetTable: 'user_roles',
      targetField: 'roleId'
    }
  ]
};

function runTest() {
  console.log("Encoding Schema...");
  const encoded = encodeSchema(testSchema, true);
  console.log("\nEncoded Base64URL string:\n" + encoded);
  console.log("\nDecoding Schema...");
  const decoded = decodeSchema(encoded);

  // We need to compare ignoring order of things if canonicalization sorts them.
  // We can just encode both to canonical JSON and compare.
  
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

  const origJson = JSON.stringify(canonicalizeSchema(testSchema));
  const decodedJson = JSON.stringify(canonicalizeSchema(decoded));

  if (origJson === decodedJson) {
    console.log("\nSUCCESS! Decoder perfectly reproduced original canonical schema.");
  } else {
    console.error("\nFAILURE! Decoder output differs.");
    console.log("Expected:", origJson);
    console.log("Got:", decodedJson);
    throw new Error("Decoder output differs.");
  }
}

runTest();
