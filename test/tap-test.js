'use strict';

const tap = require('tap');
const Do = require('..');

tap.test('get/set/inc/dec amount', (test) => {
  test.equal(new Do().amount(5).amount(), 5, 'set amount');
  test.equal(new Do(5).amount(), 5, 'get amount');
  test.equal(new Do(5).inc().amount(), 6, 'inc +1');
  test.equal(new Do(5).inc(3).amount(), 8, 'inc +3');
  test.equal(new Do(5).dec().amount(), 4, 'dec -1');
  test.equal(new Do(5).dec(3).amount(), 2, 'inc -3');
  test.end();
});

tap.test('throw if callbacks are not defined', (test) => {
  
  test.throws(() => new Do(1).done(new Error()), Error,
    'throw if error is passed and error callback not defined.');

  test.throws(() => new Do(1).done(), Error,
    'throw if no error is passed, tasks are done, but no success callback defined');

  const todo = new Do(1).complete(() => {}).done();

  test.equal(todo.errors.length, 0,
    'do not throws if complete callback is defined');
  
  test.end();
});

tap.test('done called more times than defined', (test) => {
  new Do(1)
    .error((err) => {
      test.ok(err instanceof Error, 'error callback called');
      test.equal(err.message,
        'Do#done called more times than expected.', 'correct error message');
      test.end();
    })
    .success(() => {
      test.ok(true, 'success callback called');
    }).done().done();
});

tap.test('#1 no success called if error is happened', (test) => {
  new Do(1)
    .error((err) => {
      test.ok(err instanceof Error, 'error callback called');
      test.end();
    })
    .success(() => {
      test.ok(true, 'success callback should not be called if error happened');
      test.end();
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

tap.test('success is called only once using Do#done', (test) => {
  new Do(3)
    .error(() => {})
    .success(() => {
      test.ok(true, 'success callback called once');
    }).done().done().done();
  test.end();
});


tap.test('success is called only once using Do#done & Do#success', (test) => {
  new Do(1)
    .error((err) => {
      test.ok(err instanceof Error, 'error triggered');
      test.equal(err.message,
        'Success can be called only once.', 'correct error message');
    })
    .success(() => {
      test.ok(true, 'success callback called once');
    }).success().done();
  test.end();
});

tap.test('success is called only once using Do#success', (test) => {
  new Do(1)
    .error((err) => {
      test.ok(err instanceof Error, 'error triggered');
      test.equal(err.message,
        'Success can be called only once.', 'correct error message');
    })
    .success(() => {
      test.ok(true, 'success callback called once');
    }).success().success();
  test.end();
});

tap.test('complete called without errors and without success/error callbacks', (test) => {
  const todo = new Do(1).complete(() => {}).done();
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
  const todo = new Do(1)
    .error((err) => {
      test.ok(err instanceof Error, 'error callback got an error');
    })
    .complete(() => {}).done(new Error());
  test.equal(todo.errors.length, 1, 'complete called with error');
  test.end();
});

tap.test('invoke complete directly', (test) => {
  const todo = new Do(1)
    .success(() => {
      test.ok(true, 'success called on complete');
    })
    .complete(() => {}).complete();
  test.equal(todo.errors.length, 0, 'complete called without errors');
  test.end();
});

tap.test('invoking success triggers complete', (test) => {
  const todo = new Do(1)
    .success(() => {
      test.ok(true, 'success called on complete');
    })
    .complete(() => {}).success();
  test.equal(todo.errors.length, 0, 'complete called without errors');
  test.end();
});

tap.test('no todos and .success call', (test) => {
  new Do()
    .error(() => {
      test.ok(false, 'no error should happen');
    })
    .success(() => {
      test.ok(true, 'success called');
    })
    .success();
  test.end();
});

tap.test('no todos and .complete call', (test) => {
  new Do()
    .error(() => {
      test.ok(false, 'no error should happen');
    })
    .complete(() => {
      test.ok(true, 'complete called');
    })
    .complete();
  test.end();
});

