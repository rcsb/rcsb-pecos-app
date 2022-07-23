### Code Generation

TypeScript type definitions in this module are automatically generated from existing schemas.

**Create TypeScript types from Data API GraphQL Schema**

GraphQL Code Generator relies on a configuration file named `codegen.yml`. The root level config `schema` field specifies a URL to the GraphQL endpoint to load the GraphQLSchema from. Run the following command to generate the TypeScript type definitions:

    node node_modules/.bin/graphql-code-generator -c ./src/auto/data/codegen.yml

The `package.json` also has the following script:
```
"scripts": {
    "codegen-gql": "graphql-codegen --config src/auto/data/codegen.yml"
}
```

**Create TypeScript types from Suggest API JSON Schema**

Run the following commands to generate the TypeScript type definitions:

    node scripts/generator --schema ../rcsb-arches/src/main/resources/schema/suggest/request/json-schema-rcsb_search_suggest.json --out src/auto/search/suggest-request.d.ts

    node scripts/generator --schema ../rcsb-arches/src/main/resources/schema/suggest/response/json-schema-rcsb_suggest_results.json --out src/auto/search/suggest-response.d.ts

**Create TypeScript types from Alignment API JSON Schema**

Run the following commands to generate the TypeScript type definitions:

    node scripts/generator --schema ../rcsb-pecos/src/main/resources/schema/request/json-schema-struct-alignment-query.json --out src/auto/alignment/alignment-request.d.ts

    node scripts/generator --schema ../rcsb-pecos/src/main/resources/schema/response/json-schema-structure-response.json --out src/auto/alignment/alignment-response.d.ts