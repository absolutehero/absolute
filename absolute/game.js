/**
 * User: craig
 * Date: 3/16/13
 * Time: 10:42 PM
 * Copyright (c) 2013 Absolute Hero Games LLC
 */
define(
[
    'absolute/storagemanager',
    'absolute/gameconfig',
    'absolute/analytics',
    'absolute/debug'
],
function (
    StorageManager,
    GameConfig,
    Analytics,
    Debug)
{
    var Game = function(name, defaultConfig) {
        this._initGame(name, defaultConfig);
    };

    Game.prototype._initGame =  function(name, defaultConfig) {
        StorageManager.prefix = name + "_";
        GameConfig.load(defaultConfig);
        Analytics.init(defaultConfig.config.analytics);
        Analytics.setGameVersion(defaultConfig.versionString);
        this.ui = null;
        this.config = defaultConfig.config;
        this.initVisibilityChangeHandlers();
    };

    Game.prototype.start = function() {

    };

    Game.prototype.initVisibilityChangeHandlers = function () {
        if ('hidden' in document) {
            document.addEventListener("visibilitychange", function () {
                Debug.log('visibilitychange');
                this.handleVisibilityChange(document.hidden);
            }.bind(this), false);
        }
        else if ('mozHidden' in document) {
            document.addEventListener("mozvisibilitychange", function () {
                Debug.log('mozvisibilitychange');
                this.handleVisibilityChange(document.mozHidden);
            }.bind(this), false);
        }
        else if ('webkitHidden' in document) {
            document.addEventListener("webkitvisibilitychange", function () {
                Debug.log('webkitvisibilitychange');
                this.handleVisibilityChange(document.webkitHidden);
            }.bind(this), false);
        }
        else if ('msHidden' in document) {
            document.addEventListener("msvisibilitychange", function () {
                Debug.log('msvisibilitychange');
                this.handleVisibilityChange(document.msHidden);
            }.bind(this), false);
        }
        else if ('onpagehide' in window) {
            window.addEventListener('pagehide', function() {
                Debug.log('pagehide');
                this.handleVisibilityChange(true);
            }.bind(this), false);

            window.addEventListener('pageshow', function() {
                Debug.log('pageshow');
                this.handleVisibilityChange(false);
            }.bind(this), false);
        }

        if ('onblur' in document) {
            window.addEventListener('blur', function() {
                Debug.log('blur');
                this.handleVisibilityChange(true);
            }.bind(this), false);

            window.addEventListener('focus', function() {
                Debug.log('focus');
                this.handleVisibilityChange(false);
            }.bind(this), false);
            visHandled = true;
        }

        if ('onfocusout' in document) {
            window.addEventListener('focusout', function() {
                Debug.log('onfocusout');
                this.handleVisibilityChange(true);
            }.bind(this), false);

            window.addEventListener('focusin', function() {
                Debug.log('onfocusin');
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

