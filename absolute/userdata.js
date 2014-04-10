/**
 * User: craig
 * Date: 3/25/14
 * Time: 4:13 PM
 * Copyright (c) 2014 Absolute Hero, Inc.
 */
define (['absolute/rest'], function (REST) {

    var UserData = {

        _userData: null,

        _gameData: null,

        //server: http://social-dev.spilgames.com',

        server: 'http://absoluteherogames.com:7777',

        //server: 'http://localhost:7777',

        userId: 'test' + (1000000 * Math.random()).toFixed(),

        gameId: 1,

        isGuest: 1,

        userFirstName: "Guest",

        userGender: "",

        userImageUrl: "",

        currentLevel: 0,

        currencyId: 1,

        itemStringToIdMap: {
            "key": 1,
            "extraMoves": 2,
            "time": 3,
            "hammer": 4,
            "row": 5,
            "shuffle": 6,
            "color": 7
        },

        itemIdToStringMap: {
            "1": "key",
            "2": "extraMoves",
            "3": "time",
            "4": "hammer",
            "5": "row",
            "6": "shuffle",
            "7": "color"
        },

        _restUrl: function (message, params) {
            var url = this.server + '/api/' + message + '/user/' + this.userId + '/game/' + this.gameId;

            for (var p in params) {
                if (params.hasOwnProperty(p)) {
                    url += '/' + p + '/' + params[p];
                }
            }

            url += '/';

            return url;
        },

        init: function (gameId, callback) {
            this.gameId = gameId;

            // try to grab user data from Facebook
            if (typeof FB !== "undefined") {
                FB.getLoginStatus(function(response) {
                    if (response.status === 'connected') {
                        FB.api('/me', function(response) {
                            console.log('Good to see you, ' + response.name + '.');
                            this.userId = 'fb' + response.id;
                            this.isGuest = 0;
                            this.userFirstName = response.first_name;
                            this.userGender = response.gender;

                            FB.api('/me/picture?type=square&redirect=false', function (response) {
                                if (response.data) {
                                    this.userImageUrl = response.data.url;
                                    this._initSpilApi(callback);
                                }
                            }.bind(this));
                            //graph.facebook.com/craig.robinson/picture?type=squar
                        }.bind(this));
                    }
                    else {
                        // TODO grab user data from local storage?
                        this._initSpilApi(callback);
                    }
                }.bind(this));
            }
            else {
                // TODO grab user data from local storage?
                this._initSpilApi(callback);
            }
        },

        _initSpilApi: function (callback) {

            // 'http://social-dev.spilgames.com/api/init_user/user/test/game/1/guest/1/'
            REST.post(this._restUrl('init_user', { guest: this.isGuest }),
                function (data) {
                    console.log(data);

                    this._userData = data;

                    // 'http://social-dev.spilgames.com/api/game_config/user/test/game/1/'
                    REST.get(this._restUrl('game_config', {}),
                        function (data) {
                            console.log(data);

                            this._gameData = data;
                            callback(true);
                        }.bind(this),
                        function (response) {
                            console.log('error on game_config:' + response.message);
                            callback(false);
                        }.bind(this)
                    );

                }.bind(this),
                function (response) {
                    console.log('error on init_user: ' + response.message);
                    callback(false);
                }.bind(this)
            );

        },

        startLevel: function (level, callback) {
            this.currentLevel = level;

            // 'http://social-dev.spilgames.com/api/start_level/user/test/game/1/level/' + level + '/'
            REST.post(this._restUrl('start_level', { level: level }),
                function (data) {
                    console.log(data);
                    this._updateLocalUserData(data);
                    callback(true);
                }.bind(this),
                function (response) {
                    console.log('error on start_level: ' + response.message  );
                    callback(false);
                }.bind(this)
            );

        },

        endLevel: function (score, callback) {
            if (this.currentLevel > 0) {

                // 'http://social-dev.spilgames.com/api/end_level/user/test/game/1/score/' + score + '/',
                REST.post(this._restUrl('end_level', { score: score }),
                    function (data) {
                        console.log(data);
                        this._updateLocalUserData(data);
                        console.log("this._userData ");
                        console.log(this._userData);

                        this._updateLastLevelWon();

                        callback(true);
                    }.bind(this),
                    function (response) {
                        console.log('error on end_level: ' + response.message);
                        callback(false);
                    }.bind(this)
                );
            }
        },

        buyItem: function (itemId, callback) {

            if (typeof itemId === "string") {
                itemId = this._itemIdFromString(itemId);
            }

            REST.post(this._restUrl('buy_item', { item: itemId, currency: this.currencyId }),
                function (data) {
                    console.log(data);
                    this._updateLocalUserData(data);
                    callback(true);
                }.bind(this),
                function (response) {
                    console.log('error on buy_item: ' + response.message);
                    callback(false);
                }.bind(this)
            );

        },

        useItem: function (itemId, callback) {
            if (typeof itemId === "string") {
                itemId = this._itemIdFromString(itemId);
            }


            REST.post(this._restUrl('use_item', { item: itemId, currency: this.currencyId }),
                function (data) {
                    console.log(data);
                    this._updateLocalUserData(data);
                    callback(true);
                }.bind(this),
                function (response) {
                    console.log('error on use_item: ' + response.message);
                    callback(false);
                }.bind(this)
            );

        },

        getItemBalance: function (itemId) {
            if (typeof itemId === "string") {
                itemId = this._itemIdFromString(itemId);
            }

            return this._userData.items[itemId].amount;
        },

        hasMaxItems: function (itemId) {
            return this._userData.items[itemId].amount = this._gameData.items[itemId].max_amount;
        },

        buyCurrency: function (amount, callback) {
            REST.post(this._restUrl('buy_currency', { currency: this.currencyId, amount: amount }),
                function (data) {
                    console.log(data);
                    this._updateLocalUserData(data);
                    callback(true);
                }.bind(this),
                function (response) {
                    console.log('error on buy_currency: ' + response.message);
                    callback(false);
                }.bind(this)
            );
        },

        getCurrencyBalance: function () {
            return this._userData.currencies[this.currencyId].amount
        },

        isLevelLocked: function (level) {
            return level > this._userData.state.last_won_level || 0;
        },

        getLevelStars: function (level) {
            for (var l in this._userData.scores) {
                if (this._userData.scores.hasOwnProperty(l)) {
                    if (this._userData.scores[l].level_id === level) {
                        return this._userData.scores[l].stars;
                    }
                }
            }
            return 0;
        },

        getNumKeys: function () {
            if (this._userData.items[1]) {
                return this._userData.items[1].amount;
            }
            return 0;
        },

        getLastLevelWon: function () {
            if (this._userData.state.last_won_level) {
                return this._userData.state.last_won_level;
            }
            return 0;
        },

        getStarGoals: function (levelId) {
            if (this._gameData.levels[levelId] && this._gameData.levels[levelId].stars) {
                var stars = this._gameData.levels[levelId].stars;
                return [stars["0"].score, stars["1"].score, stars["2"].score]
            }

            throw("Level " + levelId + "has no star goals configured");
            // default for levels not configured -- should never happen
            return [100, 200, 300];
        },

        getStarTotal: function () {
            var total = 0;
            for (var i in this._userData.scores) {
                if (this._userData.scores.hasOwnProperty(i)) {
                    total += this._userData.scores[i].stars;
                }
            }

            return total;
        },

        getNextBoosterAward: function () {
            var currentStars = this.getStarTotal();

            for (var i in this._gameData.grant_at_star_total) {
                var st = this._gameData.grant_at_star_total[i];

                if (st.stars > currentStars) {
                    return {
                        stars: st.stars,
                        booster: this.itemIdToStringMap[st.item_id]
                    }
                }
            }

            return {stars: 0, booster: null};
        },

        getItemForStarTotal: function (stars) {

        },

        getStarTotalForItem: function (item) {

        },

        getNextEarnableItem: function (stars) {

        },

        _updateLocalUserData: function (data) {
            var i;

            if (data.items) {
                for (i in data.items) {
                    if (data.items.hasOwnProperty(i)) {
                        this._userData.items[i] = data.items[i];
                    }
                }
            }

            if (data.scores) {
                for (i in data.scores) {
                    if (data.scores.hasOwnProperty(i)) {
                        this._userData.scores[i] = data.scores[i];
                    }
                }
            }

            if (data.currencies) {
                for (i in data.currencies) {
                    if (data.currencies.hasOwnProperty(i)) {
                        this._userData.currencies[i] = data.currencies[i];
                    }
                }
            }

            if (data.state) {
                for (i in data.state) {
                    if (data.state.hasOwnProperty(i)) {
                        this._userData.state[i] = data.state[i];
                    }
                }
            }
        },

        _updateLocalGameData: function (data) {
            var i;

            if (data.items) {
                for (i in data.items) {
                    if (data.items.hasOwnProperty(i)) {
                        this._gameData.items[i] = data.items[i];
                    }
                }
            }

            if (data.grant_at_star_total) {
                for (i in data.grant_at_star_total) {
                    if (data.grant_at_star_total.hasOwnProperty(i)) {
                        this._gameData.grant_at_star_total[i] = data.grant_at_star_total[i];
                    }
                }
            }

            if (data.currencies) {
                for (i in data.currencies) {
                    if (data.currencies.hasOwnProperty(i)) {
                        this._gameData.currencies[i] = data.currencies[i];
                    }
                }
            }

            if (data.levels) {
                for (i in data.levels) {
                    if (data.levels.hasOwnProperty(i)) {
                        this._gameData.levels[i] = data.levels[i];
                    }
                }
            }
        },

        _updateLastLevelWon: function () {
            var last_won_level = 0;
            for (var i in this._userData.scores) {
                if (this._userData.scores.hasOwnProperty(i)) {
                    if (this._userData.scores[i].stars > 0) {
                        last_won_level = this._userData.scores[i].level_id;
                    }
                }
            }
            this._userData.state.last_won_level = last_won_level;
        },

        _itemIdFromString: function (itemName) {
            if (this.itemStringToIdMap.hasOwnProperty(itemName.toLowerCase())) {
                return this.itemStringToIdMap[itemName.toLowerCase()];
            }

            return 0;
        },

        _dump: function () {
            var out = {};

            out.games = {};

            out.games[1] = {};

            out.games[1].game_config = this._gameData;

            out.games[1].users = {};

            out.games[1].users[this.userId] = this._userData;

            //console.log(JSON.stringify(out, null, 4));
        }


    };

    return UserData;

});

