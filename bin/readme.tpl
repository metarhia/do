## "do" is the simplest way to manage callbacks.

If you don't want to use all the async/chain libraries but just want a reliable way to know when the function is done - this is for you.

## Installation
    npm i do

## Usage

 You need to specify "error" and "success" callbacks, otherwise "Do" will throw an error.

  var Do = require('do');
  var todo = Do(1);
  todo.error(error);
  todo.error(success);
  todo.done();

## Api

{api}

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
