'use strict';

function Do() {}

const chain = function (fn, ...args) {
  const current = (done) => {
    if (done) current.done = done;
    if (current.prev) {
      current.prev.next = current;
      current.prev();
    } else {
      current.forward();
    }
    return current;
  };

  const prev = this instanceof Do ? this : null;
  const fields = { prev, fn, args, done: null };

  Object.setPrototypeOf(current, Do.prototype);
  return Object.assign(current, fields);
};

Do.prototype.do = function (fn, ...args) {
  return chain.call(this, fn, ...args);
};

Do.prototype.forward = function () {
  if (this.fn)
    this.fn(...this.args, (err, data) => {
      const next = this.next;
      if (next) {
        if (next.fn) next.forward();
      } else if (this.done) {
        this.done(err, data);
      }
    });
};

function Collector() {}

Collector.prototype.collect = function (key, err, value) {
  if (this.finished) return this;
  if (err) {
    this.finalize(err, this.data);
    return this;
  }
  if (this.expectKeys && !this.expectKeys.has(key)) {
    if (this.unique) {
      const err = new Error('Unexpected key: ' + key);
      this.finalize(err, this.data);
      return this;
    }
  } else if (!this.keys.has(key)) {
    this.count++;
  }
  this.data[key] = value;
  this.keys.add(key);
  if (this.expected === this.count) {
    this.finalize(null, this.data);
  }
  return this;
};

Collector.prototype.pick = function (key, value) {
  this.collect(key, null, value);
  return this;
};

Collector.prototype.fail = function (key, err) {
  this.collect(key, err);
  return this;
};

Collector.prototype.take = function (key, fn, ...args) {
  fn(...args, (err, data) => {
    this.collect(key, err, data);
  });
  return this;
};

Collector.prototype.callback = function (key) {
  return (...args) => this(key, ...args);
};

Collector.prototype.timeout = function (msec) {
  if (this.timer) {
    clearTimeout(this.timer);
    this.timer = null;
  }
  if (msec > 0) {
    this.timer = setTimeout(() => {
      const err = new Error('Collector timed out');
      this.finalize(err, this.data);
    }, msec);
  }
  return this;
};

Collector.prototype.done = function (callback) {
  this.finish = callback;
  return this;
};

Collector.prototype.finalize = function (key, err, data) {
  if (this.finished) return this;
  if (this.finish) {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.finished = true;
    if (this.finish) this.finish(key, err, data);
  }
  return this;
};

Collector.prototype.distinct = function (value = true) {
  this.unique = value;
  return this;
};

Collector.prototype.cancel = function (err) {
  err = err || new Error('Collector cancelled');
  this.finalize(err, this.data);
  return this;
};

Collector.prototype.then = function (fulfill, reject) {
  this.finish = (err, result) => {
    if (err) reject(err);
    else fulfill(result);
  };
  return this;
};

// Collector instance constructor
//   expected <number> or array of string,
// Returns: <Function> Collector
const collect = (expected) => {
  const expectKeys = Array.isArray(expected) ? new Set(expected) : null;
  const fields = {
    expectKeys,
    expected: expectKeys ? expectKeys.size : expected,
    keys: new Set(),
    count: 0,
    timer: null,
    finish: null,
    unique: false,
    finished: false,
    data: {},
  };
  const collector = (...args) => {
    if (args.length === 1) return collector.callback(args[0]);
    if (args.length === 2) {
      if (args[1] instanceof Error) return collector.fail(...args);
      else return collector.pick(...args);
    }
    if (typeof args[1] === 'function') return collector.take(...args);
    return collector.collect(...args);
  };
  Object.setPrototypeOf(collector, Collector.prototype);
  return Object.assign(collector, fields);
};

const ex = (...args) =>
  (typeof args[0] === 'function' ? chain : collect)(...args);

ex.do = ex;
module.exports = ex;
