## "do" is the simplest way to manage callbacks.

If you don't want to use all the async/chain libraries but just want a reliable way to know when the function is done - this is for you.

## Installation
    npm i do

    var Do = require('do');

## API

You need to specify "error" and "success" callbacks, otherwise Do will throw in this cases:

1. Do#done is called with error param, but error callback is not defined.
2. All todos are done, but success callback is not defined.


## Do()

  Do constructor.

  Examples:

```js
// Create 1 todo
var todo = new Do();
// Create 3 todos.
var todo = new Do(3);
// Without a "new" statement.
var todo = Do();
```

## Do#errors

  Accumulated errors.

## Do#amount(value:Number?)

  Setter/getter for amount of todos.

  Examples:

```js
// Get the current amount.
todo.amount();
// Set a new amount.
todo.amount(3);
```

## Do#inc(value:Number?)

  Increase amount of todos.

  Examles:

```js
// Add 1 todo.
todo.inc();
// Add 3 todos.
todo.inc(3)
```

## Do#dec(value:Number?)

  Decrease amount of todos.

  Examples:

```js
// Reduce at 1 todo.
todo.dec();
// Reduce at 3 todos.
todo.dec(3)
```

## Do#error(err:Function|Error?)

  Set an error callback or trigger an error.

  Error callback is called EVERY time an error is passed to Do#done or Do#error.
  If you send an http response in the error handler, ensure to do it only once.

  Examples:

```js
// Define error callback.
todo.error(function(err) {
    console.error(err);
    // Ensure sending response only once.
    if (this.errors.length == 1) {
       req.send('Error')
    }
});
// Trigger an error manually.
todo.error(new Error());
```

## Do#success(fn:Function?)

  Set a success callback or trigger success.

  If all todos are done without errors - success callback will be called by Do#done.
  Success callback is called ONLY ONCE.

  Examples:

```js
// Define a success callback.
todo.success(function() {
   res.send('Success');
});
// Trigger success manually.
todo.success();
```

## Do#done(err:Error?)

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
