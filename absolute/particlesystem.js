/**
 * User: craig
 * Date: 3/17/14
 * Time: 9:41 AM
 * Copyright (c) 2014 Absolute Hero, Inc.
 */
define (['proton'], function (Proton) {

    var ParticleSystem = {

        init: function () {
            this.proton = new Proton();
            this.particleRenderer = new Proton.Renderer('other', this.proton);
            this.particleRenderer.start();
        },

        update: function () {
            this.proton.update();
        }
    };

    return ParticleSystem;

});