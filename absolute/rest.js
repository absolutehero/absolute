/**
 * User: craig
 * Date: 3/26/14
 * Time: 4:33 PM
 * Copyright (c) 2014 Absolute Hero, Inc.
 */
define(function () {

    var REST = {

        get: function (url, success, error) {
            this.request('GET', url, success, error);
        },

        post: function (url, success, error) {
            this.request('POST', url, success, error);
        },

        request: function(method, url, success, error) {
            var request = new XMLHttpRequest();

            request.open(method, url, true);
            request.responseType = 'json';

            request.onload = function () {
                if (request.status !== 200) {
                    if (typeof error === "function") {
                        error(request.response);
                    }
                }
                else {
                    if (typeof success === "function") {
                        success(request.response);
                    }
                }
            }.bind(this);

            request.send();
        }


    };

    return REST;
});