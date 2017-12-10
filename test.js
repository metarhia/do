'use strict';

QUnit.module('do');

test('get/set/inc/dec amount', () => {
  equal(new Do().amount(5).amount(), 5, 'set amount');
  strictEqual(new Do(5).amount(), 5, 'get amount');
  strictEqual(new Do(5).inc().amount(), 6, 'inc +1');
  strictEqual(new Do(5).inc(3).amount(), 8, 'inc +3');
  strictEqual(new Do(5).dec().amount(), 4, 'dec -1');
  strictEqual(new Do(5).dec(3).amount(), 2, 'inc -3');
});

test('throw if callbacks are not defined', () => {
  stop();
  expect(3);

  throws(() => {
    new Do(1).done(new Error());
  }, Error, 'throw if error is passed and error callback not defined.');

  throws(() => {
    new Do(1).done();
  }, Error, 'throw if no error is passed, tasks are done, but no success callback defined');

  new Do(1)
    .complete(function() {
      equal(this.errors.length, 0, 'do not throws if complete callback is defined');
      start();
    })
    .done();
});

test('done called more times than defined', () => {
  expect(3);
  stop();

  new Do(1)
    .error((err) => {
      ok(err instanceof Error, 'error callback called');
      equal(err.message, 'Do#done called more times than expected.', 'correct error message');
    })
    .success(() => {
      ok(true, 'success callback called');
      start();
    }).done().done();
});

test('#1 no success called if error is happened', () => {
  expect(1);
  stop();
  new Do(1)
    .error((err) => {
      ok(err instanceof Error, 'error callback called');
      start();
    })
    .success(() => {
      ok(true, 'success callback should not be called if error happened');
    }).done(new Error());
});

test('#2 no success called if error is happened', () => {
  expect(2);
  stop();
  new Do(1)
    .error((err) => {
      ok(err instanceof Error, 'error callback called');
      start();
    })
    .success(() => {
      ok(false, 'success callback should not be called if error happened');
    }).done(new Error()).done();
});

test('success is called only once using Do#done', () => {
  expect(1);
  stop();

  new Do(3)
    .error(() => {})
    .success(() => {
      ok(true, 'success callback called once');
      start();
    }).done().done().done();
});


test('success is called only once using Do#done & Do#success', () => {
  expect(3);
  stop();

  new Do(1)
    .error((err) => {
      ok(err instanceof Error, 'error triggered');
      equal(err.message, 'Success can be called only once.', 'correct error message');
      start();
    })
    .success(() => {
      ok(true, 'success callback called once');
    }).success().done();
});

test('success is called only once using Do#success', () => {
  expect(3);
  stop();

  new Do(1)
    .error((err) => {
      ok(err instanceof Error, 'error triggered');
      equal(err.message, 'Success can be called only once.', 'correct error message');
      start();
    })
    .success(() => {
      ok(true, 'success callback called once');
    }).success().success();
});

test('complete called without errors and without success/error callbacks', () => {
  expect(1);
  stop();

  new Do(1).complete(function() {
    equal(this.errors.length, 0, 'complete called without errors');
    start();
  }).done();
});

test('complete called without errors with success callbacks', () => {
  expect(2);
  stop();

  new Do(1)
    .success(() => {
      ok(true, 'success called');
    })
    .complete(function() {
      equal(this.errors.length, 0, 'complete called without errors');
      start();
    }).done();
});

test('complete called with error', () => {
  expect(2);
  stop();

  new Do(1)
    .error((err) => {
      ok(err instanceof Error, 'error callback got an error');
    })
    .complete(function() {
      equal(this.errors.length, 1, 'complete called with error');
      start();
    }).done(new Error());
});

test('invoke complete directly', () => {
  expect(2);
  stop();

  new Do(1)
    .success(() => {
      ok(true, 'success called on complete');
    })
    .complete(function() {
      equal(this.errors.length, 0, 'complete called without errors');
      start();
    }).complete();
});

test('invoking success triggers complete', () => {
  expect(2);
  stop();

  new Do(1)
    .success(() => {
      ok(true, 'success called on complete');
    })
    .complete(function() {
      equal(this.errors.length, 0, 'complete called without errors');
      start();
    }).success();
});

test('no todos and .success call', () => {
  expect(1);
  stop();

  new Do()
    .error(() => {
      ok(false, 'no error should happen');
      start();
    })
    .success(() => {
      ok(true, 'success called');
      start();
    })
    .success();
});

test('no todos and .complete call', () => {
  expect(1);
  stop();

  new Do()
    .error(() => {
      ok(false, 'no error should happen');
      start();
    })
    .complete(() => {
      ok(true, 'complete called');
      start();
    })
    .complete();
});
