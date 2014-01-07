define(['pixi', 'absolute/button', 'absolute/togglebutton', 'absolute/debug', 'lodash'],

    function(PIXI, Button, ToggleButton, Debug, _) {

        var Dialog = function(options) {

            var defaultOptions = {
                width: '80%',
                height:'80%',
                name: 'default'

            };

            this._initDialog(_.extend(defaultOptions, options));
        };

//        Dialog.constructor = Dialog;
        Dialog.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);

        Dialog.prototype._initDialog = function(options) {

            this.options = options;

            PIXI.DisplayObjectContainer.call(this);

            console.log('dialog options = ', this.options);

        };

        Dialog.prototype.show = function() {
            console.log('show dialog ', this.options.name);
        }




        return Dialog;
    }
);