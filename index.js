/**
 * Do constructor.
 *
 * Examples:
 *
 *   // Create 1 todo
 *   var todo = new Do();
 *   // Create 3 todos.
 *   var todo = new Do(3);
 *
 * @param {Number?} amount of todos
 * @api public
 */
function Do(amount) {
    this._amount = amount || 1;
    this.errors = [];
    this.done = this.done.bind(this);
}

module.exports = Do;

/**
 * Setter/getter for amount of todos.
 *
 * Examples:
 *
 *   // Get the current amount.
 *   todo.amount();
 *   // Set a new amount
 *   todo.amount(3);
 *
 * @param {Number?} value - if passed works as a setter, otherwise as a getter.
 * @return {Number|Do} amount or instance
 * @api public
 */
Do.prototype.amount  = function(value) {
    if (value) {
        this._amount = value;
        return this;
    }

    return this._amount;
};

/**
 * Enable to cast the instance to the number of todos.
 *
 * Examples:
 *
 *   new Do(3) == 3; // true
 *
 * @return {Number} amount
 * @api public
 */
Do.prototype.valueOf  = function() {
    return this._amount;
};

/**
 * Increase amount of todos.
 *
 * Examles:
 *
 *   // add 1 more
 *   todo.inc();
 *   // add 3 more
 *   todo.inc(3)
 *
 * @param {Number?} value - add the value to the current amount or just 1.
 * @return {Number} amount
 * @api public
 */
Do.prototype.inc  = function(value) {
    this._amount += value || 1;
    return this._amount;
};

/**
 * Decrease amount of todos.
 *
 * Examples:
 *
 *   // remove 1
 *   todo.dec();
 *   // remove 3
 *   todo.dec(3)
 *
 * @param {Number?} value - substitute the value from the current amount or just 1.
 * @return {Number} amount
 * @api public
 */
Do.prototype.dec  = function(value) {
    this._amount -= value || 1;
    return this._amount;
};

/**
 * Set an error callback or trigger an error.
 * If an error is passed to the Do#done and the error callback is defined, it is
 * called every time.
 *
 * Examples:
 *
 *   // define error callback
 *   todo.error(function(err) {
 *   });
 *   // trigger an error manually
 *   todo.error(new Error());
 *
 * @param {Function|Error?} err - if function passed, it is used as an error callback,
 *     otherwise it can be an error which is passed to the error callback defined before.
 * @return {Do} instance
 * @api public
 */
Do.prototype.error  = function(err) {
    if (!err) {
        return this;
    }

    if (typeof err == 'function') {
        this._error = err;
    } else {
        this.errors.push(err);
        this._error.apply(this, arguments);
    }

    return this;
};

/**
 * Set an success callback or trigger a success.
 * If a todo is done without errors and success callback is defined it will be called by Do#done.
 *
 * Examples:
 *
 *   // define success callback
 *   todo.success(function() {
 *   });
 *   // trigger success manually
 *   todo.success();
 *
 * @param {Function?} fn - if function passed, it is used as success callback,
 *     otherwise success callback defined before will be called.
 * @return {Do} instance
 * @api public
 */
Do.prototype.success  = function(fn) {
    if (typeof fn == 'function') {
        this._success = fn;
    } else {
        this._success.apply(this, arguments);
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
 *
 * @param {Error?} err - if error passed, error callback will be called,
 *     otherwise if all todos without errors are done, success callback will be called.
 * @return {Do} instance
 * @api public
 */
Do.prototype.done  = function(err) {
    if (err) {
        this.error(err);
        return this;
    }

    if (this._amount == null) {
        throw new Error('Bad context.');
    }

    this._amount--;

    if (this._amount === 0) {
        if (!this.errors.length) {
            this._success.apply(this, arguments);
        }
    } else if (this._amount < 0) {
        this.error(new Error('Done called more times than defined.'));
    }

    return this;
};

