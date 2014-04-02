/**
 * User: craig
 * Date: 3/25/14
 * Time: 4:13 PM
 * Copyright (c) 2014 Absolute Hero, Inc.
 */
define (['absolute/rest'], function (REST) {

    var UserData = {

        _userData: {
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
                user_id: "",
                abgroup: "",
                last_won_level: null,
                is_guest: true,
                game_id: null,
                global_userData: ""
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

        _gameData: {

        },

        server: 'http://social-dev.spilgames.com',

        userId: 'test' + (1000000 * Math.random()).toFixed(),

        gameId: 1,

        isGuest: 1,

        userFirstName: "Guest",

        userGender: "",

        userImageUrl: "",

        currentLevel: 0,

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

                    if (data.scores) {
                        this._userData.scores = data.scores;
                    }

                    if (data.state) {
                        this._userData.state = data.state;
                    }

                    if (data.items) {
                        this._userData.items = data.items;
                    }

                    if (data.currencies) {
                        this._userData.currencies = data.currencies;
                    }

                    // 'http://social-dev.spilgames.com/api/game_config/user/test/game/1/'
                    REST.get(this._restUrl('game_config', {}),
                        function (data) {
                            console.log(data);
                            callback(true);
                        },
                        function (response) {
                            console.log('error on game_config:' + response.message);
                            callback(false);
                        }
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
                // TODO temp until we get working keys
                this._userData.state.last_won_level = this.currentLevel;
                // 'http://social-dev.spilgames.com/api/end_level/user/test/game/1/score/' + score + '/',
                REST.post(this._restUrl('end_level', { score: score }),
                    function (data) {
                        console.log(data);
                        this._updateLocalUserData(data);
                        callback(true);
                    }.bind(this),
                    function (response) {


                        console.log('error on end_level: ' + response.message);
                        callback(false);
                    }.bind(this)
                );
            }
        },

        buyItem: function (itemId, currencyId, callback) {

            // 'http://social-dev.spilgames.com/api/buy_item/user/test/game/1/item/' + itemId + '/currency/' + currencyId + '/',
            REST.post(this._restUrl('buy_item', { item: itemId, currency: currencyId }),
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

        useItem: function (itemId) {

        },

        isLevelLocked: function (level) {
            return level > this._userData.state.last_won_level || 0;
        },

        getNumKeys: function () {
            if (this._userData.items[1]) {
                return this._userData.items[1].amount;
            }
            return 0;
        },

        getLastLevelWon: function () {
            return this._userData.state.last_won_level || 0;
        },

        _updateLocalUserData: function (data) {
            if (data.items) {
                for (var i in data.items) {
                    if (data.items.hasOwnProperty(i)) {
                        if (data.items[i].item_id) {
                            this._userData.items[data.items[i].item_id] = data.items[i];
                        }
                    }
                }
            }
        }
    };

    return UserData;

});

