var a = require('assert'),
    Do = require('./');

a.strictEqual(new Do(5).value, 5, 'amount');
a.equal(new Do(5), 5, 'valueOf');
a.strictEqual(new Do(5).inc(), 6, 'inc +1');
a.strictEqual(new Do(5).inc(3), 8, 'inc +3');
a.strictEqual(new Do(5).dec(), 4, 'dec -1');
a.strictEqual(new Do(5).dec(3), 2, 'inc -3');
a.strictEqual(new Do().set(5), 5, 'set');
a.strictEqual(new Do(5).get(), 5, 'get');
new Do(5).error(function(err) {
    a.ok(err instanceof Error, 'error callback');
}).error(new Error());
new Do(5).success(function() {
    a.ok(true, 'success callback');
}).success(new Error());
new Do(1).done(function(err) {
    a.equal(err, null, 'done callback without error');
}).done();
new Do(5).done(function(err) {
    a.ok(err instanceof Error, 'done callback with error');
}).done(new Error());
(function() {
    var todo = new Do(3),
        called = 0,
        success;

    todo.success(function() {
        success = true;
    });

    todo.done(function(err) {
        called++;
        a.equal(err, null, 'done callback without error');
    });

    todo.done().done().done();
    a.ok(success, 'success called');
    a.equal(called, 1, 'done called once');
}());
(function() {
    var todo = new Do(3),
        doneCalled = 0,
        successCalled = 0,
        errorCalled = 0;

    todo.success(function() {
        successCalled++;
    });

    todo.done(function(err) {
        doneCalled++;
        a.ok(err instanceof Error, 'done callback error passed');
    });

    todo.error(function(err) {
        errorCalled++;
        a.ok(err instanceof Error, 'error callback error passed');
    });

    todo.done(new Error()).done(new Error()).done(new Error());

    a.equal(doneCalled, 1, 'done called once');
    a.equal(errorCalled, 3, 'error called 3 times');
    a.equal(successCalled, 0, 'success called 0 times');
}());

console.log('Passed successfully.');
