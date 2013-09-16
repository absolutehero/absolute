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

    loadSounds: function(audioAssets, onProgress, onComplete) {
        this.audioAssets = audioAssets;

        if (this.usingWebAudio()) {
            this.loadClips(audioAssets.clips, onProgress, onComplete);
        }
        else {
            // utilize the audio sprites
            this.createSound({
                id: 'as',
                url: 'as',
                volume: 100,
                onLoad: function () {
                    for (var i = 0, l = this.audioAssets.clips.length; i < l; i += 1) {
                        var sound = this.audioAssets.clips[i],
                            soundInfo = this.getClipInfo(sound.id),
                            baseSound = this.sounds['as'];
                        this.sounds[sound.id] = AbsoluteAudio.context.createAudioSprite(baseSound, soundInfo.start, soundInfo.end);
                        onProgress(i / l);
                    }
                    onProgress(i / l);
                    setTimeout(function () { onComplete() }, 500);
                }.bind(this),
                buffer: false,
                loop: false,
                duration: 0
            });
        }
    },

    getClipInfo: function(clipId) {
        // return an object describing the clip, including url, start, end and loop
        var i, l, clip = null, spriteInfo;
        for (i = 0, l = this.audioAssets.clips.length; i < l; i += 1) {

            if (this.audioAssets.clips[i].id === clipId) {
                clip = this.audioAssets.clips[i];
                break;
            }
        }

        if (clip) {
            spriteInfo = this.audioAssets.sprites[clip.url];

            if (spriteInfo) {
                return {
                    url: clip.url,
                    start: spriteInfo.start,
                    end: spriteInfo.end,
                    volume: clip.volume,
                    loop: clip.music
                }
            }
        }

        return {};

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
            var sound = sounds[i],
                soundInfo = this.getClipInfo(sound.id);

                this.createSound({
                    id: sound.id,
                    url: soundInfo.url,
                    volume: soundInfo.volume,
                    onLoad: onLoad,
                    buffer: false,
                    loop: soundInfo.loop,
                    duration: soundInfo.end - soundInfo.start
                });
        }
    },

    createSound: function (config) {
        var sound, url;

        url = Platform.soundPathPrefix + '/' + this.format + '/' + config.url + '.' + this.format;
        sound = AbsoluteAudio.context.createAudioClip(url, config.onLoad, false, config.duration);

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
        return AbsoluteAudio.context.usingWebAudio() || !GameConfig.getVal("musicEnabled");
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