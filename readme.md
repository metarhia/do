## "do" is the simplest way to manage callbacks.

If you don't want to use all the async/chain libraries but just want a reliable way to know when the function is done - this is for you.

## Installation
    npm i do

    var Do = require('do');

## API

### Do()

  Do constructor.

  Examples:

```js
// Create 1 todo
var todo = new Do(1);
// Create 3 todos.
var todo = new Do(3);
// without new statement
var todo = Do(1);
```

### Do#amount(value:Number?)

  Setter/getter for amount of todos.

  Examples:

```js
// Get the current amount.
todo.amount();
// Set a new amount
todo.amount(3);
```

### Do#valueOf()

  Enable to cast the instance to the number of todos.

  Examples:

```js
new Do(3) == 3; // true
```

### Do#inc(value:Number?)

  Increase amount of todos.

  Examles:

```js
// add 1 more
todo.inc();
// add 3 more
todo.inc(3)
```

### Do#dec(value:Number?)

  Decrease amount of todos.

  Examples:

```js
// remove 1
todo.dec();
// remove 3
todo.dec(3)
```

### Do#error(err:Function|Error?)

  Set an error callback or trigger an error.
  If an error is passed to the Do#done and the error callback is defined, it is
  called every time.

  Examples:

```js
// define error callback
todo.error(function(err) {
});
// trigger an error manually
todo.error(new Error());
```

### Do#success(fn:Function?)

  Set an success callback or trigger a success.
  If a todo is done without errors and success callback is defined it will be called by Do#done.

  Examples:

```js
// define success callback
todo.success(function() {
});
// trigger success manually
todo.success();
```

### Do#done(err:Error?)

  Indicate a done task. If an error is passed as first parameter - error will
  be triggered.

  Examples:

```js
// with error
todo.done(err);
// without error
todo.done();
// context of `todo.done` is ensured.
someTask(todo.done);
```

## Examples

### Mix parallel and serial executions

    var Do = require('do'),
        todo = new Do(2);

    todo.error(errorHandler);
    todo.success(successHandler);

    function parallelTask1(callback) {
        function serialTask1() {
            var todo = new Do(2);
            todo.error(callback);
            todo.success(serialTask2);
            parallelTask1(todo.done);
            parallelTask2(todo.done);
        }

        function serialTask2() {
            var todo = new Do(2);
            todo.error(callback);
            todo.success(callback);
            parallelTask1(todo.done);
            parallelTask2(todo.done);
        }

        serialTask1();
    }

    function parallelTask2(callback) {
        function serialTask1() {
            var todo = new Do(2);
            todo.error(callback);
            todo.success(serialTask2);
            parallelTask1(todo.done);
            parallelTask2(todo.done);
        }

        function serialTask2() {
            var todo = new Do(2);
            todo.error(callback);
            todo.success(callback);
            parallelTask1(todo.done);
            parallelTask2(todo.done);
        }

        serialTask1();
    }

    parallelTask1(todo.done);
    parallelTask2(todo.done);

### Express application

    var Do = require('do');

    app.post('/', function(req, res, next) {
        var todo = new Do(3);

        // If an error happens, next callback will be called and the error passed along.
        todo.error(next);

        // If everything is done and no errors happened, success callback is called.
        todo.success(function() {
            res.send({status: 'ok'});
        });

        db.fetch(userId, function(err, user) {
            if (err) return todo.done(err);

            update(user, todo.done);
            notify(user, todo.done);
            addSomeBackgroundTask(user, todo.done);

            if (userId == '123456') {
                todo.inc();
                specialTaskForTheUser(user, todo.done);
            }

            if (user.type == 'freak') {
                todo.inc(3);
                task1(user, todo.done);
                task2(user, todo.done);
                task3(user, todo.done);
            }
        });
    });

## Run tests

    npm test

## Licence

MIT
