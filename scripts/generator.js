/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
/**
 * Compile json schema to typescript typings
 */
const fs = require('fs');
const path = require('path');
const argparse = require('argparse');
const json2ts = require('json-schema-to-typescript');

const parser = new argparse.ArgumentParser({
    add_help: true,
    description: 'Create TypeScript types from JSON Schema files'
});
parser.add_argument('--root', '-r', {
    help: 'Root directory for resolving $ref pointers',
    required: false
});
parser.add_argument('--schema', '-s', {
    help: 'Path to JSON Schema file to compile from',
    required: true
});
parser.add_argument('--out', '-o', {
    help: 'Generated schema types output path',
    required: true
});

const args = parser.parse_args();

function prepare(filename) {
    const parentDir = path.dirname(filename);
    if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, {
            recursive: true
        });
    }
}

function build() {
    const schemaRoot = args.root || path.dirname(args.schema);
    const compilerOpts = {
        'cwd': schemaRoot,
        'ignoreMinAndMaxItems': true,
        'style': {
            'singleQuote': true,
            'tabWidth': 4
        }
    };

    prepare(args.out);
    json2ts.compileFromFile(args.schema, compilerOpts).then(ts => fs.writeFileSync(args.out, ts));
}

build();