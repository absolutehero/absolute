/**
 * User: craig
 * Date: 3/17/13
 * Time: 2:19 PM
 * Copyright (c) 2013 Absolute Hero Games LLC
 */
define (function() {
    var Debug = {

        enabled: false,

        custom: {},

        log: function (msg) {
            if (this.enabled) {
                console.log(msg);
            }
        }
    };

    return Debug;
});
