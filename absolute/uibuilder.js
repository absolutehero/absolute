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
    'absolute/animatedbutton',
    'absolute/animatedtextbutton',
    'absolute/togglebutton',
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
        AnimatedButton,
        AnimatedTextButton,
        ToggleButton,
        layoutJSON) {

    var _layouts = JSON.parse(layoutJSON);

    return {

        load: function (layoutJSON) {
            try {
                var l = JSON.parse(layoutJSON);
                _.extend(_layouts, l);
            }
            catch (e) {
                alert("UIBuilder: error in layout.json");
                throw(e);
            }
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

        getConfigData: function (config) {
            return _layouts[config];
        },

        buildLayout: function (config, parent, handler) {
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
                    var fontWeight = config.params.fontWeight || 'normal',
                        wordWrap = config.params.wordWrap || 'false',
                        wordWrapWidth = config.params.wordWrapWidth || '0';

                    widget = new PIXI.Text(_s(config.params.text),
                        {
                            'font': fontWeight + ' ' + (Math.floor(config.params.fontSize * ScreenMetrics.getResScale())) + 'px ' + config.params.fontFamily,
                            'fill': config.params.fill,
                            'align': config.params.align,
                            'wordWrap': wordWrap,
                            'wordWrapWidth': wordWrapWidth
                        });

                    widget._setText = widget.setText;
                    widget.setText = function (text) {
                        this._setText(text);
                        this.updateText();
                        self.positionWidget(this, config, this.parent);
                    };
                    break;

                case "BitmapText":
                    var tint = '0xFFFFFF';
                    this.checkParams({"text": "string", "fontSize": "number", "fontFamily": "string"}, config.params);
                    if (config.params.tint) {
                        tint = config.params.tint;
                    }
                    widget = new PIXI.BitmapText(_s(config.params.text), {font: (Math.floor(config.params.fontSize * ScreenMetrics.getResScale())) + "px " + config.params.fontFamily, tint: tint});
                    widget.width = widget.textWidth;
                    widget.height = widget.textHeight;
                    widget.tint = parseInt(tint, 16);
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
                    var scaleX = 1,
                        scaleY = 1;

                    if(config.params.scale) {
                        scaleX = config.params.scale.x,
                        scaleY = config.params.scale.y;
                    }

                    try {
                        widget = PIXI.Sprite.fromFrame(_a(config.params.texture));
                        widget.scale.x = scaleX;
                        widget.scale.y = scaleY;
                    }
                    catch (e) {
                        alert (e);
                    }
                    break;

                case "Container":
                    widget = new PIXI.DisplayObjectContainer();
                    if (config.params) {
                        widget.width = Coords.x(config.params.width) || parent.width;
                        widget.height = Coords.y(config.params.height) || parent.height;
                    }
                    else {
                        widget.width = parent.width;
                        widget.height = parent.height;
                    }
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
                case "AnimatedButton":
                    this.checkParams({"action": "string"}, config.params);

                    var threeSlice = config.params.threeSlice || null;
                    if (threeSlice) {
                        this.checkParams({"width": "number", "height": "number", "imageBase": "string"}, config.params.threeSlice);
                    }

                    var defaultTexture = (config.params.defaultTexture && (typeof config.params.defaultTexture === 'string')) ? config.params.defaultTexture : null;
                    var hoverTexture = (config.params.hoverTexture && (typeof config.params.hoverTexture === 'string')) ? config.params.hoverTexture : null;

                    var defaultImage = (defaultTexture !== null ? PIXI.Texture.fromFrame(_a(defaultTexture)) : null);
                    var hoverImage = (hoverTexture !== null ? PIXI.Texture.fromFrame(_a(hoverTexture)) : null);

                    var action = (handler && handler[config.params.action] && handler[config.params.action].bind(handler) || null);

                    var replaceOnHover = (config.params.replaceOnHover || null);
                    var useTap = (config.params.replaceOnHover || null);

                    var threeSliceOptions = null;
                    if (threeSlice) {
                        threeSliceOptions = {
                            width: Coords.x(config.params.threeSlice.width),
                            height: Coords.y(config.params.threeSlice.height),
                            images: {
                                'left': _a(config.params.threeSlice.imageBase + '.left'),
                                'center': _a(config.params.threeSlice.imageBase + '.center'),
                                'right': _a(config.params.threeSlice.imageBase + '.right')
                            }
                        };
                    }

                    widget = new AnimatedButton(defaultImage, hoverImage, action, replaceOnHover, useTap, threeSliceOptions);

                    break;

                case "AnimatedTextButton":
                    this.checkParams({"action": "string"}, config.params);
                    this.checkParams({"text": "string", "fontSize": "number", "fontFamily": "string"}, config.params.textStyle);

                    var threeSlice = config.params.threeSlice || null;
                    if (threeSlice) {
                        this.checkParams({"width": "number", "height": "number", "imageBase": "string"}, config.params.threeSlice);
                    }

                    var defaultTexture = (config.params.defaultTexture && (typeof config.params.defaultTexture === 'string')) ? config.params.defaultTexture : null;
                    var hoverTexture = (config.params.hoverTexture && (typeof config.params.hoverTexture === 'string')) ? config.params.hoverTexture : null;

                    var defaultImage = (defaultTexture !== null ? PIXI.Texture.fromFrame(_a(defaultTexture)) : null);
                    var hoverImage = (hoverTexture !== null ? PIXI.Texture.fromFrame(_a(hoverTexture)) : null);

                    var replaceOnHover = (config.params.replaceOnHover || null);
                    var useTap = (config.params.replaceOnHover || null);

                    var action = (handler && handler[config.params.action] && handler[config.params.action].bind(handler) || null);
                    var textStyleOptions = {
                        text: _s(config.params.textStyle.text),
                        font : (Math.floor(config.params.textStyle.fontSize * ScreenMetrics.getResScale()) + "px " + config.params.textStyle.fontFamily),
                        align : config.params.textStyle.align,
                        fontSize : config.params.textStyle.fontSize,
                        useBitmapFont: typeof config.params.textStyle.useBitmapFont !== 'undefined' ? config.params.textStyle.useBitmapFont : true
                    };

                    if(config.params.textStyle.fill) {
                        textStyleOptions.fill = config.params.textStyle.fill;
                    }
                    if(config.params.textStyle.stroke) {
                        textStyleOptions.stroke = config.params.textStyle.stroke;
                    }
                    if(config.params.textStyle.strokeThickness) {
                        textStyleOptions.strokeThickness = Coords.x(config.params.textStyle.strokeThickness);
                    }
                    if (config.params.textStyle.tint) {
                        textStyleOptions.tint = parseInt(config.params.textStyle.tint, 16);
                    }

                    if(config.params.textStyle.position) {
                        textStyleOptions.position = {};
                        if (config.params.textStyle.position.x) {
                            textStyleOptions.position.x = Coords.x(config.params.textStyle.position.x);
                        }
                        if (config.params.textStyle.position.y) {
                            textStyleOptions.position.y = Coords.x(config.params.textStyle.position.y);
                        }
                    }

                    var threeSliceOptions = null;
                    if (threeSlice) {
                        threeSliceOptions = {
                            width: Coords.x(config.params.threeSlice.width),
                            height: Coords.y(config.params.threeSlice.height),
                            images: {
                                'left': _a(config.params.threeSlice.imageBase + '.left'),
                                'center': _a(config.params.threeSlice.imageBase + '.center'),
                                'right': _a(config.params.threeSlice.imageBase + '.right')
                            }
                        };
                    }
                    widget = new AnimatedTextButton(defaultImage, hoverImage, action, replaceOnHover, useTap, textStyleOptions, threeSliceOptions);
                    break;

                case "ToggleButton":
                    this.checkParams({"baseName": "string", "action": "string", "enabled" : "boolean"}, config.params);

                    var action = (handler && handler[config.params.action] && handler[config.params.action].bind(handler) || null);
                    var useOverlay = config.params.useOverlay || false;

                    widget = new ToggleButton(config.params.baseName, action, config.params.enabled, useOverlay);
                    break;
            }

            if (widget) {
                // add children if appropriate
                if (widget instanceof PIXI.DisplayObjectContainer && config.children) {
                    widget.widgets = {};
                    for (var c in config.children) {
                        if (config.children.hasOwnProperty(c)) {
                            widget.widgets[c] = this.buildLayout(config.children[c], widget, handler);
                            widget.addChild(widget.widgets[c]);
                        }
                    }
                }

                this.anchorWidget(widget, config);
                this.scaleWidget(widget, config, parent);
                this.rotateWidget(widget, config, parent);
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

        scaleWidget: function (widget, config, parent) {
            if (config.scale) {
                if (config.scale.x) {
                    if (typeof config.scale.x == "string") {
                        if (config.scale.x === "height") {
                            if (!parent || !parent.height) {
                                throw("Error: relative scale used but parent height not set!");
                            }
                            widget.scale.x = parent.height / widget.height;
                        }
                        if (config.scale.x === "width") {
                            if (!parent || !parent.width) {
                                throw("Error: relative scale used but parent width not set!");
                            }
                            widget.scale.x = parent.width / widget.width;
                        }
                    }
                    else {
                        widget.scale.x = config.scale.x;
                    }
                }
                if (config.scale.y) {
                    if (typeof config.scale.y == "string") {
                        if (config.scale.y === "height") {
                            if (!parent || !parent.height) {
                                throw("Error: relative scale used but parent height not set!");
                            }
                            widget.scale.y = parent.height / widget.height;
                        }
                        if (config.scale.y === "width") {
                            if (!parent || !parent.width) {
                                throw("Error: relative scale used but parent width not set!");
                            }
                            widget.scale.y = parent.width / widget.width;
                        }
                    }
                    else {
                        widget.scale.y = config.scale.y;
                    }
                }
            }
        },

        rotateWidget: function (widget, config, parent) {
            if (config.rotation) {
                widget.rotation = config.rotation;
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
