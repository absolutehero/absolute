/**
 * User: craig
 * Date: 4/24/14
 * Time: 1:45 PM
 * Copyright (c) 2014 Absolute Hero, Inc.
 */
define ([
    'pixi',
    'lodash',
    'absolute/assetmap',
    'absolute/stringmanager',
    'absolute/coords',
    'absolute/screenmetrics',
    'absolute/progressbar',
    'absolute/nineslice',
    'text!absolute/ui/layout.json'],
    function (
        PIXI,
        _,
        _a,
        _s,
        Coords,
        ScreenMetrics,
        ProgressBar,
        NineSlice,
        layoutJSON) {

    var _layouts = JSON.parse(layoutJSON);

    return {

        load: function (layoutJSON) {
            var l = JSON.parse(layoutJSON);
            _.merge(_layouts, l);
        },

        findWidget: function (key, l) {
            var widget = null;

            for (var w in l.widgets) {
                if (l.widgets.hasOwnProperty(w)) {
                    if (w == key) {
                        widget = l.widgets[w];
                    }
                    else {
                        widget = this.findWidget(key, l.widgets[w]);
                    }
                }
                if (widget) {
                    return widget;
                }
            }
            return null;
        },

        buildLayout: function (config, parent) {
            var widget = null,
                self = this;

            if (typeof config == "string") {
                config = _layouts[config];
            }

            switch (config.type) {
                case "ProgressBar":
                    this.checkParams({"frame": "string", "fill": "string"}, config.params);
                    widget = new ProgressBar(
                        PIXI.Texture.fromFrame(_a(config.params.frame)),
                        PIXI.Texture.fromFrame(_a(config.params.fill))
                    );
                    break;

                case "Text":
                    this.checkParams({"text": "string", "fontSize": "number", "fontFamily": "string", "fill": "string", "align": "string"}, config.params);
                    widget = new PIXI.Text(_s(config.params.text), {font: (Math.floor(config.params.fontSize * ScreenMetrics.getResScale())) + "px " + config.params.fontFamily, fill: config.params.fill, align: config.params.align});
                    widget._setText = widget.setText;
                    widget.setText = function (text) {
                        this._setText(text);
                        this.updateText();
                        self.positionWidget(this, config, this.parent);
                    };
                    break;

                case "BitmapText":
                    this.checkParams({"text": "string", "fontSize": "number", "fontFamily": "string"}, config.params);
                    widget = new PIXI.BitmapText(_s(config.params.text), {font: (Math.floor(config.params.fontSize * ScreenMetrics.getResScale())) + "px " + config.params.fontFamily});
                    widget.width = widget.textWidth;
                    widget.height = widget.textHeight;
                    widget._setText = widget.setText;
                    widget.setText = function (text) {
                        this._setText(text);
                        this.updateText();
                        widget.width = widget.textWidth;
                        widget.height = widget.textHeight;
                        self.positionWidget(this, config, this.parent);
                    };
                    break;

                case "Sprite":
                    this.checkParams({"texture": "string"}, config.params);
                    widget = PIXI.Sprite.fromFrame(_a(config.params.texture));
                    break;

                case "Container":
                    widget = new PIXI.DisplayObjectContainer();
                    widget.width = parent.width;
                    widget.height = parent.height;
                    break;

                case "NineSlice":
                    this.checkParams({"width": "number", "height": "number", "imageBase": "string"}, config.params);
                    var options = {
                        width: Coords.x(config.params.width),
                        height: Coords.y(config.params.height),
                        images: {
                            'topLeft':_a(config.params.imageBase + '.topLeft'),
                            'topCenter': _a(config.params.imageBase + '.topCenter'),
                            'topRight': _a(config.params.imageBase + '.topRight'),
                            'middleLeft': _a(config.params.imageBase + '.middleLeft'),
                            'middleCenter': _a(config.params.imageBase + '.middleCenter'),
                            'middleRight': _a(config.params.imageBase + '.middleRight'),
                            'bottomLeft': _a(config.params.imageBase + '.bottomLeft'),
                            'bottomCenter': _a(config.params.imageBase + '.bottomCenter'),
                            'bottomRight': _a(config.params.imageBase + '.bottomRight')
                        }
                    };
                    widget = new NineSlice(options);
                    break;
            }

            if (widget) {
                // add children if appropriate
                if (widget instanceof PIXI.DisplayObjectContainer && config.children) {
                    widget.widgets = [];
                    for (var c in config.children) {
                        if (config.children.hasOwnProperty(c)) {
                            widget.widgets[c] = this.buildLayout(config.children[c], widget);
                            widget.addChild(widget.widgets[c]);
                        }
                    }
                }

                this.anchorWidget(widget, config);
                this.scaleWidget(widget, config);
                this.positionWidget(widget, config, parent);
            }

            return widget;
        },

        checkParams: function (template, params) {
            for (var t in template) {
                if (template.hasOwnProperty(t)) {
                    if (!params || (!params[t] && params[t] !== "")) {
                        throw("Error: missing required parameter: " + t);
                    }
                    else if (typeof params[t] !== template[t]) {
                        throw("Error: parameter '" + t + "' must be of type " + template[t]);
                    }
                }
            }
        },

        anchorWidget: function (widget, config) {
            if (config.anchor) {
                if (config.anchor.x) {
                    widget.anchor.x = config.anchor.x;
                }
                if (config.anchor.y) {
                    widget.anchor.y = config.anchor.y;
                }
            }
        },

        scaleWidget: function (widget, config) {
            if (config.scale) {
                if (config.scale.x) {
                    widget.scale.x = config.scale.x;
                }
                if (config.scale.y) {
                    widget.scale.y = config.scale.y;
                }
            }
        },

        positionWidget: function (widget, config, parent) {
            var a, p;

            if (config.position) {
                if (typeof config.position.x == "string") {

                    if (!parent || !parent.width) {
                        throw("Error: relative position used but parent width not set!");
                    }

                    if (config.position.x.indexOf('%') !== -1) {
                        a = config.position.x.split('%');
                        p = parseInt(a[0]) / 100;
                        widget.position.x = parent.width * p;
                    }
                    else {
                        switch (config.position.x) {
                            case "left":
                                widget.position.x = 0;
                                break;
                            case "right":
                                widget.position.x = parent.width - widget.width;
                                break;
                            case "center":
                                widget.position.x = (parent.width - widget.width) / 2;
                                break;
                        }
                    }
                }
                else  if (typeof config.position.x == "number") {
                    widget.position.x = Coords.x(config.position.x);
                }

                if (typeof config.position.y == "string") {

                    if (!parent || !parent.height) {
                        throw("Error: relative position used but parent height not set!");
                    }

                    if (config.position.y.indexOf('%') !== -1) {
                        a = config.position.y.split('%');
                        p = parseInt(a[0]) / 100;
                        widget.position.y = parent.height * p;
                    }
                    else {
                        switch (config.position.y) {
                            case "top":
                                widget.position.y = 0;
                                break;
                            case "bottom":
                                widget.position.y = parent.height - widget.height;
                                break;
                            case "middle":
                                widget.position.y = (parent.height - widget.height) / 2;
                                break;
                        }
                    }
                }
                else  if (typeof config.position.y == "number") {
                    widget.position.y = Coords.y(config.position.y);
                }
            }
        }

    }
});
