/**
 * User: craig
 * Date: 3/26/14
 * Time: 4:33 PM
 * Copyright (c) 2014 Absolute Hero, Inc.
 */
define(['pixi'], function (PIXI) {

    var REST = {

        get: function (url, success, error) {
            this.request('GET', url, success, error);
        },

        post: function (url, success, error) {
            this.request('POST', url, success, error);
        },

        request: function(method, url, success, error) {
            this.ajaxRequest = new PIXI.AjaxRequest(true);

            this.ajaxRequest.onreadystatechange = function () {
                if (this.ajaxRequest.readyState === 4) {
                    if (this.ajaxRequest.status === 200 || window.location.protocol.indexOf('http') === -1) {
                        if (typeof success === "function") {
                            success(JSON.parse(this.ajaxRequest.responseText));
                        }
                    }
                    else {
                        if (typeof error === "function") {
                            if (this.ajaxRequest.responseText) {
                                var response = JSON.parse(this.ajaxRequest.responseText);
                                error(response.message);
                            }
                            else {
                                error(this.ajaxRequest.statusText);
                            }
                        }
                    }
                }
            }.bind(this);

            this.ajaxRequest.open(method, url, true);
            if (this.ajaxRequest.overrideMimeType) {
                this.ajaxRequest.overrideMimeType('application/json');
            }
            this.ajaxRequest.send(null);
        }


    };

    return REST;
});