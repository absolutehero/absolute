define(['pixi', 'hammer', 'absolute/button', 'absolute/screenmetrics', 'lodash', 'absolute/coords'],

    function (PIXI, Hammer, Button, ScreenMetrics,  _, Coords) {

        var MultiPageList = function (ui, items, options) {

            var defaultOptions = {
                pagePadding: {x: Coords.x(10), y: Coords.y(10)},
                borderThickness: {left: Coords.x(20), right: Coords.x(20)},
                interfacePadding: {arrows: {x:Coords.x(50),y:Coords.y(50)}},
                buttonScale: 1.0,
                pageButtonImage: 'leaderboard_up_arrow.png',
                pageChangedCallback: function(){},
                startPage: 0
            };

            this.initMultiPageList(ui, items, _.extend(defaultOptions, options));
        };

        MultiPageList.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);

        MultiPageList.prototype.initMultiPageList = function (ui, items, options) {

            PIXI.DisplayObjectContainer.call(this, ui);

            // TODO - CALCULATE PAGES
            this.options = options;

            this.gapX = 0;
            this.gapY = 0;

            this.isPortrait = ui.portrait;

            if (ui.portrait) {
                this.layoutPortrait();
            } else {
                this.layoutLandscape();
            }
            this.setItems(items);

            this.reset(false, 0);
        };

        MultiPageList.prototype.setItems = function (items) {

            this.items = items;

            this.pages = [];

            var pageContainer = new PIXI.DisplayObjectContainer();

            var totalRows = this.items.length / this.colsPerPage,
                totalPages = Math.ceil( totalRows / this.rowsPerPage);

            for (var i = 0; i < totalPages; i += 1) {

                var startIndex = (this.rowsPerPage * this.colsPerPage) * i,
                    endIndex = (this.rowsPerPage * this.colsPerPage) * (i + 1);

                if(endIndex > this.items.length) {
                    endIndex = this.items.length;
                }

                this.pages.push(this.makePage(this.items.slice(startIndex, endIndex)));
            }
            pageContainer.addChild(this.pages[0]);
            this.addChild(pageContainer);
        };

        MultiPageList.prototype.makePage = function (items) {

            var page = new PIXI.DisplayObjectContainer();

            if (this.isPortrait) {
                var itemX = 0;
                for (var i = 0; i < items.length; i += 1) {
                    items[i].position.x = itemX;
                    items[i].position.y = 0;
                    itemX += (this.cellWidth + this.gapX);
                    page.addChild(items[i]);
                }
            } else {
                var itemY = 0;
                for (var i = 0; i < items.length; i += 1) {
                    items[i].position.x = 0;
                    items[i].position.y = itemY;
                    itemY += (this.cellHeight + this.gapY);
                    page.addChild(items[i]);
                }
            }

            page.width = (this.cellWidth + this.gapX) * this.colsPerPage;
            page.height = (this.cellHeight + this.gapY) * this.rowsPerPage;

            return page;

        };

        MultiPageList.prototype.reset = function (cleanUp, startPage) {

            if(cleanUp) {
                try {
                    this.removeChild(this.pageTray);
                    this.removeChild(this.nextpageButton);
                    this.removeChild(this.prevpageButton);
                } catch (e) {}
            }

            this.initContent();
            // this.initTouchInterface();

            this.scrollToPage(startPage);
        };

        MultiPageList.prototype.initContent = function() {

            this.pageTray = new PIXI.DisplayObjectContainer();

            if (this.isPortrait) {
                for (var i = 0, l = this.pages.length; i < l; i += 1) {
                    var page = this.pages[i];
                    page.position.x = i * page.width;
                    page.position.y = 0;
                    this.pageTray.addChild(page);
                }
                this.kPanThreshold = page.width / 5;
                this.centerOffset = (this.width - page.width)/2;
                this.pageTray.position.x = this.centerOffset;

            } else {
                for (var i = 0, l = this.pages.length; i < l; i += 1) {
                    var page = this.pages[i];
                    page.position.x = 0;
                    page.position.y = i * page.height;
                    this.pageTray.addChild(page);
                }
                this.kPanThreshold = page.height / 5;
                this.centerOffset = (this.height - page.height)/2;
                this.pageTray.position.y = this.centerOffset;
            }

            this.addChild(this.pageTray);

            if (this.mask) {
                this.removeChild(this.mask);
            }

            if (typeof this.maskRect !== 'undefined') {
                var mask = new PIXI.Graphics();
                mask.beginFill(0xFFFFFF, 1.0);

                mask.drawRect(this.maskRect.x, this.maskRect.y, this.maskRect.width, this.maskRect.height);

                mask.endFill();

                this.mask = mask;
                this.addChild(this.mask);
            }
        };

        MultiPageList.prototype.initTouchInterface = function() {

            // Dragging and panning
            this.lastDeltaX = 0;
            this.startX = 0;

           // Hammer(this.ui.container).on("dragstart", this.handleDragStart.bind(this));
           // Hammer(this.ui.container).on("drag", this.handleDrag.bind(this));
           // Hammer(this.ui.container).on("dragend", this.handleDragEnd.bind(this));

        };

        MultiPageList.prototype.scrollUp = function() {
            if (this.currentPage < this.pages.length - 1) {
                this.scrollToPage(this.currentPage + 1);
            }
        };

        MultiPageList.prototype.scrollDown = function() {
            if (this.currentPage > 0) {
                this.scrollToPage(this.currentPage - 1);
            }
        };

        MultiPageList.prototype.enableButtons = function (enable) {
            // var i, l;
            // for (i = 0, l = this.pages.length; i < l; i++) {
            //     this.pages[i].enableButtons(enable);
            // }
        };

        MultiPageList.prototype.handleDragStart = function (event) {
            this.lastDeltaX = 0;
            this.startX = - (this.currentPage * this.pages[this.currentPage].width) + this.centerOffset;
            this.enableButtons(false);
        };

        MultiPageList.prototype.handleDrag = function (event) {
            this.pageTray.position.x += ((event.gesture.deltaX - this.lastDeltaX) * ScreenMetrics.devicePixelRatio) / 2;
            this.lastDeltaX = event.gesture.deltaX;
        };

        MultiPageList.prototype.handleDragEnd = function (event) {

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

        MultiPageList.prototype.scrollToPage = function(pageIndex) {
            this.setCurrentPage(pageIndex);

            if (this.isPortrait) {
                var destination = -(pageIndex * this.pages[pageIndex].width) + this.centerOffset,
                    self = this;

                new TWEEN.Tween({ x: this.pageTray.position.x })
                    .to({ x: destination }, 300)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .onUpdate(function () {
                        self.pageTray.position.x = this.x;
                    })
                    .onComplete(function () {
                        self.enableButtons(true);
                        self.setCurrentPage(pageIndex);
                    })
                    .start();
            } else {
                var destination = - (pageIndex * this.pages[pageIndex].height) + this.centerOffset,
                    self = this;

                new TWEEN.Tween({ y: this.pageTray.position.y })
                    .to({ y: destination }, 300)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .onUpdate(function () {
                        self.pageTray.position.y = this.y;
                    })
                    .onComplete(function () {
                        self.enableButtons(true);
                        self.setCurrentPage(pageIndex);
                    })
                    .start();
            }

        };

        MultiPageList.prototype.setCurrentPage = function (page) {
            this.currentPage = page;
            // this.nextpageButton.setActive((page !== this.pages.length - 1));
            // this.prevpageButton.setActive((page !== 0));
            this.options.pageChangedCallback(page);
        };

        MultiPageList.prototype.enableButtons = function (enable) {
            var i, l;
            for (i = 0, l = this.pages.length; i < l; i++) {
                this.pages[i].interactive = enable;
            }
        };

        MultiPageList.prototype.layoutPortrait = function () {
            this.width = this.options.portraitLayout.pageWidth;
            this.height = this.options.portraitLayout.pageHeight;
            this.gapX = this.options.portraitLayout.gap;
            this.cellWidth = this.options.portraitLayout.itemWidth + (this.options.portraitLayout.gap / 2);
            this.cellHeight = this.options.portraitLayout.itemHeight + (this.options.portraitLayout.gap / 2);
            this.colsPerPage = Math.floor(this.width / this.cellWidth);
            this.rowsPerPage = Math.floor(this.height / this.cellHeight);
            this.maskXOffset = this.options.portraitLayout.maskXOffset;
            this.maskWidthOffset = this.options.portraitLayout.maskWidthOffset;
            this.maskYOffset = this.options.portraitLayout.maskYOffset;
            this.maskHeightOffset = this.options.portraitLayout.maskHeightOffset;
            this.maskRect = this.options.portraitLayout.maskRect;
        };

        MultiPageList.prototype.layoutLandscape = function () {
            this.width = this.options.landscapeLayout.pageWidth;
            this.height = this.options.landscapeLayout.pageHeight;
            this.gapY = this.options.landscapeLayout.gap;
            this.cellWidth = this.options.landscapeLayout.itemWidth + (this.options.landscapeLayout.gap / 2);
            this.cellHeight = this.options.landscapeLayout.itemHeight + (this.options.landscapeLayout.gap / 2);
            this.colsPerPage = Math.floor(this.width / this.cellWidth);
            this.rowsPerPage = Math.floor(this.height / this.cellHeight);
            this.maskRect = this.options.landscapeLayout.maskRect;
        };

        MultiPageList.prototype.handleOrientationChange = function (isPortrait) {
            this.isPortrait = isPortrait;
            if (isPortrait) {
                this.layoutPortrait();
            } else {
                this.layoutLandscape();
            }
            this.reset(true, this.currentPage);
        };

        return MultiPageList;

    });
