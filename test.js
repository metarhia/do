QUnit.module('do');

test('get/set/inc/dec amount', function() {
    equal(new Do().amount(5).amount(), 5, 'set amount');
    strictEqual(new Do(5).amount(), 5, 'get amount');
    strictEqual(new Do(5).inc().amount(), 6, 'inc +1');
    strictEqual(new Do(5).inc(3).amount(), 8, 'inc +3');
    strictEqual(new Do(5).dec().amount(), 4, 'dec -1');
    strictEqual(new Do(5).dec(3).amount(), 2, 'inc -3');
});

test('throw if callbacks are not defined', function() {
    throws(function() {
        new Do(1).done(new Error());
    }, Error, 'throw if error is passed and error callback not defined.');

    throws(function() {
        new Do(1).done();
    }, Error, 'throw if no error is passed, tasks are done, but no success callback defined');
});

test('done called more times than defined', function() {
    expect(3);
    stop();

    new Do(1)
        .error(function(err) {
            ok(err instanceof Error, 'error callback called');
            equal(err.message, 'Do#done called more times than defined.')
        })
        .success(function() {
            ok(true, 'success callback called');
            start();
        }).done().done();
});

test('#1 no success called if error is happened', function() {
    expect(1);
    stop();
    new Do(1)
        .error(function(err) {
            ok(err instanceof Error, 'error callback called');
            start();
        })
        .success(function() {
            ok(true, 'success callback should not be called if error happened');
        }).done(new Error());
});

test('#1 no success called if error is happened', function() {
    expect(1);
    stop();
    new Do(1)
        .error(function(err) {
            ok(err instanceof Error, 'error callback called');
            start();
        })
        .success(function() {
            ok(true, 'success callback should not be called if error happened');
        }).done(new Error()).done();
});

test('success is called only once using Do#done', function() {
    expect(1);
    stop();

    new Do(3)
        .error(function() {})
        .success(function() {
            ok(true, 'success callback called once');
            start();
        }).done().done().done();
});

test('success is called only once using Do#done & Do#success', function() {
    expect(3);
    stop();

    new Do(1)
        .error(function(err) {
            ok(err instanceof Error, 'error triggered');
            equal(err.message, 'Do#success called more than once.');
        })
        .success(function() {
            ok(true, 'success callback called once');
            start();
        }).success().done();
});

test('success is called only once using Do#success', function() {
    expect(3);
    stop();

    new Do(1)
        .error(function(err) {
            ok(err instanceof Error, 'error triggered');
            equal(err.message, 'Do#success called more than once.');
        })
        .success(function() {
            ok(true, 'success callback called once');
            start();
        }).success().success();
});

