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

        Debug.log('Audio format ' + this.format);

        if (onReady && typeof onReady === "function") {
            onReady();
        }
    },

    setFormat: function(format) {
        this.format = format;
    },

    loadSounds: function(sounds, onProgress, onComplete) {
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
        while (sounds.length > 0) {
            var sound = sounds.pop();

            var music = !!sound.music;

            // don't load non-music tracks if we're not using web audio

                if (music) {

                    var sm = null;
                    if (typeof sound.duration !== 'undefined') {
                        sm = {};
                        sm[sound.id] =  { start: 0, end: sound.duration, loop: true};
                    }


                    if (this.musicSupported()) {
                        this.createSound({
                            id: sound.id,
                            url: sound.url,
                            volume: sound.volume,
                            autoLoad: sound.autoLoad,
                            onLoad: onLoad,
                            buffer: false,
                            loop: true,
                            spritemap: sm,
                            duration: sound.duration
                        });
                    }
                    else {
                        onLoad();
                    }
                } else {
                    if (this.sfxSupported()) {
                        this.createSound({
                            id: sound.id,
                            url: sound.url,
                            volume: sound.volume,
                            autoLoad: sound.autoLoad,
                            onLoad: onLoad,
                            spritemap: sound.spritemap,
                            duration: sound.duration
                        });
                    }
                    else {
                        onLoad();
                    }
                }

        }
    },

    createSound: function (config) {
        var i, l, sprite = {}, sound;

        if (config.spritemap) {
            for (i in config.spritemap) {
                sprite[i] = [
                    Math.round(config.spritemap[i].start * 1000),
                    Math.round(config.spritemap[i].end * 1000)
                ];
            }
        }


        var url = Platform.soundPathPrefix + '/' + this.format + '/' + config.url + '.' + this.format;
        sound = AbsoluteAudio.context.createAudioClip(url, config.onLoad, false, config.duration);

        if (sprite) {
            for (i in sprite) {
                this.sounds[i] = sound;
            }
        }

        this.sounds[config.id] = sound;
    },

    playSound: function(soundId, onComplete, delay) {
        if (this.sounds[soundId]) {
            this.sounds[soundId].play(delay/1000, this.isMusic(soundId), onComplete);
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
                if (!this.isMusic(s)) {
                    this.unmuteSound(s);
                }
            }
        }
        else {
            for (s in this.sounds) {
                if (!this.isMusic(s)) {
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

    usingWebAudio: function () {
        return AbsoluteAudio.context.usingWebAudio();
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
        return AbsoluteAudio.context.usingWebAudio();
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