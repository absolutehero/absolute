/**
 * User: craig
 * Date: 12/5/13
 * Time: 9:58 AM
 * Copyright (c) 2013 Absolute Hero Games LLC
 */

define(function () {

    var Analytics = {

        init: function (config) {
            this.useFlurry = false;

            if (typeof FlurryAgent !== "undefined") {
                FlurryAgent.startSession(config.flurry.apiKey);
                this.useFlurry = true;
            }
        },

        setGameVersion: function (versionString) {
            if (this.useFlurry) {
                FlurryAgent.setAppVersion(versionString);
            }
        },

        logEvent: function (eventName, eventParameters, isTimed) {
            eventParameters = eventParameters || {};
            isTimed = !!isTimed;
            if (this.useFlurry) {
                FlurryAgent.logEvent(eventName, eventParameters, isTimed);
            }
        },

        endTimedEvent: function (eventName) {
            if (this.useFlurry) {
                FlurryAgent.endTimedEvent(eventName);
            }
        }

    };

    return Analytics;
});