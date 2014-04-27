/**
 * User: craig
 * Date: 4/25/14
 * Time: 2:19 PM
 * Copyright (c) 2014 Absolute Hero, Inc.
 */
define ([
    'lodash',
    'text!absolute/ui/strings.json'],
    function (
        _,
        stringsJSON) {

        var _strings = JSON.parse(stringsJSON);

        var _locale = "en";

        function lookup(key, locale) {
            var i = 0,
                kf = key.split("."),
                s = _strings[locale];

            while (s && typeof s === "object") {
                s = s[kf[i++]];
            }

            return s;
        }

        var StringManager = function (key, args) {

            var s = lookup(key, _locale) || lookup(key, "en");

            if (s && typeof s == "string" && s !== "" && args && args.length > 0) {
                for (var i = 0; i < args.length; i += 1) {
                    s = s.replace("%" + i, String(args[i]));
                }
            }
            return s || key;
        };


        StringManager.setLocale = function (locale) {
            _locale = locale;
        };

        StringManager.load = function (stringsJSON) {
            var s = JSON.parse(stringsJSON);
            _.extend(_strings, s);
        };

        return StringManager;
    });
