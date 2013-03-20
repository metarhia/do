/**
 * Do constructor.
 *
 * Examples:
 *
 *   // Create 1 todo
 *   var todo = new Do();
 *   // Create 3 todos.
 *   var todo = new Do(3);
 *   // Without a "new" statement.
 *   var todo = Do();
 *
 * @param {Number?} amount of todos
 * @api public
 */
function Do(amount) {
    if (!(this instanceof Do)) {
        return new Do(amount);
    }
    this._amount = amount || 0;
    this.errors = [];
    this.done = this.done.bind(this);
}

module.exports = Do;

/**
 * Accumulated errors.
 *
 * @api public
 * @property errors
 */
Do.prototype.errors;

/**
 * Setter/getter for amount of todos.
 *
 * Examples:
 *
 *   // Get the current amount.
 *   todo.amount();
 *   // Set a new amount.
 *   todo.amount(3);
 *
 * @param {Number?} value - if passed works as a setter, otherwise as a getter.
 * @return {Number|Do} amount or instance
 * @api public
 */
Do.prototype.amount = function(value) {
    if (value != null) {
        this._amount = value;
        return this;
    }

    return this._amount;
};

/**
 * Increment amount of todos.
 *
 * Examles:
 *
 *   // Add 1 todo.
 *   todo.inc();
 *   // Add 3 todos.
 *   todo.inc(3)
 *
 * @param {Number?} value - add the value to the current amount or just 1.
 * @return {Number} amount
 * @api public
 */
Do.prototype.inc = function(value) {
    this._amount += value || 1;
    return this;
};

/**
 * Decrement amount of todos.
 *
 * Examples:
 *
 *   // Reduce at 1 todo.
 *   todo.dec();
 *   // Reduce at 3 todos.
 *   todo.dec(3)
 *
 * @param {Number?} value - substitute the value from the current amount or just 1.
 * @return {Number} amount
 * @api public
 */
Do.prototype.dec = function(value) {
    this._amount -= value || 1;
    return this;
};

/**
 * Set an error callback or trigger an error.
 *
 * Error callback is called EVERY time an error is passed to `Do#done` or `Do#error`.
 *
 * Examples:
 *
 *   // Define error callback.
 *   var send;
 *   todo.error(function(err) {
 *       console.error(err);
 *       // Ensure sending response only once.
 *       if (!send) {
 *          req.send('Error');
 *          send = true;
 *       }
 *   });
 *   // Trigger an error manually.
 *   todo.error(new Error());
 *
 * @param {Function|Error?} err - if function passed, it is used as an error callback,
 *     otherwise it can be an error which is passed to the error callback defined before.
 * @return {Do} instance
 * @api public
 */
Do.prototype.error = function(err) {
    if (typeof err == 'function') {
        this._errorCallback = err;
    } else {
        this.done(err);
    }

    return this;
};

/**
 * Set a success callback or trigger success.
 *
 * If all todos are done without errors - success callback will be called by Do#done.
 * Success callback is called ONLY ONCE.
 *
 * Examples:
 *
 *   // Define a success callback.
 *   todo.success(function() {
 *      res.send('Success');
 *   });
 *   // Trigger success manually.
 *   todo.success();
 *
 * @param {Function?} fn - if function passed, it is used as success callback,
 *     otherwise, success callback defined before, will be invoked.
 * @return {Do} instance
 * @api public
 */
Do.prototype.success = function(fn) {
    var err;

    if (typeof fn == 'function') {
        this._successCallback = fn;
    } else {
        this._validateCallbacks();
        this._complete();
    }

    return this;
};

/**
 * Set a complete callback or trigger complete.
 *
 * Complete callback is always called ONCE if it is defined independent of errors.
 *
 * Examples:
 *
 *   // Define a complete callback.
 *   todo.complete(function() {
 *      console.error(this.errors);
 *      res.send('Complete');
 *   });
 *   // Trigger complete manually.
 *   todo.complete();
 *
 * @param {Function?} fn - if function passed, it is used as complete callback,
 *     otherwise, complete callback defined before, will be invoked.
 * @return {Do} instance
 * @api public
 */
Do.prototype.complete = function(fn) {
    if (typeof fn == 'function') {
        this._completeCallback = fn;
    } else {
        this._validateCallbacks();
        this._complete();
    }

    return this;
};

/**
 * Indicate a done task. If an error is passed as first parameter - error will
 * be triggered.
 *
 * Examples:
 *
 *   // with error
 *   todo.done(err);
 *   // without error
 *   todo.done();
 *   // context of `todo.done` is ensured.
 *   someTask(todo.done);
 *
 * @param {Error?} err - if error passed, error callback will be called,
 *     otherwise if all todos without errors are done, success callback will be called.
 * @return {Do} instance
 * @api public
 */
Do.prototype.done = function(err) {
    this._validateCallbacks();
    this._amount--;
    this._error(err);

    if (this._amount === 0) {
        this._complete();
    } else if (this._amount < 0) {
        this._error(new Error('Do#done called more times than expected.'));
    }

    return this;
};

/**
 * Ensure callbacks are defined.
 *
 * @api private
 */
Do.prototype._validateCallbacks = function() {
    if (!this._completeCallback && !(this._errorCallback && this._successCallback)) {
        throw new Error('Either "error" and "success" or "complete" callback should be defined.');
    }
};

/**
 * Execute `success` and `complete` callbacks.
 *
 * @api private
 */
Do.prototype._complete = function() {
    if (this._successCallback && !this.errors.length) {
        if (this._successCalled) {
            this._error(new Error('Success can be called only once.'));
        } else {
            this._successCalled = true;
            this._successCallback();
        }
    }

    if (this._completeCallback) {
        if (this._completeCalled) {
            this._error(new Error('Complete can be called only once.'));
        } else {
            this._completeCalled = true;
            this._completeCallback();
        }
    }
};

/**
 * Execute error callback, accumulate errors.
 *
 * @param {Error?} err
 * @api private
 */
Do.prototype._error = function(err) {
    if (err) {
        this.errors.push(err);
        if (this._errorCallback) {
            this._errorCallback(err);
        }
    }
};
