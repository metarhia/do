'use strict';

const tap = require('tap');
const Do = require('..');

tap.test('get amount', (test) => {
  test.equal(new Do(5).amount(), 5, 'get amount');
  test.end();
});

tap.test('set amount', (test) => {
  test.equal(new Do().amount(5).amount(), 5, 'set amount');
  test.end();
});

tap.test('inc amount', (test) => {
  test.equal(new Do(5).inc().amount(), 6, 'inc +1');
  test.equal(new Do(5).inc(3).amount(), 8, 'inc +3');
  test.end();
});

tap.test('dec amount', (test) => {
  test.equal(new Do(5).dec().amount(), 4, 'dec -1');
  test.equal(new Do(5).dec(3).amount(), 2, 'dec -3');
  test.end();
});

tap.test('do not throws if complete callback is defined', (test) => {
  const todo = new Do(1).complete(() => {}).done();
  test.equal(todo.errors.length, 0);
  test.end();
});

tap.test('throw if error is passed and error callback not defined.',
  (test) => {
    test.throws(() => new Do(1).done(), Error);
    test.end();
  });

tap.test('throw if no error is passed, but no success callback defined',
  (test) => {
    test.throws(() => new Do(1).done(new Error()), Error);
    test.end();
  });

tap.test('done called as many times as defined by', (test) => {
  new Do(1)
    .error(() => {})
    .success(() => {
      test.ok(true, 'success callback called');
      test.end();
    }).done();
});

tap.test('done called more times than defined', (test) => {
  new Do(1)
    .error((err) => {
      test.ok(err instanceof Error, 'error callback called');
      test.equal(err.message,
        'Do#done called more times than expected.', 'correct error message');
      test.end();
    })
    .success(() => {})
    .done().done();
});

tap.test('done called less times than defined', (test) => {
  new Do(2)
    .error(() => {})
    .success(() => {
      test.ok(false, 'success callback called once');
    }).done();
  test.end();
});

tap.test('#1 no success called if error is happened', (test) => {
  new Do(1)
    .error((err) => {
      test.ok(err instanceof Error, 'error callback called');
      test.end();
    })
    .success(() => {
      test.ok(false, 'success callback should not be called if error happened');
    }).done(new Error());
});

tap.test('#2 no success called if error is happened', (test) => {
  new Do(1)
    .error((err) => {
      test.ok(err instanceof Error, 'error callback called');
    })
    .success(() => {
      test.ok(false, 'success callback should not be called if error happened');
    }).done(new Error()).done();
  test.end();
});

tap.test('success is called only once using Do#done & Do#success', (test) => {
  new Do(1)
    .error((err) => {
      test.ok(err instanceof Error, 'error triggered');
      test.equal(err.message,
        'Success can be called only once.', 'correct error message');
      test.end();
    })
    .success(() => {}).success().done();
});

tap.test('success is called only once using Do#success', (test) => {
  new Do(1)
    .error((err) => {
      test.ok(err instanceof Error, 'error triggered');
      test.equal(err.message,
        'Success can be called only once.', 'correct error message');
      test.end();
    })
    .success(() => {}).success().success();
});

tap.test('complete called without errors and success/error callbacks',
  (test) => {
    const todo = new Do(1).complete(() => {
      test.ok(true, 'success called');
    }).done();
    test.equal(todo.errors.length, 0, 'complete called without errors');
    test.end();
  });

tap.test('complete called without errors with success callbacks', (test) => {
  const todo = new Do(1)
    .success(() => {
      test.ok(true, 'success called');
    })
    .complete(() => {}).done();
  test.equal(todo.errors.length, 0, 'complete called without errors');
  test.end();
});

tap.test('complete called with error', (test) => {
  new Do(1)
    .error((err) => {
      test.ok(err instanceof Error, 'error callback got an error');
      test.end();
    })
    .complete(() => {}).done(new Error());
});

tap.test('invoke complete directly', (test) => {
  new Do(1)
    .success(() => {
      test.ok(true, 'success called on complete');
      test.end();
    })
    .complete(() => {}).complete();
});

tap.test('invoking success triggers complete', (test) => {
  new Do(1)
    .success(() => {
      test.ok(true, 'success called on complete');
      test.end();
    })
    .complete(() => {}).success();
});

tap.test('no todos and .success call', (test) => {
  new Do()
    .error(() => {
      test.ok(false, 'no error should happen');
    })
    .success(() => {
      test.ok(true, 'success called');
      test.end();
    })
    .success();
});

tap.test('no todos and .complete call', (test) => {
  new Do()
    .error(() => {
      test.ok(false, 'no error should happen');
    })
    .complete(() => {
      test.ok(true, 'complete called');
      test.end();
    })
    .complete();
});

