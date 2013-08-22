/*global require, define, test, expect, strictEqual, location */

if (typeof require === 'function' && require.config) {
    require.config({
        baseUrl: '../lib',
        paths: {
            //Path relative to baseUrl
            'absolute': '../absolute',
            'pixi': '../lib/pixi'
        }
    });

    //Override if in "dist" mode
    if (location.href.indexOf('-dist') !== -1) {
        //Set location of principium to the dist location
        require.config({
            paths: {
                'absolute': '../dist/absolute'
            }
        });
    }
}

(function (root, factory) {
    'use strict';

    if (typeof define === 'function' && define.amd) {
        // AMD.
        define(['pixi', 'absolute'], factory);
    } else {
        // Browser globals
        factory(root.PIXI, root.Absolute);
    }
}(this, function (principium, $) {
    'use strict';

    test('version test', function () {
        expect(1);
        strictEqual(absolute.version,
            '1.0',
            'Version concatenated');
    });

}));
