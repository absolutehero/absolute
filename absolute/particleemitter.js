/**
 * User: craig
 * Date: 3/5/14
 * Time: 3:15 PM
 * Copyright (c) 2014 Absolute Hero, Inc.
 */
define(['pixi', 'lodash', 'proton'], function (PIXI, _, Proton) {

    var ParticleEmitter = function(ui, texture, options, parent) {
        var defaultOptions = {
            mass: 8,

            gravity: 1,

            alpha: {
                a: 1,
                b: 1
            },

            rate: {
                numpan: {
                    a: 15,
                    b: 20,
                    center: null
                },
                timepan: {
                    a: 0.2,
                    b: 0.5,
                    center: null
                }
            },

            velocity: {
                rpan: {
                    a: 3,
                    b: 9,
                    center: null
                },
                thapan: {
                    a: 0,
                    b: 360,
                    center: null
                },
                type: 'polar' // polar or vector
            },

            scale: {
                a: 0.5,
                b: 1,
                center: null
            },

            rotation: {
                a: 0,
                b: 1,
                style: 'add',
                life: Infinity,
                easing: Proton.easeLinear
            },

            life: {
                a: 1,
                b: 2,
                center: null
            },

            crossZone: {
                zone: {
                    x: 0,
                    y: 0,
                    width: 100,
                    height: 100
                },
                type: "bound",
                life: Infinity,
                easing: Proton.easeLinear
            },

            randomDrift: {
                driftX: 30,
                driftY:30,
                delay: 0.1,
                life: Infinity,
                easing: Proton.easeLinear
            }
        };

        if (typeof options == 'function') {
            this._initParticleEmitter(ui, texture, options, parent);
        }
        else {
            this._initParticleEmitter(ui, texture, _.extend(defaultOptions, options), parent);              
        }

    };

    ParticleEmitter.constructor = ParticleEmitter;
    ParticleEmitter.prototype = Object.create(PIXI.DisplayObjectContainer.prototype);

    ParticleEmitter.prototype._initParticleEmitter = function(ui, texture, options, parent) {
        PIXI.DisplayObjectContainer.call(this);
        this.ui = ui;
        this.particleParent = parent || options.parent;        

        if (!texture) {
            var graphics = new PIXI.Graphics();
            graphics.beginFill(0xff0000);
            graphics.drawRect(0, 0, 10, 10);
            graphics.endFill();
            texture = new PIXI.RenderTexture(10, 10);
            texture.render(graphics);
        }

        this.emitter = new Proton.BehaviourEmitter();

        if (typeof options == 'function') {
            options(this.emitter);
        }
        else {
            this.options = options;
    
            this.emitter.rate = new Proton.Rate(
                new Proton.Span(options.rate.numpan.a, options.rate.numpan.b, options.rate.numpan.center),
                new Proton.Span(options.rate.timepan.a, options.rate.timepan.b, options.rate.timepan.center));
            this.emitter.addInitialize(new Proton.Mass(options.mass));
            this.emitter.addInitialize(new Proton.ImageTarget(texture));
            this.emitter.addInitialize(new Proton.Life(options.life.a, options.life.b, options.life.center));
            if (typeof options.radius !== 'undefined') {
                this.emitter.addInitialize(new Proton.Radius(options.radius));
            }
            if(_.isArray(options.velocity) || _.isNumber(options.velocity)) {
                var angleRange = options.velocityAngleRange ? new Proton.Span(options.velocityAngleRange[0], options.velocityAngleRange[1], null) : new Proton.Span(0, 360, null);
                this.emitter.addInitialize(new Proton.Velocity(options.velocity, angleRange, 'polar'));
            } else if(typeof options.velocity !== 'undefined') {
                this.emitter.addInitialize(
                    new Proton.Velocity(
                        new Proton.Span(options.velocity.rpan.a, options.velocity.rpan.b, options.velocity.rpan.center),
                        new Proton.Span(options.velocity.thapan.a, options.velocity.thapan.b, options.velocity.thapan.center),
                        options.velocity.type));
            }

            this.emitter.addBehaviour(new Proton.Gravity(options.gravity));
            this.emitter.addBehaviour(new Proton.Scale(new Proton.Span(options.scale.a, options.scale.b, options.scale.center)));
            //this.emitter.addBehaviour(new Proton.Scale(options.scale.a, options.scale.b));
            this.emitter.addBehaviour(new Proton.Alpha(options.alpha.a, options.alpha.b));
            this.emitter.addBehaviour(new Proton.Rotate(options.rotation.a, options.rotation.b, options.rotation.style, options.rotation.life, options.rotation.easing));
            if (typeof options.color !== 'undefined') {
                this.emitter.addBehaviour(new Proton.Color(options.color.color1, options.color.color2));
            }

            if(typeof options.randomDrift !== 'undefined' && options.randomDrift !== null) {
                this.emitter.addSelfBehaviour(new Proton.RandomDrift(options.randomDrift.driftX, options.randomDrift.driftY, options.randomDrift.delay, options.randomDrift.life, options.randomDrift.easing));
            }

            if(typeof options.crossZone !== 'undefined' && options.crossZone !== null ) {
                this.emitter.addSelfBehaviour(new Proton.CrossZone(new Proton.RectZone(options.crossZone.zone.x, options.crossZone.zone.y, options.crossZone.zone.width, options.crossZone.zone.height), options.crossZone.type, options.crossZone.life, options.crossZone.easing));
            }

            this.emitter.p.x = 0;
            this.emitter.p.y = 0;
        }

        this.ui.addEmitter(this.emitter);

        this.initEvents();
    };

    ParticleEmitter.prototype.initEvents = function () {


        this.emitter.addEventListener(Proton.PARTICLE_CREATED, function(e) {
            var particle = e.particle;
            if (particle) {
                particle.sprite = new PIXI.Sprite(particle.target);
                if(this.particleParent) {
                    particle.p.x = this.x;
                    particle.p.y = this.y;
                    this.particleParent.addChild(particle.sprite);
                } else {
                    this.addChild(particle.sprite);
                }

            }
        }.bind(this));

        this.emitter.addEventListener(Proton.PARTICLE_UPDATE, function(e) {
            var particle = e.particle;
            if (particle && particle.sprite) {
                var particleSprite = particle.sprite;
                particleSprite.position.x = particle.p.x;
                particleSprite.position.y = particle.p.y;
                particleSprite.scale.x = particle.scale;
                particleSprite.scale.y = particle.scale;
                particleSprite.anchor.x = 0.5;
                particleSprite.anchor.y = 0.5;
                particleSprite.alpha = particle.alpha;
                particleSprite.rotation = particle.rotation * Math.PI / 180;
            }
        }.bind(this));

        this.emitter.addEventListener(Proton.PARTICLE_DEAD, function(e) {
            var particle = e.particle;
            if (particle && particle.sprite && particle.sprite.parent) {

                particle.sprite.parent.removeChild(particle.sprite);

                particle.sprite = null;
            }
        }.bind(this));

    };

    ParticleEmitter.prototype.emitOnce = function () {
        this.emitter.emit('once');
    };

    ParticleEmitter.prototype.start = function () {
        this.emitter.emit();

    };

    ParticleEmitter.prototype.stop = function () {
        this.emitter.stopEmit();
    };

    ParticleEmitter.prototype.destroy = function () {
        this.emitter.destroy();
    };

    return ParticleEmitter;
    
});