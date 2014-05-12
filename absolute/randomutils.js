define(['absolute/mathutils','absolute/coords','pixi', 'lodash', 'absolute/spriteutils'],function(MathUtils, Coords,
    PIXI, _, SpriteUtils) {
    var RandomUtils = {

        getRandomIntFromRange: function(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },

        distributeItems: function(ui, items, areaRect, randomItems, options) {

            options = _.extend({
                'minSpacing': 100,
                'scaleWithY':true,
                'minScale': 0.3,
                'maxScale': 1,
                'minAlpha': 0.2,
                'lockY': null,
                'lockX': null,
                'shade': 0
            }, options);
            this.ui = ui;
            areaRect.area = areaRect.width * areaRect.height;

            for( var h = 0; h < items.length; h++ ) {

                var randomItem = items[h],
                    tmpTexture = new PIXI.Texture.fromFrame(randomItem.url);

                randomItem.area = tmpTexture.width * tmpTexture.height;
                randomItem.count = Math.round(( randomItem.fillDensity * areaRect.area ) / randomItem.area);

                for(var i = 0; i < randomItem.count; i ++ ) {

                    function distributeRandomBackgroundItem(trys, maxTries) {
                        var x = self.getRandomIntFromRange(0, areaRect.width),
                            y = self.getRandomIntFromRange(areaRect.y, areaRect.y + areaRect.height);

                        for( var j = 0; j < randomItems.children.length; j++ ) {

                            var distance = MathUtils.distance(x,y,randomItems.children[j].position.x, randomItems.children[j].position.y);

                            if(trys >= maxTries) {
                                return false;
                            } else if( distance < options.minSpacing) {
                                trys++
                                distributeRandomBackgroundItem(trys,maxTries);
                                return false;
                            }

                        }
                        randomItem.sprite = new PIXI.Sprite.fromFrame(randomItem.url);

                        if(options.shade > 0) {
                            var shadedSprite = new PIXI.Sprite(SpriteUtils.greyscale(PIXI.Sprite.fromFrame(randomItem.url), 0.5));
                            shadedSprite.alpha = options.shade;
                            randomItem.sprite.addChild(shadedSprite);
                        }


                        if(options.lockX !== null) {
                            randomItem.sprite.position.x = 0;
                        } else {
                            randomItem.sprite.position.x = x;
                        }
                        if(options.lockY !== null) {
                            randomItem.sprite.position.y = 0;
                        } else {
                            randomItem.sprite.position.y = y;
                        }



                        if(options.scaleWithY) {

                            var scale = (y - areaRect.y) / areaRect.height;

                            scale += options.minScale;

                            if(scale > 1) {
                                scale = 1;
                            }

                            randomItem.sprite.scale.x = randomItem.sprite.scale.y = scale;
                            randomItem.sprite.alpha = Math.max(randomItem.sprite.scale.y, options.minAlpha);
                        } else {

                            var randomScale = self.getRandomIntFromRange(options.minScale * 100, options.maxScale * 100) / 100;

                            randomItem.sprite.scale.x = randomItem.sprite.scale.y = randomScale;

                            if(Math.random() > 0.5) {
                                randomItem.sprite.scale.x = -randomItem.sprite.scale.x;
                            }

                            if(randomScale > 1) {
                                randomItem.sprite.y = randomItem.sprite.texture.height - (randomItem.sprite.texture.height * randomScale);
                            }

                        }
                        randomItems.addChild(randomItem.sprite);
                    }
                    var self = this;
                    distributeRandomBackgroundItem(0,1000);
                }

            }

            return randomItems;
        }




    };
    return RandomUtils;
});

