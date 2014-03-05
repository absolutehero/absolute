define(['absolute/mathutils','absolute/coords','pixi', 'lodash'],function(MathUtils, Coords, PIXI, _) {
    var RandomUtils = {

        getRandomIntFromRange: function(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        },

        distributeItems: function(ui, items, areaRect, randomItems, options) {

            options = _.extend({'minSpacing': 100, 'scaleWithY':true }, options);
            this.ui = ui;
            areaRect.area = areaRect.width * areaRect.height;

            for( var h = 0; h < items.length; h++ ) {

                var randomItem = items[h],
                    tmpTexture = new PIXI.Texture.fromFrame(randomItem.url);

                randomItem.area = tmpTexture.width * tmpTexture.height;
                randomItem.count = Math.round(( randomItem.fillDensity * areaRect.area ) / randomItem.area)

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
                        randomItem.sprite.position.x = x;
                        randomItem.sprite.position.y = y;
                        if(options.scaleWithY) {
                            randomItem.sprite.scale.x = randomItem.sprite.scale.y = randomItem.sprite.position.y / Coords.y(1200);
                            randomItem.sprite.alpha = Math.max(randomItem.sprite.scale.y, 0.3);
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

