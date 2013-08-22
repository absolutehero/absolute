/**
 * User: craig
 * Date: 3/17/13
 * Time: 12:52 PM
 * Copyright (c) 2013 Absolute Hero Games LLC
 */

define(function () {
    "use strict";

    var AsyncQueue = function() {
        this._initAsyncQueue();
    };

    AsyncQueue.prototype._initAsyncQueue = function() {
        this.tasks = new Array();
        this.current = 0;
    };


    AsyncQueue.prototype.reset = function() {
        this.current = 0;
    };

    AsyncQueue.prototype.clear = function() {
        this.tasks = new Array();
        this.reset();
    };

    AsyncQueue.prototype.pushTask = function(task) {
        this.tasks.push(task);
    };

    AsyncQueue.prototype.pushTasks = function(tasks) {
        for (var task in tasks) {
            this.tasks.push(tasks[task]);
        }
    };

    AsyncQueue.prototype.run = function(onProgress, onComplete) {
        this.onProgress = onProgress;
        this.onComplete = onComplete;

        var self = this;
        if (typeof this.tasks[0] === 'function' ) {
            this.tasks[this.current](function(pc) { self._updateProgress(pc); }, function() { self._runNext(); });
        }
        else {
            throw ('Error: task is a ' + typeof this.tasks[0] + ' not a function!');
        }
    };

    AsyncQueue.prototype._runNext = function() {
        var self = this;
        if (++this.current < this.tasks.length) {
            if (typeof this.tasks[this.current] === 'function' ) {
                this.tasks[this.current](function(pc) { self._updateProgress(pc); }, function() { self._runNext() });
            }
            else {
                throw ('Error: task is a ' + typeof this.tasks[0] + ' not a function!');
            }
        }
        else {
            this.onComplete();
        }
    };

    AsyncQueue.prototype._updateProgress = function(taskPercentComplete) {
        var percentComplete = 0;

        if (this.tasks.length > 0) {
            percentComplete = (this.current / this.tasks.length) +
                ((1 / this.tasks.length) * taskPercentComplete);

        }
        this.onProgress(percentComplete);
    };

    return AsyncQueue;
});