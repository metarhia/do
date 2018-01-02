'use strict';

const emptiness = () => {};

const once = (
  // Wrap function: call once, not null
  fn // function (optional)
  // Returns: function, wrapped callback
) => {
  if (!fn) return emptiness;
  let finished = false;
  const wrap = (...args) => {
    if (finished) return;
    finished = true;
    fn(...args);
  };
  return wrap;
};

function Do() {}

const chain = function(fn, ...args) {
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

Do.prototype.do = function(fn, ...args) {
  return chain.call(this, fn, ...args);
};

Do.prototype.forward = function() {
  if (this.fn) this.fn(...this.args, (err, data) => {
    const next = this.next;
    if (next) {
      if (next.fn) next.forward();
    } else if (this.done) {
      this.done(err, data);
    }
  });
};

function Collector() {}

Collector.prototype.collect = function(key, err, value) {
  if (this.isDone) return this;
  if (err) {
    this.finalize(err, this.data);
    return this;
  }
  if (this.expectKeys && !this.expectKeys.has(key)) {
    if (this.isDistinct) {
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

Collector.prototype.pick = function(key, value) {
  this.collect(key, null, value);
  return this;
};

Collector.prototype.fail = function(key, err) {
  this.collect(key, err);
  return this;
};

Collector.prototype.take = function(key, fn, ...args) {
  fn(...args, (err, data) => {
    this.collect(key, err, data);
  });
  return this;
};

Collector.prototype.callback = function(key) {
  return (...args) => this(key, ...args);
};

Collector.prototype.timeout = function(msec) {
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

Collector.prototype.done = function(callback) {
  this.onDone = callback;
  return this;
};

Collector.prototype.finalize = function(key, err, data) {
  if (this.isDone) return this;
  if (this.onDone) {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.isDone = true;
    this.onDone(key, err, data);
  }
  return this;
};

Collector.prototype.distinct = function(value = true) {
  this.isDistinct = value;
  return this;
};

Collector.prototype.cancel = function(err) {
  err = err || new Error('Collector cancelled');
  this.finalize(err, this.data);
  return this;
};

Collector.prototype.then = function(fulfilled, rejected) {
  const fulfill = once(fulfilled);
  const reject = once(rejected);
  this.onDone = (err, result) => {
    if (err) reject(err);
    else fulfill(result);
  };
  return this;
};

const collect = (
  // Collector instance constructor
  expected // number or array of string,
  // Returns: Collector, instance
) => {
  const expectKeys = Array.isArray(expected) ? new Set(expected) : null;
  const fields = {
    expectKeys,
    expected: expectKeys ? expected.length : expected,
    keys: new Set(),
    count: 0,
    timer: null,
    onDone: emptiness,
    isDistinct: false,
    isDone: false,
    data: {}
  };
  const collector = (...args) => {
    if (args.length === 1) return collector.callback(args[0]);
    return collector.collect(...args);
  };
  Object.setPrototypeOf(collector, Collector.prototype);
  return Object.assign(collector, fields);
};

module.exports = {
  do: (...args) => ((typeof(args[0]) === 'function') ? chain : collect)(...args)
};
