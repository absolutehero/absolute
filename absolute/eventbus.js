/**
 * User: craig
 * Date: 3/17/13
 * Time: 2:19 PM
 * Copyright (c) 2013 Absolute Hero Games LLC
 */

define(function () {

    var EventBus = {

        events: {},

        addEventListener: function (event, listener) {
            if (this.events[event] === undefined) {
                this.events[event] = [];
            }

            this.events[event].push(listener);
        },

        removeEventListener: function(event, listener) {
            var listeners = this.events[event];

            if (listeners) {
                for (var i = 0, l = listeners.length; i < l; ++i) {
                    if (listener === listeners[i]) {
                        listeners.splice(i, 1);
                        return;
                    }
                }
            }
        },

        dispatchEvent: function (event) {
            var listeners = this.events[event];

            if (listeners) {
                for (var i in listeners) {
                    var listener = listeners[i];
                    if (typeof listener === "function") {
                        listener(event);
                    }
                }
            }
        }
    };

    return EventBus;
});