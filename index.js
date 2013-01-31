/**
 * Do constructor.
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
 * @return {Number} amount
 * @api public
 */
Do.prototype.valueOf  = function() {
    return this._amount;
};

/**
 * Increase amount of todos.
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

