/**
 * User: craig
 * Date: 4/24/14
 * Time: 2:36 PM
 * Copyright (c) 2014 Absolute Hero, Inc.
 */
define(['lodash', 'text!absolute/ui/assetmap.json'], function(_, assetMap) {

    var _map = JSON.parse(assetMap);

    return {
        load: function (jsonMap) {
            var m = JSON.parse(jsonMap);
            _.merge(_map, m);
        },

        lookup: function (key) {
            return _map[key];
        }
    }
});
