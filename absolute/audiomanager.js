/**
 * Created with IntelliJ IDEA.
 * User: craig
 * Date: 4/23/13
 * Time: 5:08 PM
 * To change this template use File | Settings | File Templates.
 */

define(['absoluteaudio', 'absolute/debug', 'absolute/gameconfig', 'absolute/platform'], function (AbsoluteAudio, Debug, GameConfig, Platform) {

var AudioManager = {

    lastPlayed: 0,

    music: null,

    sounds: {},

    format: 'mp3',
    //format: 'm4a',
    //format: 'ogg',

    sfxEnabled: true,

    init: function(onReady) {

        audioTest = new Audio();
        var codecs = {
            m4a: !!(audioTest.canPlayType('audio/x-m4a;') || audioTest.canPlayType('audio/aac;')).replace(/^no$/,''),
            ogg: !!audioTest.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/,''),
            mp3: !!audioTest.canPlayType('audio/mpeg;').replace(/^no$/,'')
        };

        if (codecs.m4a) {
            this.format = 'm4a';
        } else if (codecs.ogg) {
             this.format = 'ogg';
        } else if (codecs.mp3) {
            this.format = 'mp3';
        }

        // force mp3 for IE
        if (Platform._isIE()) {
            this.format = 'mp3';
        }

        // need to force ogg for Chromium/node-webkit
        //this.format = 'ogg';

        Debug.log('Audio format ' + this.format);

        if (onReady && typeof onReady === "function") {
            onReady();
        }
    },

    setFormat: function(format) {
        this.format = format;
    },

    loadSounds: function(audioAssets, onProgress, onComplete) {
        if (!audioAssets) {
            onComplete();
            return;
        }

        this.audioAssets = audioAssets;

        if (this.usingWebAudio()) {
            this.loadClips(audioAssets, onProgress, onComplete);
        }
        else {
            // utilize the audio sprites
            this.createSound({
                id: 'as',
                url: 'as/as',
                volume: 100,
                onLoad: function () {
                    for (var i = 0, l = this.audioAssets.length; i < l; i += 1) {
                        var sound = this.audioAssets[i],
                            baseSound = this.sounds['as'];
                        this.sounds[sound.id] = AbsoluteAudio.context.createAudioSprite(baseSound, sound.start, sound.end);
                        onProgress(i / l);
                    }
                    onProgress(i / l);
                    this.setSfxEnabled(GameConfig.getVal("sfxEnabled"));
                    setTimeout(function () { onComplete() }, 500);
                }.bind(this),
                buffer: false,
                loop: false,
                duration: 0
            });
        }
    },

    loadClips: function(sounds, onProgress, onComplete) {
        var self = this;
        var total = sounds.length;
        var count = 0;

        var onLoad = function() {
            if (++count === total) {
                self.setSfxEnabled(GameConfig.getVal("sfxEnabled"));
                onProgress(count / total);
                onComplete();
            }
            else {
                onProgress(count / total);
            }
        };
        for (var i = 0; i < sounds.length; i += 1) {
            var sound = sounds[i];


                this.createSound({
                    id: sound.id,
                    url: sound.url,
                    volume: sound.volume,
                    onLoad: onLoad,
                    buffer: false,
                    loop: sound.loop,
                    duration: sound.end - sound.start
                });
        }
    },

    createSound: function (config) {
        var sound, url;

        url = Platform.getDocumentRoot() + Platform.soundPathPrefix + '/' + this.format + '/' + config.url + '.' + this.format;
        sound = AbsoluteAudio.context.createAudioClip(url, config.onLoad, false, config.duration);

        this.sounds[config.id] = sound;
    },

    playSound: function(soundId, onComplete, delay) {
        if (this.sounds[soundId]) {
            this.sounds[soundId].play(delay/1000, this.isMusic(soundId), onComplete);
        }
    },

    loopSound: function(soundId, onComplete, delay) {
        if (this.sounds[soundId]) {
            this.sounds[soundId].play(delay/1000, true, onComplete);
        }
    },

    stopSound: function (soundId) {
        if (this.sounds[soundId]) {
            this.sounds[soundId].stopping = true;
            this.sounds[soundId].stop();
        }
    },

    pauseSound: function (soundId) {
        if (this.sounds[soundId]) {
            this.sounds[soundId].pause();
        }
    },

    muteSound: function (soundId) {
        if (this.sounds[soundId]) {
            this.sounds[soundId].mute();
        }
    },

    unmuteSound: function (soundId) {
        if (this.sounds[soundId]) {
            this.sounds[soundId].unmute();
        }
    },

    setSfxEnabled: function(enabled) {
        this.sfxEnabled = enabled;
        GameConfig.setVal("sfxEnabled", enabled);

        var s;
        if (enabled) {
            for (s in this.sounds) {
                if (!this.isMusic(s) && s !== 'as') {
                    this.unmuteSound(s);
                }
            }
        }
        else {
            for (s in this.sounds) {
                if (!this.isMusic(s) && s !== 'as') {
                    this.muteSound(s);
                }
            }
        }
    },

    isSfxEnabled: function() {
        return this.sfxEnabled;
    },

    muteAll: function () {
        for (s in this.sounds) {
            this.muteSound(s);
        }
    },

    unmuteAll: function () {
        for (s in this.sounds) {
            this.unmuteSound(s);
        }
     },

    unmuteAllSfx: function () {
        for (s in this.sounds) {
            if (!this.isMusic(s)) {
                this.unmuteSound(s);
            }
        }
    },

    usingWebAudio: function () {
        return AbsoluteAudio.context.usingWebAudio() || AbsoluteAudio.context.usingCordovaAudio() || AbsoluteAudio.context.usingSoundManagerAudio();
    },

    isMusic: function (id) {
        return id.indexOf('music') !== -1;
    },

    sfxSupported: function () {
        return true;
    },

    musicSupported: function () {
        return true;
    },

    simulSoundSupport: function () {
        return AbsoluteAudio.context.usingWebAudio() || AbsoluteAudio.context.usingCordovaAudio() || AbsoluteAudio.context.usingSoundManagerAudio() || !GameConfig.getVal("musicEnabled");
    },

    primeClips: function () {
        var s;
        for (s in this.sounds) {
            this.sounds[s].prime();
        }
    }

};

    return AudioManager;
});