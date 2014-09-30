define(['pixi', 'absolute/dialog', 'absolute/button', 'absolute/screenmetrics', 'lodash',
    'absolute/pageindicator', 'absolute/coords', 'absolute/platform'],

function (PIXI, Dialog, Button, ScreenMetrics,  _, PageIndicator, Coords, Platform) {

    var MultiPageDialog = function (ui, options) {

        var defaultOptions = {
            pages: [],
            pagePadding: {x: Coords.x(10), y: Coords.y(100)},
            borderThickness: {left: Coords.x(18), right: Coords.x(35)},
            interfacePadding: {arrows: {x:Coords.x(50),y:Coords.y(50)}, pips: Coords.y(50)},
            buttonScale: 0.5,
            pageButtonImage: 'btn_main_LAGOONRETURN.png',
            pageChangedCallback: function(){},
            startPage: 0
        };

        this.initMultiPageDialog(ui, _.extend(defaultOptions, options));
    };

    MultiPageDialog.prototype = Object.create(Dialog.prototype);

    MultiPageDialog.prototype.initMultiPageDialog = function (ui, options) {

        Dialog.call(this, ui, options);

        this.pages = this.options.pages;
        var startPage = this.options.startPage < this.pages.length ? this.options.startPage : 0;

        this.reset(false, startPage);

    };

    MultiPageDialog.prototype.reset = function (cleanUp, startPage, newPages) {

        if(cleanUp) {
            try {
                this.removeChild(this.pageTray);
                this.removeChild(this.pips);
                this.removeChild(this.nextpageButton);
                this.removeChild(this.prevpageButton);
            } catch (e) {}
        }

        if(newPages) {
            this.options.pages = newPages;
            this.pages = newPages;
        }

        this.initContent();
        this.initNonTouchInterface();
        if(!Platform._isOldAndroid()) {
            this.initTouchInterface();
        }
        this.initPagePips();

        this.scrollToPage(startPage);

    };

    MultiPageDialog.prototype.initContent = function() {

        this.pageTray = new PIXI.DisplayObjectContainer();

        for (var i = 0, l = this.pages.length; i < l; i += 1) {
            var page = this.pages[i];
            page.position.x = i * page.width;
            page.position.y = this.options.pagePadding.y;
            this.pageTray.addChild(page);
        }

        this.kPanThreshold = page.width / 5;
        this.centerOffset = (this.width - page.width)/2;
        this.pageTray.position.x = this.centerOffset;

        var mask = new PIXI.Graphics();
        mask.beginFill(0xFFFFFF, 1.0);
        mask.drawRect(this.position.x + this.options.borderThickness.left, this.position.y,
            this.width - this.options.borderThickness.right, this.height);
        mask.endFill();
        this.pageTray.mask = mask;

        this.container.addChild(this.pageTray);

    };

    MultiPageDialog.prototype.initTouchInterface = function() {

        // Dragging and panning
        var yOffset = 0;
        if(this.closeButton) {
            yOffset = this.closeButton.height;
        }
        this.lastDeltaX = 0;
        this.startX = 0;
        var hitArea = new PIXI.Rectangle(0, yOffset, this.options.width, this.options.height - yOffset - this.nextpageButton.height);
        this.touchContainer = new PIXI.DisplayObjectContainer();
        this.touchContainer.interactive = true;
        this.touchContainer.hitArea = hitArea;
        this.touchContainer.addChild(this.pageTray);
        this.touchContainer.touchstart = this.handleDragStart.bind(this);
        this.touchContainer.touchmove = this.handleDrag.bind(this);
        this.touchContainer.touchend = this.touchContainer.touchendoutside= this.handleDragEnd.bind(this);
        this.addChild(this.touchContainer);

    };

    MultiPageDialog.prototype.initNonTouchInterface = function() {

        this.nextpageButton = new Button(
            PIXI.Texture.fromFrame(this.options.pageButtonImage),
            PIXI.Texture.fromFrame(this.options.pageButtonImage),
            function () {
                if (this.currentPage < this.pages.length - 1) {
                    this.scrollToPage(this.currentPage + 1);
                }
            }.bind(this),
            false
        );
        var buttonY = this.height - (this.nextpageButton.height * this.options.buttonScale) - this.options.interfacePadding.arrows.y;
        this.nextpageButton.scale.x = -1 * this.options.buttonScale;
        this.nextpageButton.scale.y = this.options.buttonScale;
        this.nextpageButton.position.x = this.width - this.options.interfacePadding.arrows.x;
        this.nextpageButton.position.y = buttonY;
        this.nextpageButton.setActive(false);
        this.container.addChild(this.nextpageButton);

        this.prevpageButton = new Button(
            PIXI.Texture.fromFrame(this.options.pageButtonImage),
            PIXI.Texture.fromFrame(this.options.pageButtonImage),
            function () {
                if (this.currentPage > 0) {
                    this.scrollToPage(this.currentPage - 1);
                }
            }.bind(this),
            false
        );
        this.prevpageButton.position.y = buttonY;
        this.prevpageButton.scale.x = this.prevpageButton.scale.y = this.options.buttonScale;
        this.prevpageButton.position.x = this.options.interfacePadding.arrows.x;
        this.prevpageButton.setActive(false);
        this.container.addChild(this.prevpageButton);

    };

    MultiPageDialog.prototype.initPagePips = function() {

        if(this.pages.length > 1) {
            this.pips = new PageIndicator(this.pages.length, 0, {clickCallback: this.scrollToPage.bind(this)});
            this.pips.position.x = (this.width - this.pips.width) / 2;
            this.pips.position.y = this.height - this.pips.height - this.options.interfacePadding.pips;
            this.container.addChild(this.pips);
        }

    };

    MultiPageDialog.prototype.enableButtons = function (enable) {

        var i, l;

        for (i = 0, l = this.pages.length; i < l; i++) {
            this.pages[i].enableButtons(enable);
        }
    };

    MultiPageDialog.prototype.handleDragStart = function (data) {

        this.dragging = true;
        this.lastDeltaX = 0;
        this.startX = data.getLocalPosition(this.parent).x;
        this.enableButtons(false);

    };

    MultiPageDialog.prototype.handleDrag = function (data) {

        var pos = data.getLocalPosition(this.parent),
            delta = pos.x - this.startX;

        this.pageTray.x += ((delta - this.lastDeltaX) * ScreenMetrics.devicePixelRatio) * 0.7;

        this.lastDeltaX = delta;
    };

    MultiPageDialog.prototype.handleDragEnd = function (data) {

        this.lastDeltaX = 0;

        if(typeof this.parent == 'undefined') {
            return;
        }

        var pageIndex = this.currentPage,
            pos = data.getLocalPosition(this.parent),
            delta = pos.x - this.startX;

        if (delta <= -this.kPanThreshold) {
            pageIndex += 1;
        } else if (delta >= this.kPanThreshold) {
            pageIndex -= 1;
        }

        if(pageIndex < 0) {
            pageIndex = 0;
        } else if (pageIndex > this.pages.length - 1) {
            pageIndex = this.pages.length - 1;
        }

        this.scrollToPage(pageIndex);

    };

    MultiPageDialog.prototype.scrollToPage = function(pageIndex) {

        if(this.pips) {
            this.pips.setPageIndex(pageIndex);
        }

        var destination = - (pageIndex * this.pages[pageIndex].width) + this.centerOffset,
            self = this;

        new TWEEN.Tween({ x: this.pageTray.position.x })
            .to({ x: destination }, 200)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .onUpdate(function () {
                self.pageTray.position.x = this.x;
            })
            .onComplete(function () {
                self.enableButtons(true);
                self.setCurrentPage(pageIndex);
            })
            .start();
    };

    MultiPageDialog.prototype.setCurrentPage = function (page) {
        this.currentPage = page;
        this.nextpageButton.setActive((page !== this.pages.length - 1));
        this.prevpageButton.setActive((page !== 0));
        this.options.pageChangedCallback(page);
    };

    MultiPageDialog.prototype.enableButtons = function (enable) {

        var i, l;

        for (i = 0, l = this.pages.length; i < l; i++) {
            this.pages[i].interactive = enable;
        }

    };

    MultiPageDialog.prototype.handleOrientationChange = function (isPortrait) {

        Dialog.prototype.handleOrientationChange.call(this,isPortrait);

        this.reset(true, this.currentPage);

    };

    return MultiPageDialog;

});

