/**
 * Created with IntelliJ IDEA.
 * User: craig
 * Date: 5/25/13
 * Time: 12:45 PM
 * To change this template use File | Settings | File Templates.
 */
define(['absolute/storagemanager'], function (StorageManager) {

    var GameConfig = {

        defaults: {},

        options: {},

        reset: function () {
            this.options = this.defaults;
            this.save();
        },

        load: function (defaultConfig) {
            this.defaults = defaultConfig;
            this.options = StorageManager.fetch("options") || this.defaults;

            if (!this.options.version || this.options.version < this.defaults.version) {
                for (var i in this.defaults) {
                    if (this.defaults.hasOwnProperty(i) && !this.options.hasOwnProperty(i)) {
                        this.options[i] = this.defaults[i];
                    }
                }
            }
        },

        save: function () {
            StorageManager.store("options", this.options);
        },

        setVal: function (name, val) {
            this.options[name] = val;
            this.save();
        },

        getVal: function (name) {
            return this.options[name];
        }
    };

    return GameConfig;
});