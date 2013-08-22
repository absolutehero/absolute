/**
 * Created with IntelliJ IDEA.
 * User: craig
 * Date: 5/25/13
 * Time: 12:28 PM
 * To change this template use File | Settings | File Templates.
 */
define (['absolute/debug'], function(Debug) {

    var StorageManager = {

        prefix: null,

        store: function (key, value) {
            if (!this.prefix) {
                throw("Error: you must set StorageManager.prefix for this game!");
            }
            else {
                try {
                    localStorage[this.prefix + key] = JSON.stringify(value);
                }
                catch (e) {
                    Debug.log('error creating local storage ' + e);
                }
            }
        },

        fetch: function (key) {
            if (!this.prefix) {
                throw("Error: you must set StorageManager.prefix for this game!");
            }
            else {
                try {
                    var value = localStorage[this.prefix + key];
                    if (value) {
                        return JSON.parse(value);
                    }
                }
                catch (e) {
                    Debug.log('error accessing local storage ' + e);
                }
            }
            return null;
        }
    };

    return StorageManager;
});