[![License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](./LICENSE)

# RCSB 3D Structure Alignment Application

## Development

### Editor

To get syntax highlighting for graphql files, add the following to Visual Code's settings

    "files.associations": {
        "*.gql.ts": "graphql"
    }

### Building & Running

#### Build:

    npm install
    npm run build

#### Build automatically on file save:

    npm run watch-app

### Testing
- `npm install`
- `npm run dev-server`
- Go to `http://localhost:9000/`

## Publish

### Prerelease
    npm version prerelease # assumes the current version ends with '-dev.X'
    npm publish --tag next

### Release
    npm version 0.X.0 # provide valid semver string
    npm publish

### Code generation

Find detailed instructions in:
    ./src/auto/README.md