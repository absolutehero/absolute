/**
 * Created by craig on 10/13/13.
 */
define(['pixi','absolute/coords','lodash'],
    function (PIXI, Coords, _) {
        var MultiPageGenerator = function (settings) {

            var defaultSettings = {
                width: 0,
                height: 0,
                cardScale: 0.83,
                padding: {'x': Coords.x(50), 'y': Coords.y(50)},
                itemWidth: 0,
                itemHeight: 0
            };

            this.initMultiPageGenerator(_.extend(defaultSettings, settings));

        };

        MultiPageGenerator.prototype.initMultiPageGenerator = function (settings) {

            this.settings = settings;
            this.width = this.settings.width;
            this.height = this.settings.height;

        };

        MultiPageGenerator.prototype.getPages = function (items) {

            this.items = items;
            this.pages = [];

            this.cellWidth = ( this.settings.itemWidth * this.settings.cardScale ) + (this.settings.padding.x );
            this.cellHeight = ( this.settings.itemHeight * this.settings.cardScale ) + (this.settings.padding.y);
            this.colsPerPage = Math.floor( this.width / this.cellWidth);
            this.rowsPerPage = Math.floor(this.height / this.cellHeight);

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

            return this.pages;
        };

        MultiPageGenerator.prototype.makePage = function (items) {

            var page = new PIXI.DisplayObjectContainer(),
                itemIndex = 0;

            for (var row = 0; row < this.rowsPerPage; row += 1) {
                for (var col = 0; col < this.colsPerPage && itemIndex < items.length; col ++) {
                    /*var itemCard = new this.ItemType(item);
                    itemCard.position.x = col * (itemCard.width + this.settings.padding.x);
                    itemCard.position.y = row * (itemCard.height + this.settings.padding.y);*/
                    var item = items[itemIndex];
                    item.x = col * (item.width * this.settings.cardScale + this.settings.padding.x);
                    item.y = row * (item.height * this.settings.cardScale + this.settings.padding.y);
                    item.scale.x = item.scale.y = this.settings.cardScale;
                    page.addChild(item);
                    itemIndex ++;
                }
            }

            page.width = (item.width + this.settings.padding.x) * Math.min(this.colsPerPage,items.length);

            return page;

        };

        return MultiPageGenerator;
    }
);

