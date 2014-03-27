/**
 * User: craig
 * Date: 3/25/14
 * Time: 4:13 PM
 * Copyright (c) 2014 Absolute Hero, Inc.
 */
define (function () {

    var UserData = {

        _data: {
            /**
             * Items:
             "1": {
                "item_id": 1,
                "item_name": "Key",
                "amount": 0
            }
             */
            items: {},

            /**
             * State
             */
            state: {
                highest_level_achieved: null,
                user_id: "",
                abgroup: "",
                last_level_started: null,
                last_level_won: null,
                is_guest: true,
                game_id: null,
                global_data: ""
            },

            /**
             * Currencies
             "1": {
                 "currency_id": 1,
                 "amount": 87800,
                 "name": "test coins"
             }
             */
            currencies: {

            },

            /**
             * Scores
             "1": {
                 "level_id": 1,
                 "score": 100,
                 "user_id": "test",
                 "stars": 2
             }
             */
            scores: {

            }
        },

        currentLevel: 0,

        initFromServer: function (callback) {
            // TODO temp data
            this._data.highest_level_achieved = 2;
            this._data.last_level_started = 1;
            this._data.last_level_won = 1;
            this._data.scores["1"] = { level_id: 1, score: 1000, stars: 2};

            callback();
        },

        startLevel: function (level) {
            this.currentLevel = level;
        },

        endLevel: function (score) {
            if (this.currentLevel > 0) {
                this._data.scores[this.currentLevel] = { score: score };
            }
        },

        buyItem: function (itemId, currencyId) {

        },

        useItem: function (itemId) {

        },

        isLevelLocked: function (level) {
            return level > this._data.highest_level_achieved;
        },

        highestLevelAchieved: function () {
            return this._data.highest_level_achieved;
        },

        lastLevelStarted: function () {
            return this._data.last_level_started;
        },

        lastLevelWon: function () {
            return this._data.last_level_won;
        }
    };

    return UserData;

});

