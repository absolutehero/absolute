define(['pixi', 'absolute/dialog','hammer', 'absolute/button', 'absolute/screenmetrics', 'lodash',
    'absolute/pageIndicator', 'absolute/coords'],

function (PIXI, Dialog, Hammer, Button, ScreenMetrics,  _, PageIndicator, Coords) {

    var MultiPageDialog = function (ui, options) {

        var defaultOptions = {
            pages: [],
            pagePadding: {x: Coords.x(10), y: Coords.y(100)},
            borderThickness: {left: Coords.x(18), right: Coords.x(35)},
            interfacePadding: Coords.x(50),
            buttonScale: 0.5,
            pageButtonImage: 'btn_main_LAGOONRETURN.png'
        };

        this.initOptionsScreen(ui, _.extend(defaultOptions, options));
    };

    MultiPageDialog.prototype = Object.create(Dialog.prototype);

    MultiPageDialog.prototype.initOptionsScreen = function (ui, options) {

        Dialog.call(this, ui, options);

        this.pages = this.options.pages;

        this.initContent();
        this.initTouchInterface();
        this.initNonTouchInterface();
        this.setCurrentPage(0);
        this.initPagePips();

    };

    MultiPageDialog.prototype.initContent = function() {

        this.pageTray = new PIXI.DisplayObjectContainer();

        for (var i = 0, l = this.pages.length; i < l; i += 1) {
            var page = this.pages[i];
            page.position.x = i * page.width;
            page.position.y = this.options.pagePadding.y;
            this.pageTray.addChild(page);
        }

        this.kPanThreshold = page.width / 4;
        this.centerOffset = (this.width - page.width)/2;
        this.pageTray.position.x = this.centerOffset;

        var mask = new PIXI.Graphics();
        mask.beginFill(0xFFFFFF, 1.0);
        mask.drawRect(this.position.x + this.options.borderThickness.left, 0,
            this.width - this.options.borderThickness.right, this.height);
        mask.endFill();
        this.pageTray.mask = mask;

        this.addChild(this.pageTray);

    };

    MultiPageDialog.prototype.initTouchInterface = function() {

        // Dragging and panning
        this.lastDeltaX = 0;
        this.startX = 0;

        Hammer(this.ui.container).on("dragstart", this.handleDragStart.bind(this));
        Hammer(this.ui.container).on("drag", this.handleDrag.bind(this));
        Hammer(this.ui.container).on("dragend", this.handleDragEnd.bind(this));

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
        var buttonY = this.height - (this.nextpageButton.height * this.options.buttonScale) - this.options.interfacePadding;
        this.nextpageButton.scale.x = -1 * this.options.buttonScale;
        this.nextpageButton.scale.y = this.options.buttonScale;
        this.nextpageButton.position.x = this.width - this.options.interfacePadding;
        this.nextpageButton.position.y = buttonY;
        this.addChild(this.nextpageButton);

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
        this.prevpageButton.position.x = this.options.interfacePadding;
        this.addChild(this.prevpageButton);

    };

    MultiPageDialog.prototype.initPagePips = function() {

        if(this.pages.length > 1) {
            this.pips = new PageIndicator(this.pages.length, 0, {clickCallback: this.scrollToPage.bind(this)});
            this.pips.position.x = (this.width - this.pips.width) / 2;
            this.pips.position.y = this.height - this.pips.height - this.options.interfacePadding;
            this.addChild(this.pips);
        }

    };

    MultiPageDialog.prototype.enableButtons = function (enable) {

        var i, l;

        for (i = 0, l = this.pages.length; i < l; i++) {
            this.pages[i].enableButtons(enable);
        }
    };

    MultiPageDialog.prototype.handleDragStart = function (event) {

        this.lastDeltaX = 0;
        this.startX = - (this.currentPage * this.pages[this.currentPage].width) + this.centerOffset;
        this.enableButtons(false);

    };

    MultiPageDialog.prototype.handleDrag = function (event) {
        this.pageTray.position.x += ((event.gesture.deltaX - this.lastDeltaX) * ScreenMetrics.devicePixelRatio) / 2;
        this.lastDeltaX = event.gesture.deltaX;
    };

    MultiPageDialog.prototype.handleDragEnd = function (event) {

        this.lastDeltaX = 0;

        var pageIndex = this.currentPage;

        if (event.gesture.deltaX <= -this.kPanThreshold) {
            pageIndex += 1;
        } else if (event.gesture.deltaX >= this.kPanThreshold) {
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
        this.nextpageButton.visible = (page !== this.pages.length - 1);
        this.prevpageButton.visible = (page !== 0);
    };

    MultiPageDialog.prototype.enableButtons = function (enable) {

        var i, l;

        for (i = 0, l = this.pages.length; i < l; i++) {
            this.pages[i].interactive = enable;
        }

    };

    return MultiPageDialog;

});

