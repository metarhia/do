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
  if (!this.fn) return;
  this.fn(...this.args, (error, data) => {
    if (error) {
      let link = this;
      while (link.next) link = link.next;
      if (link.done) link.done(error, data);
      return;
    }
    const next = this.next;
    if (next) {
      if (next.fn) next.forward();
    } else if (this.done) {
      this.done(error, data);
    }
  });
};

function Collector() {}

Collector.prototype.collect = function (key, error, value) {
  if (this.finished) return this;
  if (error) {
    this.finalize(error, this.data);
    return this;
  }
  const isUnexpected = this.expectKeys && !this.expectKeys.has(key);
  if (isUnexpected) {
    if (this.unique) {
      const unexpected = new Error(`Unexpected key: ${key}`);
      this.finalize(unexpected, this.data);
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

Collector.prototype.fail = function (key, error) {
  this.collect(key, error);
  return this;
};

Collector.prototype.take = function (key, fn, ...args) {
  fn(...args, (error, data) => {
    this.collect(key, error, data);
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
      const error = new Error('Collector timed out');
      this.finalize(error, this.data);
    }, msec);
  }
  return this;
};

Collector.prototype.done = function (callback) {
  this.finish = callback;
  return this;
};

Collector.prototype.finalize = function (error, data) {
  if (this.finished) return this;
  if (!this.finish) return this;
  if (this.timer) {
    clearTimeout(this.timer);
    this.timer = null;
  }
  this.finished = true;
  this.finish(error, data);
  return this;
};

Collector.prototype.distinct = function (value = true) {
  this.unique = value;
  return this;
};

Collector.prototype.cancel = function (error) {
  const reason = error ?? new Error('Collector cancelled');
  this.finalize(reason, this.data);
  return this;
};

Collector.prototype.then = function (fulfill, reject) {
  this.finish = (error, result) => {
    if (error) {
      if (typeof reject === 'function') reject(error);
      return;
    }
    if (typeof fulfill === 'function') fulfill(result);
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
      const isError = args[1] instanceof Error;
      if (isError) return collector.fail(...args);
      return collector.pick(...args);
    }
    if (typeof args[1] === 'function') return collector.take(...args);
    return collector.collect(...args);
  };
  Object.setPrototypeOf(collector, Collector.prototype);
  return Object.assign(collector, fields);
};

const create = (...args) => {
  const factory = typeof args[0] === 'function' ? chain : collect;
  return factory(...args);
};

create.do = create;
module.exports = create;
