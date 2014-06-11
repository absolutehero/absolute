/**
 *
 * This file is for setting integration shims in case whoever we're integrating with fails to respond.
 *
 */

define(['absolute/debug','absolute/gameconfig'],function(Debug, GameConfig) {

    var integration = {

        'spil': {

            'gameBreak': function(resumeCallback, pauseCallback) {

                if(window.SpilGameAPIInstance && !window.SpilGameAPIInstance.IS_STANDALONE && window.SpilGameAPIInstance.GameBreak) {

                    var safetyTimeout, callbackComplete = false;

                    function safetyCallback () {
                        if(!callbackComplete) {
                            resumeCallback.call(this);
                            callbackComplete = true;
                        }
                        window.clearTimeout(safetyTimeout);
                    }

                    window.SpilGameAPIInstance.GameBreak.request(
                        pauseCallback.bind(this),
                        safetyCallback.bind(this)
                    );

                    window.setTimeout(function(){

                        Debug.log('ahg: Spil api failure: gamebreak');
                        safetyCallback.call(this);

                    }.bind(this), 10000);

                } else {

                    resumeCallback.call(this);

                }



            }
        },
        'iwin': {

            ready: function(callback) {

                if(window.iConsole) {
                    window.iConsole.game.ready().result( function() {
                        callback.call(this);
                    });
                } else {
                    Debug.log('ahg: iWin api not available game ready failed.');
                }

            },
            loadProgress: function(progress) {

                if(window.iConsole) {
                    window.iConsole.game.loadProgress({
                        'progress': progress,
                        'file': 'ahg: file name not available.'
                    });
                } else {
                    Debug.log('ahg: iWin api not available loadProgress failed.');
                }

            },
            loaded: function(success, failOverCallback) {
                if(window.iConsole) {
                    window.iConsole.game.loaded({
                        'success': success
                    });
                } else {
                    Debug.log('ahg: iWin api not available loaded failed.');
                    failOverCallback.call(this);
                }
            },
            levelStarted: function(level, callback) {

                if(window.iConsole) {
                    window.iConsole.game.levelStarted({
                        'level': level
                    }).result(function (levelData) {
                        callback.call(this, levelData);
                    }.bind(this));
                } else {
                    callback.call(this);
                }

            },
            levelFinished: function(callback, level, score, time, won, data) {

                if(window.iConsole) {

                    window.iConsole.game.levelFinished({
                        level: level,
                        score: score,
                        time: time,
                        won: won,
                        data: data || {}
                    }).result(function () {
                        callback.call(this);
                    });

                } else {
                    callback.call(this);
                }
            },
            getGameData: function(callback, localStorageKey) {

                if(window.iConsole) {
                    window.iConsole.game.getGameData().result(
                        function(resultData) {
                            var storedData = {};
                            if(typeof resultData !== 'undefined' && resultData !== null && resultData !== '') {
                                try {
                                    storedData = JSON.parse(resultData);
                                } catch(e) {}
                            } else {
                                storedData.data = {};
                            }

                            callback.call(this,storedData.data);
                        }.bind(this)
                    );
                } else {

                    callback.call(this, GameConfig.getVal(localStorageKey));

                }

            },
            setGameData: function(data, localStorageKey) {

                if(window.iConsole) {
                    window.iConsole.game.setGameData({'data':data});
                } else {
                    GameConfig.setVal(localStorageKey, data);
                }

            }


        }

    };

    return integration;

});
