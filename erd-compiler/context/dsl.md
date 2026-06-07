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
- **`color`**: A standard hex color code (e.g., `#ef4444`, `#3b82f6`), or a named color from our map (e.g., `blue`, `cyan`, `orange`, `green`, `red`, `yellow`, `purple`, `pink`, `gray`). This color is applied to the table's border, icon, and background headers.
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

## Canvas Settings & URL Serialization

The application supports real-time customization of the canvas layout and table styles.

### Available Settings
- **`nodesep` (Gap X)**: Horizontal distance between tables.
- **`ranksep` (Gap Y)**: Vertical distance between tables.
- **`pathType`**: Routing algorithm for relationship edges (`bezier`, `step`, `straight`).
- **`pathAnimation`**: Boolean toggling the SVG marching ants animation on edges.
- **`borderRadius`**: CSS value determining table corner rounding (e.g., `0px`, `16px`, `2rem`).
- **`fontFamily`**: Selected Google Font or system font stack for all text within the diagram.
- **`fontSize`**: Base font size for table fields. The canvas layout automatically recalculates bounding boxes to accommodate text size changes.
- **`iconSize`**: Size of the Lucide icons rendered in the table headers.

### URL Serialization
To ensure diagrams can be shared along with their visual configuration, both the DSL code and the active canvas settings are compressed into the URL hash using `lz-string`.

- **Format**: `#data=[LZString-compressed JSON payload]`
- **Payload Schema**:
  ```json
  {
    "code": "users { id pk }",
    "settings": {
      "nodesep": 60,
      "ranksep": 250,
      "pathType": "bezier",
      "fontFamily": "Inter, sans-serif"
      // ...other settings
    }
  }
  ```
- **Legacy Fallback**: The app continues to support the old `#code=...` format (which only contained the compressed DSL code string) for backward compatibility with older shared links.
