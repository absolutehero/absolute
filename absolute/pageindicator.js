define(['absolute/coords','pixi','lodash'], function(Coords, PIXI, _){

    var PageIndicator = function(pageCount, currentPageIndex, options) {

        currentPageIndex = typeof currentPageIndex !== 'undefined' ? currentPageIndex : 0;

        var defaultOptions = {
            pageIndicators: {
                empty: 'btn_main_pagepip_empty.png',
                full: 'btn_main_pagepip_full.png'
            },
            pipPadding: Coords.x(10),
            clickCallback: function(){}
        };

        this.initPageIndicator(pageCount, currentPageIndex, _.extend(defaultOptions, options));
    };

    PageIndicator.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);

    PageIndicator.prototype.initPageIndicator = function(pageCount, currentPageIndex, options) {

        PIXI.DisplayObjectContainer.call(this);

        this.pageCount = pageCount;
        this.currentPage = currentPageIndex;
        this.options = options;

        this.pips = [];
        this.makePips();

    };

    PageIndicator.prototype.setPageIndex = function(index) {

        this.currentPage = index;
        this._update();

    };

    PageIndicator.prototype.makePips = function() {

        for(var i = 0; i < this.pageCount; i++) {

            var pip = new PIXI.DisplayObjectContainer();

            pip.on = new PIXI.Sprite.fromFrame(this.options.pageIndicators.full);
            pip.off = new PIXI.Sprite.fromFrame(this.options.pageIndicators.empty);

            pip.position.x = (pip.on.width + this.options.pipPadding) * i;

            if(i !== this.currentPage) {
                pip.on.visible = false;
                pip.off.visible = true;
            } else {
                pip.on.visible = true;
                pip.off.visible = false;
            }

            pip.addChild(pip.on);
            pip.addChild(pip.off);

            pip.off.interactive = true;
            pip.off.pageIndex = i;
            pip.off.click = function(event) {
               this.options.clickCallback(event.target.pageIndex);
            }.bind(this);

            this.addChild(pip);
            this.pips.push(pip);

        }

        // for pixi 1.6
        this.totalHeight = pip.on.height;
        this.totalWidth = (pip.on.width + this.options.pipPadding) * this.pageCount;

        // these don't work in pixi 1.6 but leaving them for now in case something is using it
        this.height = this.totalHeight;
        this.width = this.totalWidth;

    };

    PageIndicator.prototype._update = function() {

        for(var i = 0; i < this.pips.length; i++) {
            var pip = this.pips[i];
            if(this.currentPage == i) {
                pip.on.visible = true;
                pip.off.visible = false;
            } else {
                pip.on.visible = false;
                pip.off.visible = true;
            }

        }

    };

    PageIndicator.prototype.nextPage = function() {

        this.currentPage++;
        if(this.currentPage >= this.pageCount) {
            this.currentPage == 0;
        }

        this._update();

    };

    PageIndicator.prototype.previousPage = function() {

        this.currentPage--;
        if(this.currentPage < 0) {
            this.currentPage == 0;
        }

        this._update();

    };


    return PageIndicator;

});