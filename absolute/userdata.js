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
            items: {
                "1": {
                    "item_id": 1,
                    "item_name": "Key",
                    "amount": 5
                },
                "2": {
                    "item_id": 2,
                    "item_name": "extramoves",
                    "amount": 0
                },
                "3": {
                    "item_id": 3,
                    "item_name": "time",
                    "amount": 0
                },
                "4": {
                    "item_id": 4,
                    "item_name": "hammer",
                    "amount": 0
                },
                "5": {
                    "item_id": 5,
                    "item_name": "row",
                    "amount": 0
                },
                "6": {
                    "item_id": 6,
                    "item_name": "shuffle",
                    "amount": 0
                },
                "7": {
                    "item_id": 7,
                    "item_name": "color",
                    "amount": 0
                }
            },


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
                "1": {
                    "currency_id": 1,
                    "amount": 99999,
                    "name": "test coins"
                }
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

            "currencies": {},

            "grant_at_star_total": {},

            "levels": {},

            "items": {
                "1": {
                    buyable: true,
                    gift_amount: 1,
                    giftable: true,
                    granted_randomly: false,
                    initial_value: 5,
                    item_id: 1,
                    item_name: "Key",
                    max_amount: 5,
                    min_amount: 0,
                    regeneration_time: 0,
                    requestable: true,
                    cost: 100
                },
                "2": {
                    buyable: true,
                    gift_amount: 1,
                    giftable: true,
                    granted_randomly: false,
                    initial_value: 5,
                    item_id: 1,
                    item_name: "extramoves",
                    max_amount: 5,
                    min_amount: 0,
                    regeneration_time: 0,
                    requestable: true,
                    cost: 100
                },
                "3": {
                    buyable: true,
                    gift_amount: 1,
                    giftable: true,
                    granted_randomly: false,
                    initial_value: 0,
                    item_id: 1,
                    item_name: "time",
                    max_amount: 5,
                    min_amount: 0,
                    regeneration_time: 0,
                    requestable: true,
                    cost: 100
                },
                "4": {
                    buyable: true,
                    gift_amount: 1,
                    giftable: true,
                    granted_randomly: false,
                    initial_value: 0,
                    item_id: 1,
                    item_name: "hammer",
                    max_amount: 5,
                    min_amount: 0,
                    regeneration_time: 0,
                    requestable: true,
                    cost: 100
                },
                "5": {
                    buyable: true,
                    gift_amount: 1,
                    giftable: true,
                    granted_randomly: false,
                    initial_value: 0,
                    item_id: 1,
                    item_name: "row",
                    max_amount: 5,
                    min_amount: 0,
                    regeneration_time: 0,
                    requestable: true,
                    cost: 100
                },
                "6": {
                    buyable: true,
                    gift_amount: 1,
                    giftable: true,
                    granted_randomly: false,
                    initial_value: 0,
                    item_id: 1,
                    item_name: "shuffle",
                    max_amount: 5,
                    min_amount: 0,
                    regeneration_time: 0,
                    requestable: true,
                    cost: 100
                },
                "7": {
                    buyable: true,
                    gift_amount: 1,
                    giftable: true,
                    granted_randomly: false,
                    initial_value: 0,
                    item_id: 1,
                    item_name: "color",
                    max_amount: 5,
                    min_amount: 0,
                    regeneration_time: 0,
                    requestable: true,
                    cost: 100
                }
            }
        },

        server: 'http://social-dev.spilgames.com',

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
            "extramoves": 2,
            "time": 3,
            "hammer": 4,
            "row": 5,
            "shuffle": 6,
            "color": 7
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

                    this._updateLocalUserData(data);

                    // XXXCBR grant us some test currency
                    this._userData.currencies[this.currencyId].amount = 1000;

                    // 'http://social-dev.spilgames.com/api/game_config/user/test/game/1/'
                    REST.get(this._restUrl('game_config', {}),
                        function (data) {
                            console.log(data);
                            this._updateLocalGameData(data);
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

        buyItem: function (itemId, callback) {

            if (typeof itemId === "string") {
                itemId = this._itemIdFromString(itemId);
            }

            // XXXCBR: temporarily fake purchases for items other than keys until
            // Spil gives us access to the admin tool to config new items
            if (itemId > 1) {
                if (this.getCurrencyBalance() >= this._gameData.items[itemId].cost) {
                    this._userData.currencies[this.currencyId].amount -= this._gameData.items[itemId].cost;
                    this._userData.items[itemId].amount++;
                    callback(true);
                }
                else {
                    callback(false);
                }
                return;
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

            // XXXCBR: temporarily fake usage for items other than keys until
            // Spil gives us access to the admin tool to config new items
            if (itemId > 1) {
                if (this._userData.items[itemId].amount > 0) {
                    this._userData.items[itemId].amount--;
                    callback(true);
                }
                else {
                    callback(false);
                }
                return;
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

        buyCurrency: function (amount) {
            // XXXCBR temporarily fake currency purchase until we have API from Spil
            this._userData.currencies[this.currencyId].amount += amount;
        },

        getCurrencyBalance: function () {
            return this._userData.currencies[this.currencyId].amount
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

        _itemIdFromString: function (itemName) {
            if (this.itemStringToIdMap.hasOwnProperty(itemName.toLowerCase())) {
                return this.itemStringToIdMap[itemName.toLowerCase()];
            }

            return 0;
        }
    };

    return UserData;

});

