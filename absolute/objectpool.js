define(['pixi', 'absolute/debug', 'lodash'], function(PIXI, Debug, _) {

    /**
     *
     * @param createCallback
     * @param initialCount
     * @constructor
     *
     * example:
     *
     * function createParticle() {
     *    var particle = new PIXI.Sprite.fromFrame('particle.png');
     *    return particle;
     * }
     *
     * var particlePool = new ObjectPool(createParticle.bind(this), 20);
     *
     * // get your particle
     * var particle = particlePool.get();
     *
     * // do something with your particle then release it.
     * particlePool.release(particle.poolIndex);
     *
     */

    var ObjectPool = function(createCallback, initialCount) {
        this.initObjectPool(createCallback,initialCount);
    };

    ObjectPool.prototype.initObjectPool = function(createCallback,initialCount,debugName) {

        this.create = createCallback;
        this.debugName = debugName || 'unkown';
        this.pool = [];
        this.used = [];
        this.itemsCreated = 0;

        _.times(initialCount, function(){

            this.pool.push(this.create());

        }, this);

    };

    ObjectPool.prototype.get = function() {

        if(this.pool.length > 0) {

            var item = this.pool.shift();

            item.poolIndex = this.itemsCreated;

            this.used.push(item);

            this.itemsCreated = this.itemsCreated + 1;

            return item;

        } else {


            var newItem = this.create();
            newItem.poolIndex = this.itemsCreated;
            this.used.push(newItem);
            this.itemsCreated = this.itemsCreated + 1;
            Debug.log('WARNING: ran out of pooled objects. of type ', this.debugName);
            return newItem;

        }

    };

    ObjectPool.prototype.release = function(index) {
        this.pool.push(this.used[index]);
        this.used[index] = null;
    };

    return ObjectPool;

});