define (['absolute/platform', 'lodash'], function (Platform, _) {

    var NativePurchaseManagaer = {

        products: [],

        initialized: false,

        initializeStore: function (config) {
            this.initialized = true;
            this.products = config.products;

            if (Platform.isCordova()) {
                // Let's set a pretty high verbosity level, so that we see a lot of stuff
                // in the console (reassuring us that something is happening).
                store.verbosity = store.DEBUG;
            }

            // Enable remote receipt validation
            //store.validator = "https://sam-dev.parseapp.com/apple/check-purchase";


            _.each(this.products, function (product) {
                if (!Platform.isCordova()) {
                    product.storeProduct = {
                        price: product.usdPrice
                    };
                }
                else {
                    store.register({
                        id: product.id,
                        alias: product.alias,
                        type: this._stringToProductType(product.type)
                    });
                }

            }.bind(this));

            if (Platform.isCordova()) {

                // When any product gets updated, refresh the HTML.
                store.when("product").updated(function (p) {

                    console.log("product updated");
                    console.log(p);

                    for (var i = 0; i < this.products.length; i += 1) {
                        if (this.products[i].id == p.id) {
                            this.products[i].storeProduct = p;
                            break;
                        }
                    }

                }.bind(this));

                // When every goes as expected, it's time to celebrate!
                // The "ready" event should be welcomed with music and fireworks,
                // go ask your boss about it! (just in case)
                store.ready(function () {
                    console.log("\\o/ STORE READY \\o/");
                });

                // After we've done our setup, we tell the store to do
                // it's first refresh. Nothing will happen if we do not call store.refresh()
                store.refresh();
            }
        },

        orderProduct: function (product) {
            var p = product.storeProduct;
            console.log("ordering product");
            console.log(p);
            if (Platform.isCordova()) {
                if (p.loaded) {
                    if (p.valid) {
                        if (p.canPurchase) {
                            alert('ordered product ' + p.title);
                            //store.order(p.storeProduct);
                        }
                        else {
                            console.log('product cannot purchase');
                        }
                    }
                    else {
                        console.log('product not valid');
                    }
                }
                else {
                    console.log('product not loaded');
                }
            }
        },

        getAvailableProducts: function (setProducts) {
            setProducts(this.products);
        },

        _stringToProductType: function (typeString) {
            return store.CONSUMABLE;
        }




};


    return NativePurchaseManagaer;
});