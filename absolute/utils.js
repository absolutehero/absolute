/**
 * User: craig
 * Date: 6/12/14
 * Time: 1:44 PM
 * Copyright (c) 2014 Absolute Hero, Inc.
 */
define (function () {

    var Utils = {
        makeGUID: function () {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                return v.toString(16);
            });
        }
    };

    return Utils;
});