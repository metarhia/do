'use strict';

const dox = require('dox');
const fs = require('fs');

const code = fs.readFileSync(__dirname + '/../index.js').toString('utf8');
const ast = dox.parseComments(code, { raw: true });

let apiDoc = dox.api(ast);

// Don't like the new format Do.method
apiDoc = apiDoc
    .replace(/Do\./g, 'Do#')
    .replace('##', '###')
    .trim();

const tpl = fs.readFileSync(__dirname + '/readme.tpl', 'utf8');
const readme = tpl.replace('{api}', apiDoc);
fs.writeFileSync(__dirname + '/../readme.md', readme);

console.log('Written readme.md');
