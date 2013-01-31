var a = require('assert'),
    Do = require('./');


a.equal(new Do(5), 5, 'valueOf');
a.equal(new Do().amount(5), 5, 'set amount');
a.strictEqual(new Do(5).amount(), 5, 'get amount');
a.strictEqual(new Do(5).inc(), 6, 'inc +1');
a.strictEqual(new Do(5).inc(3), 8, 'inc +3');
a.strictEqual(new Do(5).dec(), 4, 'dec -1');
a.strictEqual(new Do(5).dec(3), 2, 'inc -3');

a.throws(function() {
    new Do(1).done(new Error());
}, Error, 'throw if error is passed and error callback not defined.');

a.throws(function() {
    new Do(1).done();
}, Error, 'throw if no error is passed, tasks are done, but no success callback defined');

new Do(5).error(function(err) {
    a.ok(err instanceof Error, 'error callback');
}).error(new Error());

new Do(5).success(function() {
    a.ok(true, 'success callback');
}).success(new Error());

(function() {
    var error,
        success;

    new Do(1)
        .error(function(err) {
            error = err;
        })
        .success(function() {
            success = true;
        }).done().done();

    a.ok(error instanceof Error, 'error callback called');
    a.equal(error.message, 'Done called more times than defined.')
    a.ok(success, 'success callback called');
}());

(function() {
    var success;

    new Do(1)
        .error(function() {})
        .success(function() {
            success = true;
        }).done(new Error());

    a.ok(!success, 'success callback should not be called if error happened');
}());

(function() {
    var success
        errors = 0;

    new Do(2)
        .error(function() {
            errors++;
        })
        .success(function() {
            success = true;
        }).done(new Error()).done();

    a.ok(!success, 'success callback should not be called if at least one error is happened');
    a.equal(errors, 1, 'one error is happened');
}());

(function() {
    var success = 0;

    new Do(3)
        .success(function() {
            success++;
        }).done().done().done();

    a.equal(success, 1, 'success callback called once');
}());

(function() {
    var success = 0;

    new Do(3)
        .success(function() {
            success++;
        }).done().done().done();

    a.equal(success, 1, 'success callback called once');
}());

(function() {
    new Do(1)
        .success(function(){})
        .done.call({});

    a.ok(true, 'context is ensured');
}());

console.log('Passed successfully.');
