/**
 * User: craig
 * Date: 3/26/14
 * Time: 4:33 PM
 * Copyright (c) 2014 Absolute Hero, Inc.
 */
define(['pixi'], function (PIXI) {

    var REST = {

        get: function (url, success, error, data) {
            this.request('GET', url, success, error, data);
        },

        post: function (url, success, error, data, headers) {
            this.request('POST', url, success, error, data, headers);
        },

        request: function(method, url, success, error, data, headers) {
            var params = null;
            this.ajaxRequest = new window.XMLHttpRequest();



            if (method === "GET" && data) {
                if (typeof data == "string") {
                    params = data;
                }
                else {
                    params = this._formatQuery(data);
                }
                url += "?" + params;
            }

            this.ajaxRequest.open(method, url, true);

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


            if (method === "POST" && data) {
                if (typeof data == "string") {
                    params = data;
                    this.ajaxRequest.setRequestHeader("Content-Type", "text/plain");
                }
                else {
                    params = this._formatQuery(data);
                    this.ajaxRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
                }
            }

            if (this.ajaxRequest.overrideMimeType) {
                this.ajaxRequest.overrideMimeType('application/json');
            }

            if (headers) {
                for (var header in headers) {
                    if (headers.hasOwnProperty(header)) {
                        this.ajaxRequest.setRequestHeader(header, headers[header]);
                    }
                }
            }

            this.ajaxRequest.send(params);
        },

        _formatQuery: function (data) {
            var params = "";
            var sep = "";
            for (var field in data) {
                if (data.hasOwnProperty(field)) {
                    params += sep + field + "=" + data[field];
                    sep = "&";
                }
            }
            return params;
        }

    };


    return REST;
});