'use strict';

const Do = require('..');

QUnit.test('get/set/inc/dec amount', (test) => {
  test.equal(new Do().amount(5).amount(), 5, 'set amount');
  stricttest.equal(new Do(5).amount(), 5, 'get amount');
  stricttest.equal(new Do(5).inc().amount(), 6, 'inc +1');
  stricttest.equal(new Do(5).inc(3).amount(), 8, 'inc +3');
  stricttest.equal(new Do(5).dec().amount(), 4, 'dec -1');
  stricttest.equal(new Do(5).dec(3).amount(), 2, 'inc -3');
});

QUnit.test('throw if callbacks are not defined', (test) => {
  test.expect(3);
  test.stop();

  throws(() => {
    new Do(1).done(new Error());
  }, Error, 'throw if error is passed and error callback not defined.');

  throws(() => {
    new Do(1).done();
  }, Error, 'throw if no error is passed, tasks are done, but no success callback defined');

  new Do(1)
    .complete(function() {
      test.equal(this.errors.length, 0, 'do not throws if complete callback is defined');
      test.start();
    })
    .done();
});

QUnit.test('done called more times than defined', (test) => {
  test.expect(3);
  test.stop();

  new Do(1)
    .error((err) => {
      test.ok(err instanceof Error, 'error callback called');
      test.equal(err.message, 'Do#done called more times than test.expected.', 'correct error message');
    })
    .success(() => {
      test.ok(true, 'success callback called');
      test.start();
    }).done().done();
});

QUnit.test('#1 no success called if error is happened', (test) => {
  test.expect(1);
  test.stop();
  new Do(1)
    .error((err) => {
      test.ok(err instanceof Error, 'error callback called');
      test.start();
    })
    .success(() => {
      test.ok(true, 'success callback should not be called if error happened');
    }).done(new Error());
});

QUnit.test('#2 no success called if error is happened', (test) => {
  test.expect(2);
  test.stop();
  new Do(1)
    .error((err) => {
      test.ok(err instanceof Error, 'error callback called');
      test.start();
    })
    .success(() => {
      test.ok(false, 'success callback should not be called if error happened');
    }).done(new Error()).done();
});

QUnit.test('success is called only once using Do#done', (test) => {
  test.expect(1);
  test.stop();

  new Do(3)
    .error(() => {})
    .success(() => {
      test.ok(true, 'success callback called once');
      test.start();
    }).done().done().done();
});


QUnit.test('success is called only once using Do#done & Do#success', (test) => {
  test.expect(3);
  test.stop();

  new Do(1)
    .error((err) => {
      test.ok(err instanceof Error, 'error triggered');
      test.equal(err.message, 'Success can be called only once.', 'correct error message');
      test.start();
    })
    .success(() => {
      test.ok(true, 'success callback called once');
    }).success().done();
});

QUnit.test('success is called only once using Do#success', (test) => {
  test.expect(3);
  test.stop();

  new Do(1)
    .error((err) => {
      test.ok(err instanceof Error, 'error triggered');
      test.equal(err.message, 'Success can be called only once.', 'correct error message');
      test.start();
    })
    .success(() => {
      test.ok(true, 'success callback called once');
    }).success().success();
});

QUnit.test('complete called without errors and without success/error callbacks', (test) => {
  test.expect(1);
  test.stop();

  new Do(1).complete(function() {
    test.equal(this.errors.length, 0, 'complete called without errors');
    test.start();
  }).done();
});

QUnit.test('complete called without errors with success callbacks', (test) => {
  test.expect(2);
  test.stop();

  new Do(1)
    .success(() => {
      test.ok(true, 'success called');
    })
    .complete(function() {
      test.equal(this.errors.length, 0, 'complete called without errors');
      test.start();
    }).done();
});

QUnit.test('complete called with error', (test) => {
  test.expect(2);
  test.stop();

  new Do(1)
    .error((err) => {
      test.ok(err instanceof Error, 'error callback got an error');
    })
    .complete(function() {
      test.equal(this.errors.length, 1, 'complete called with error');
      test.start();
    }).done(new Error());
});

QUnit.test('invoke complete directly', (test) => {
  test.expect(2);
  test.stop();

  new Do(1)
    .success(() => {
      test.ok(true, 'success called on complete');
    })
    .complete(function() {
      test.equal(this.errors.length, 0, 'complete called without errors');
      test.start();
    }).complete();
});

QUnit.test('invoking success triggers complete', (test) => {
  test.expect(2);
  test.stop();

  new Do(1)
    .success(() => {
      test.ok(true, 'success called on complete');
    })
    .complete(function() {
      test.equal(this.errors.length, 0, 'complete called without errors');
      test.start();
    }).success();
});

QUnit.test('no todos and .success call', (test) => {
  test.expect(1);
  test.stop();

  new Do()
    .error(() => {
      test.ok(false, 'no error should happen');
      test.start();
    })
    .success(() => {
      test.ok(true, 'success called');
      test.start();
    })
    .success();
});

QUnit.test('no todos and .complete call', (test) => {
  test.expect(1);
  test.stop();

  new Do()
    .error(() => {
      test.ok(false, 'no error should happen');
      test.start();
    })
    .complete(() => {
      test.ok(true, 'complete called');
      test.start();
    })
    .complete();
});
