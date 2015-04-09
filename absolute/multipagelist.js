define(['pixi', 'absolute', 'hammer', 'absolute/button', 'absolute/screenmetrics', 'lodash', 'absolute/coords'],

    function (PIXI, Absolute, Hammer, Button, ScreenMetrics,  _, Coords) {

        var MultiPageList = function (ui, items, prevButton, nextButton, options) {

            var defaultOptions = {
                pagePadding: {x: Coords.x(10), y: Coords.y(10)},
                borderThickness: {left: Coords.x(20), right: Coords.x(20)},
                interfacePadding: {arrows: {x:Coords.x(50),y:Coords.y(50)}},
                buttonScale: 1.0,
                pageButtonImage: 'leaderboard_up_arrow.png',
                pageChangedCallback: function(){},
                startPage: 0
            };

            this.direction = "none";
            this.width_ = 0;
            this.height_ = 0;
            this.gapX = 0;
            this.gapY = 0;
            this.cellWidth = 1;
            this.cellHeight = 1;
            this.colsPerPage = 1;
            this.rowsPerPage = 1;
            this.maskRect;
            this.lockLayout;
            this.currentPage = 0;

            this.initMultiPageList(ui, items, prevButton, nextButton, _.extend(defaultOptions, options));
        };

        MultiPageList.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);

        MultiPageList.prototype.initMultiPageList = function (ui, items, prevButton, nextButton, layoutOptions) {

            PIXI.DisplayObjectContainer.call(this, ui);

            this.layoutOptions = layoutOptions;
            this.options = layoutOptions;

            this.lockLayout = layoutOptions.lockLayout || "none";

            this.isPortrait = ui.portrait;

            this.prevpageButton = prevButton;
            this.nextpageButton = nextButton;

            this.setItems(items);
        };

        MultiPageList.prototype.setItems = function (items) {
            this.items = items;
        };

        MultiPageList.prototype.createPages = function () {

            this.pages = [];

            if (this.items && this.items.length > 0) {
                var pageContainer = new PIXI.DisplayObjectContainer();

                var totalRows = this.items.length / this.colsPerPage,
                    totalPages = Math.ceil(totalRows / this.rowsPerPage);

                for (var i = 0; i < totalPages; i += 1) {

                    var startIndex = (this.rowsPerPage * this.colsPerPage) * i,
                        endIndex = (this.rowsPerPage * this.colsPerPage) * (i + 1);

                    if (endIndex > this.items.length) {
                        endIndex = this.items.length;
                    }

                    this.pages.push(this.makePage(this.items.slice(startIndex, endIndex), i));
                }
                if (this.pages.length > 0) {
                    pageContainer.addChild(this.pages[0]);
                    this.addChild(pageContainer);
                }
            }
        };

        MultiPageList.prototype.makePage = function (items, pageIndex) {

            var page = new PIXI.DisplayObjectContainer();

            if (this.lockLayout == "default") {
                var itemIndex = 0;

                for (var row = 0; row < this.rowsPerPage; row += 1) {
                    for (var col = 0; col < this.colsPerPage && itemIndex < items.length; col ++) {
                        var item = items[itemIndex];
                        item.x = col * (this.cellWidth + this.gapX);
                        item.y = row * (this.cellHeight + this.gapY);
                        item.pageIndex = pageIndex;
                        page.addChild(item);
                        itemIndex ++;
                    }
                }

            } else {
                if (this.isPortrait && this.lockLayout !== "vertical") {
                    var itemX = 0;
                    for (var i = 0; i < items.length; i += 1) {
                        items[i].position.x = itemX;
                        items[i].position.y = 0;
                        items[i].pageIndex = pageIndex;
                        itemX += (this.cellWidth + this.gapX);
                        items[i].pageIndex = pageIndex;
                        page.addChild(items[i]);
                    }
                } else if (!this.isPortrait || this.lockLayout !== "horizontal") {
                    var itemY = 0;
                    for (var i = 0; i < items.length; i += 1) {
                        items[i].position.x = 0;
                        items[i].position.y = itemY;
                        items[i].pageIndex = pageIndex;
                        itemY += (this.cellHeight + this.gapY);
                        items[i].pageIndex = pageIndex;
                        page.addChild(items[i]);
                    }
                }
            }

            page.width_ = (this.cellWidth + this.gapX) * this.colsPerPage;
            page.height_ = (this.cellHeight + this.gapY) * this.rowsPerPage;

            return page;

        };

        MultiPageList.prototype.setNavigationButtons = function(prevButton, nextButton) {
            this.prevpageButton = prevButton;
            this.nextpageButton = nextButton;
        };

        MultiPageList.prototype.reset = function () {
            if (this.pageTray) {
                this.removeChild(this.pageTray);
                this.pageTray = null;
            }
            this.createPages();

            this.initContent();


            this.enableButtons(false);
            this.setCurrentPage(0);
            this.enablePage(true, 0);

            // this.initTouchInterface();

            //this.scrollToPage(startPage);
        };

        MultiPageList.prototype.initContent = function() {

            if (this.pages.length > 0) {
                this.pageTray = new PIXI.DisplayObjectContainer();

                if (this.isPortrait && (this.lockLayout !== "vertical" || this.lockLayout == "none")) {
                    for (var i = 0, l = this.pages.length; i < l; i += 1) {
                        var page = this.pages[i];
                        page.position.x = i * page.width_;
                        page.position.y = 0;
                        this.pageTray.addChild(page);
                    }
                    this.kPanThreshold = page.width_ / 5;
                    this.centerOffset = (this.width_ - page.width_) / 2;
                    this.pageTray.position.x = this.centerOffset;

                } else if (this.lockLayout == "vertical" || !this.isPortrait && (this.lockLayout !== "horizontal" || this.lockLayout == "none")) {
                    for (var i = 0, l = this.pages.length; i < l; i += 1) {
                        var page = this.pages[i];
                        page.position.x = 0;
                        page.position.y = i * page.height_;
                        this.pageTray.addChild(page);
                    }
                    this.kPanThreshold = page.height_ / 5;
                    this.centerOffset = (this.height_ - page.height_) / 2;
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
            }
        };

        MultiPageList.prototype.initTouchInterface = function() {
            // Dragging and panning
            this.lastDeltaX = 0;
            this.startX = 0;
        };

        MultiPageList.prototype.scrollUp = function(onComplete) {
            if (this.currentPage < this.pages.length - 1) {
                this.scrollToPage(this.currentPage + 1, onComplete);
            }
        };

        MultiPageList.prototype.scrollDown = function(onComplete) {
            if (this.currentPage > 0) {
                this.scrollToPage(this.currentPage - 1, onComplete);
            }
        };

        MultiPageList.prototype.numPages = function() {
            return this.pages.length;
        };

        MultiPageList.prototype.handleDragStart = function (event) {
            this.lastDeltaX = 0;
            this.startX = - (this.currentPage * this.pages[this.currentPage].width_) + this.centerOffset;
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

        MultiPageList.prototype.scrollToPage = function(pageIndex, onCompleteCallback) {
            this.setCurrentPage(pageIndex);
            this.enableButtons(false);

            if (this.direction == "horizontal") {
                var destination = -(pageIndex * this.pages[pageIndex].width_) + this.centerOffset,
                    self = this;

                new TWEEN.Tween({ x: this.pageTray.position.x })
                    .to({ x: destination }, 300)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .onUpdate(function () {
                        self.pageTray.position.x = this.x;
                    })
                    .onComplete(function () {
                        if (typeof onCompleteCallback === 'function') {
                            onCompleteCallback();
                        }
                        self.enablePage(true, pageIndex);
                        self.setCurrentPage(pageIndex);
                    })
                    .start();
            } else {
                var destination = -(pageIndex * this.pages[pageIndex].height_) + this.centerOffset;
                    self = this;

                new TWEEN.Tween({ y: this.pageTray.position.y })
                    .to({ y: destination }, 300)
                    .easing(TWEEN.Easing.Quadratic.InOut)
                    .onUpdate(function () {
                        self.pageTray.position.y = this.y;
                    })
                    .onComplete(function () {
                        if (typeof onCompleteCallback === 'function') {
                            onCompleteCallback();
                        }
                        self.enablePage(true, pageIndex);
                        self.setCurrentPage(pageIndex);
                    })
                    .start();
            }

        };

        MultiPageList.prototype.setCurrentPage = function (page) {
            this.currentPage = page;
            this.setNavigationButtonActiveStates();
            this.options.pageChangedCallback(page);
        };

        MultiPageList.prototype.setNavigationButtonActiveStates = function () {
            if (this.pages.length > 0) {
                if (this.nextpageButton) {
                    this.nextpageButton.setActive((this.currentPage !== this.pages.length - 1));
                }
                if (this.prevpageButton) {
                    this.prevpageButton.setActive((this.currentPage !== 0));
                }
            }
        };

        MultiPageList.prototype.enablePage = function (enable, index) {
            if (index >= 0 && index < this.pages.length) {
                this.pages[index].interactive = enable;
                this.pages[index].interactiveChildren = enable;
            }
            if (this.items) {
                for (var j = 0; j < this.items.length; j++) {
                    this.items[j].interactive = false;
                    if (enable && this.items[j].pageIndex == index) {
                        this.items[j].interactive = enable;
                    }
                }
            }
        };

        MultiPageList.prototype.enableButtons = function (enable) {
            for (var i = 0; i < this.pages.length; i++) {
                this.pages[i].interactive = enable;
                this.pages[i].interactiveChildren = enable;
            }

            if (this.items) {
                for (var j = 0; j < this.items.length; j++) {
                    this.items[j].interactive = enable;
                }
            }
        };

        MultiPageList.prototype.setLayout = function (options) {
            this.direction = options.direction;
            this.width_ = options.pageWidth;
            this.height_ = options.pageHeight;

            if (typeof options.gap === 'number') {
                this.gapX = options.gap;
                this.gapY = options.gap;
            } else {
                this.gapX = options.gapX;
                this.gapY = options.gapY;
            }

            this.cellWidth = options.itemWidth;
            this.cellHeight = options.itemHeight;

            if (typeof options.colsPerPage === 'number') {
                this.colsPerPage = options.colsPerPage;
            } else {
                this.colsPerPage = Math.floor(options.pageWidth / this.cellWidth);
            }

            if (typeof options.rowsPerPage === 'number') {
                this.rowsPerPage = options.rowsPerPage;
            } else {
                this.rowsPerPage = Math.floor(options.pageHeight / this.cellHeight);
            }

            this.maskRect = options.maskRect;
            this.lockLayout = options.lockLayout || "none";
        };


        MultiPageList.prototype.handleOrientationChange = function (isPortrait) {
            this.isPortrait = isPortrait;
            this.reset();
        };

        return MultiPageList;

    });
