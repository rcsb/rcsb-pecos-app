### Code Generation

TypeScript type definitions in this module are automatically generated from existing schemas.

**Create TypeScript types from GraphQL Schema**

Uses [GraphQL Code Generator](https://www.npmjs.com/package/@graphql-codegen/cli) tool to generate TypeScript type definitions from GraphQL Schema. GraphQL Code Generator relies on a configuration file named `codegen.yml`. The root level config `schema` field specifies a URL to the GraphQL endpoint to load the GraphQL Schema from. 

#### Types for Data API

Run the following command to generate the TypeScript type definitions for Data API GraphQL Schema:

    node node_modules/.bin/graphql-code-generator -c ./src/auto/data/codegen.yml

The `package.json` also has the following script:
```
"scripts": {
    "codegen-gql": "graphql-codegen --config src/auto/data/codegen.yml"
}
```

**Create TypeScript types from JSON Schema**

Uses [json-schema-to-typescript](https://www.npmjs.com/package/json-schema-to-typescript) tool to generate TypeScript type definitions from JSON Schema files. A CLI utility is provided in: `scripts/generator.js`

#### Types for Suggest API

Run the following commands to generate the TypeScript type definitions for Suggest API JSON Schemas:

    node scripts/generator --schema ../rcsb-arches/src/main/resources/schema/suggest/request/json-schema-rcsb_search_suggest.json --out src/auto/search/suggest-request.d.ts

    node scripts/generator --schema ../rcsb-arches/src/main/resources/schema/suggest/response/json-schema-rcsb_suggest_results.json --out src/auto/search/suggest-response.d.ts

#### Types for Alignment API

Run the following commands to generate the TypeScript type definitions for Alignment API JSON Schemas:

    node scripts/generator --schema ../rcsb-pecos/src/main/resources/schema/request/json-schema-struct-alignment-query.json --out src/auto/alignment/alignment-request.d.ts

    node scripts/generator --schema ../rcsb-pecos/src/main/resources/schema/response/json-schema-structure-response.json --out src/auto/alignment/alignment-response.d.ts