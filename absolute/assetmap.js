/**
 * User: craig
 * Date: 4/24/14
 * Time: 2:36 PM
 * Copyright (c) 2014 Absolute Hero, Inc.
 */
define([
    'lodash',
    'text!absolute/ui/assetmap.json'],
    function(
        _,
        assetMap) {

        var _assets = JSON.parse(assetMap);

        function lookup(key) {
            var i = 0,
                kf = key.split("."),
                a = _assets;

            while (a && typeof a === "object") {
                a = a[kf[i++]];
            }

            return a;
        }

        var AssetMap = function (key) {
            return lookup(key) || key;
        };

        AssetMap.load = function (assetJSON) {
            var a = JSON.parse(assetJSON);
            _.merge(_assets, a);
        };

        return AssetMap;
    });
