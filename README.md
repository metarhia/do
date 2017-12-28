## "do" is the simplest way to manage asynchronicity

[![TravisCI](https://travis-ci.org/metarhia/do.svg?branch=master)](https://travis-ci.org/metarhia/do)
[![bitHound](https://www.bithound.io/github/metarhia/do/badges/score.svg)](https://www.bithound.io/github/metarhia/do)
[![NPM Version](https://badge.fury.io/js/do.svg)](https://badge.fury.io/js/do)
[![NPM Downloads/Month](https://img.shields.io/npm/dm/do.svg)](https://www.npmjs.com/package/do)
[![NPM Downloads](https://img.shields.io/npm/dt/do.svg)](https://www.npmjs.com/package/do)

If you don't want to use all the async/chain libraries but just want a reliable way to know when the function is done - this is for you.

## Installation
`npm i do`

## Usage

Series async execution
```js
const chain = require('do');

const c1 = chain
  .do(readConfig, 'myConfig')
  .do(selectFromDb, 'select * from cities')
  .do(getHttpPage, 'http://kpi.ua')
  .do(readFile, 'README.md');

c1((err, result) => {
  console.log('done');
  if (err) console.log(err);
  else console.dir({ result });
});
```

Data collector
```js
const chain = require('do');
const fs = require('fs');

const dc = chain.do(4);

dc('user', null, { name: 'Marcus Aurelius' });

fs.readFile('HISTORY.md',
  (err, data) => dc.collect('history', err, data)
);

dc.take('readme', fs.readFile, 'README.md');

setTimeout(() => dc.pick('timer', { date: new Date() }), 1000);
```

## Run tests

`npm test`

## Licence

MIT
