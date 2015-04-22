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

        function lookup(key, locale, getArray) {
            var i = 0,
                kf = key.split("."),
                s = _strings[locale];

            while (s && typeof s === "object") {
                if(getArray && Object.prototype.toString.call( s[kf[i]] ) === '[object Array]') {
                    return s[kf[i]];
                }
                s = s[kf[i++]];
            }

            return s;
        }

        var StringManager = function (key, args, getArray) {

            getArray = !!getArray;

            var s = lookup(key, _locale, getArray) || lookup(key, "en", getArray);

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
            _.merge(_strings, s);
        };

        return StringManager;
    });
