'use strict';

const chain = require('..');
const metatests = require('metatests');

const wrapAsync = (
  // Emulate Asynchronous calls
  callback // function
) => {
  setTimeout(callback, Math.floor(Math.random() * 1000));
};

metatests.test('first occured error should break chain & call done', (test) => {
  const readConfig = (name, callback) => {
    wrapAsync(() => {
      callback(new Error('something went wrong'));
    });
  };

  const selectFromDb = (query, { name }, callback) => {
    test.strictSame(name, 'myConfig');
    wrapAsync(() => {
      callback(null, query);
    });
  };

  const c1 = chain
    .do(readConfig, 'myConfig')
    .do(selectFromDb, 'select * from cities');

  c1((err, data) => {
    test.strictSame(err.message, 'something went wrong');
    test.strictSame(data, undefined);
    test.end();
  });
});

metatests.test('last call terminate chain', (test) => {
  const readConfig = (name, callback) => {
    test.strictSame(name, 'myConfig');
    wrapAsync(() => {
      callback(null, { name });
    });
  };
  const c1 = chain.do(readConfig, 'myConfig');
  const actual = c1(() => {
    test.strictSame(actual, undefined);
    test.end();
  });
});

metatests.test('simple chain/do', (test) => {
  const readConfig = (name, callback) => {
    test.strictSame(name, 'myConfig');
    wrapAsync(() => {
      callback(null);
    });
  };

  const selectFromDb = (query, callback) => {
    test.strictSame(query, 'select * from cities');
    wrapAsync(() => {
      callback(null, { protocol: 'http' });
    });
  };

  const getHttpPage = (host, { protocol }, callback) => {
    test.strictSame(`${protocol}://${host}`, 'http://kpi.ua');
    wrapAsync(() => {
      callback(null, '<html>Some archaic web here</html>');
    });
  };

  const writeToFile = (path, content, callback) => {
    test.strictSame(path, 'README.md');
    wrapAsync(() => {
      callback(null, { bytesWritten: content.length });
    });
  };

  const c1 = chain
    .do(readConfig, 'myConfig')
    .do(selectFromDb, 'select * from cities')
    .do(getHttpPage, 'kpi.ua')
    .do(writeToFile, 'README.md');

  c1((err, { bytesWritten }) => {
    test.strictSame(err, null);
    test.strictSame(bytesWritten, 34);
    test.end();
  });
});
