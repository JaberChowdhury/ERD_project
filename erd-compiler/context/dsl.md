# Domain Specific Language (DSL)

This project uses a custom, lightweight DSL for generating ERD diagrams. The parser is located in `src/lib/parser.ts`.

## Syntax Rules

### Tables
Tables are defined using the following syntax:
```
tableName [icon: icon-name, color: #hex] {
  fieldName type [pk]
  fieldName type
}
```

- **`icon`**: Must match a valid `lucide-react` icon name (e.g., `shopping-cart`, `user`, `database`).
- **`color`**: A standard hex color code (e.g., `#ef4444`, `#3b82f6`). This color is applied to the table's border, icon, and badges.
- **`pk`**: A keyword denoting a Primary Key.

### Relationships
Relationships connect two fields in two different tables using specific arrow types:

- `table1.field1 <> table2.field2` (Many-to-Many)
- `table1.field1 > table2.field2` (One-to-Many)
- `table1.field1 < table2.field2` (Many-to-One)
- `table1.field1 - table2.field2` (One-to-One)

## The Parser
The parser uses standard Regex (`tableRegex` and `relRegex`) to extract strings. It inherently supports extracting comma-separated `metaStr` blocks (like `[icon: user, color: #123456]`). 

It returns `{ tables: TableData[], relationships: RelationshipData[] }`.
