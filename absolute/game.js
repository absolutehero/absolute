/**
 * User: craig
 * Date: 3/16/13
 * Time: 10:42 PM
 * Copyright (c) 2013 Absolute Hero Games LLC
 */
define(
[
    'absolute/storagemanager',
    'absolute/gameconfig'
],
function (
    StorageManager,
    GameConfig)
{
    var Game = function(name, defaultConfig) {
        this._initGame(name, defaultConfig);
    };

    Game.prototype._initGame =  function(name, defaultConfig) {
        StorageManager.prefix = name + "_";
        GameConfig.load(defaultConfig);

        this.ui = null;
        this.initVisibilityChangeHandlers();
    };

    Game.prototype.start = function() {

    };

    Game.prototype.initVisibilityChangeHandlers = function () {
        if ('hidden' in document) {
            document.addEventListener("visibilitychange", function () {
                Absolute.Debug.log('visibilitychange');
                this.handleVisibilityChange(document.hidden);
            }.bind(this), false);
        }
        else if ('mozHidden' in document) {
            document.addEventListener("mozvisibilitychange", function () {
                Absolute.Debug.log('mozvisibilitychange');
                this.handleVisibilityChange(document.mozHidden);
            }.bind(this), false);
        }
        else if ('webkitHidden' in document) {
            document.addEventListener("webkitvisibilitychange", function () {
                Absolute.Debug.log('webkitvisibilitychange');
                this.handleVisibilityChange(document.webkitHidden);
            }.bind(this), false);
        }
        else if ('msHidden' in document) {
            document.addEventListener("msvisibilitychange", function () {
                Absolute.Debug.log('msvisibilitychange');
                this.handleVisibilityChange(document.msHidden);
            }.bind(this), false);
        }
        else if ('onpagehide' in window) {
            window.addEventListener('pagehide', function() {
                Absolute.Debug.log('pagehide');
                this.handleVisibilityChange(true);
            }.bind(this), false);

            window.addEventListener('pageshow', function() {
                Absolute.Debug.log('pageshow');
                this.handleVisibilityChange(false);
            }.bind(this), false);
        }

        if ('onblur' in document) {
            window.addEventListener('blur', function() {
                Absolute.Debug.log('blur');
                this.handleVisibilityChange(true);
            }.bind(this), false);

            window.addEventListener('focus', function() {
                Absolute.Debug.log('focus');
                this.handleVisibilityChange(false);
            }.bind(this), false);
            visHandled = true;
        }

        if ('onfocusout' in document) {
            window.addEventListener('focusout', function() {
                Absolute.Debug.log('onfocusout');
                this.handleVisibilityChange(true);
            }.bind(this), false);

            window.addEventListener('focusin', function() {
                Absolute.Debug.log('onfocusin');
                this.handleVisibilityChange(false);
            }.bind(this), false);

        }
    };

    Game.prototype.handleVisibilityChange = function (hidden) {

    };

    Game.prototype.load = function(assets, onLoadProgress, onLoadComplete) {
        this.ui.load(assets, onLoadProgress, onLoadComplete);
    };

    return Game;
});

