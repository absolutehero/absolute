/**
 *
 * This file is for setting integration shims in case whoever we're integrating with fails to respond.
 *
 */

define(['absolute/debug'],function(Debug) {

    var integration = {

        'spil': {

            'gameBreak': function(callback) {

                if(window.SpilGameAPIInstance && window.SpilGameAPIInstance.GameBreak) {

                    var safetyTimeout, callbackComplete = false;

                    function safetyCallback () {
                        if(!callbackComplete) {
                            callback.call(this);
                            callbackComplete = true;
                        }
                        window.clearTimeout(safetyTimeout);
                    }

                    window.SpilGameAPIInstance.GameBreak.request(
                        function () {},
                        safetyCallback.bind(this)
                    );

                    window.setTimeout(function(){

                        Debug.log('Spil api failure: gamebreak');
                        safetyCallback.call(this);

                    }.bind(this), 500);

                } else {

                    callback.call(this);

                }



            }
        }

    };

    return integration;

});
