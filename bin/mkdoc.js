var dox = require('dox'),
    fs = require('fs'),
    code = fs.readFileSync(__dirname + '/../index.js').toString('utf8'),
    ast = dox.parseComments(code, {raw: true}),
    apiDoc = dox.api(ast),
    tpl, readme;

// Don't like the new format Do.method
apiDoc = apiDoc
    .replace(/Do\./g, 'Do#')
    .replace('##', '###')
    .trim();
tpl = fs.readFileSync(__dirname + '/readme.tpl', 'utf8');
readme = tpl.replace('{api}', apiDoc);
fs.writeFileSync(__dirname + '/../readme.md', readme);

console.log('Written readme.md');
