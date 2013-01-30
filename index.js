function Do(value) {
    this.value = value || 0;
}

Do.prototype.valueOf  = function() {
    return this.value;
};

Do.prototype.inc  = function(value) {
    this.value += value || 1;
    return this.value;
};

Do.prototype.dec  = function(value) {
    this.value -= value || 1;
    return this.value;
};

Do.prototype.set  = function(value) {
    this.value = value || 0;
    return this.value;
};

Do.prototype.get  = function(value) {
    return this.value;
};

Do.prototype.error  = function(fn) {
    if (typeof fn == 'function') {
        this._error = fn;
    } else {
        this._error(fn);
    }

    return this;
};

Do.prototype.success  = function(fn) {
    if (typeof fn == 'function') {
        this._success = fn;
    } else {
        this._success();
    }

    return this;
};

Do.prototype.done  = function(fn) {
    if (typeof fn == 'function') {
        this._done = fn;
        return this;
    }

    if (fn && this._error) {
        this._error(fn);
    }

    this.value--;

    if (this.value === 0) {
        if (this._success && !fn) {
            this._success();
        }
        if (this._done) {
            this._done(fn);
        }
        if (!this._done && !this._success) {
            this.error(new Error('Either done nore success callback defiend.'));
        }
    } else if (this.value < 0) {
        this.error(new Error('Called more times than defined.'));
    }

    return this;
};

module.exports = Do;
