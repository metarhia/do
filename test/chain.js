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

metatests.test('should be able call done function multiple times', (test) => {
  const action1 = (callback) => {
    setTimeout(() => callback(null), 10);
  };
  const action2 = (callback) => {
    setTimeout(() => callback(null, true), 10);
  };

  const c1 = chain.do(action1).do(action2);

  c1((err, data) => {
    test.strictSame(err, null);
    test.strictSame(data, true);
  });

  c1((err, data) => {
    test.strictSame(err, null);
    test.strictSame(data, true);
    test.end();
  });
});

metatests.test('should be able branch out', (test) => {
  const readConnectionString = (configName, callback) => {
    test.strictSame(configName, 'myConfig');
    setTimeout(() => callback(null, 'connectionString'), 10);
  };

  const selectFromDb = (query, connectionString, callback) => {
    test.strictSame(connectionString, 'connectionString');
    test.strictSame(query, 'select * from cities');
    setTimeout(() => callback(null, ['A', 'B']), 10);
  };

  const fetchCityData = (cities, callback) => {
    test.strictSame(cities, ['A', 'B']);
    setTimeout(() => callback(null, [1, 2]), 200);
  };

  const writeToFile = (path, cities, callback) => {
    test.strictSame(path, 'cities.md');
    test.strictSame(cities, ['A', 'B']);
    setTimeout(() => callback(new Error('Something went wrong')), 50);
  };

  const common = chain
    .do(readConnectionString, 'myConfig')
    .do(selectFromDb, 'select * from cities');

  const c1 = common.do(fetchCityData);
  const c2 = common.do(writeToFile, 'cities.md');

  common((err, data) => {
    test.strictSame(err, null);
    test.strictSame(data, ['A', 'B']);
  });

  c1((err, data) => {
    test.strictSame(err, null);
    test.strictSame(data, [1, 2]);
    test.end();
  });

  c2((err, data) => {
    test.strictSame(data, undefined);
    test.strictSame(err.message, 'Something went wrong');
  });
});
