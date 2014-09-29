/**
 * Created with IntelliJ IDEA.
 * User: craig
 * Date: 5/28/13
 * Time: 8:32 PM
 * To change this template use File | Settings | File Templates.
 */
define(['absolute/gameconfig', 'absolute/audiomanager', 'absoluteaudio'], function(GameConfig, AudioManager, AbsoluteAudio) {

    var MusicManager = {

        currentTrack: null,

        isMuted: function () {
            return !GameConfig.getVal("musicEnabled");
        },

        playMusic: function (id) {
            if (id !== this.currentTrack) {
                if (this.currentTrack) {
                    AudioManager.stopSound(this.currentTrack);
                }
                this.currentTrack = id;
                if (this.isMuted()) {
                    AudioManager.muteSound(this.currentTrack);
                }
                else {
                    AudioManager.unmuteSound(this.currentTrack);
                }

                if (AudioManager.simulSoundSupport() || !AudioManager.isSfxEnabled()) {

                    if(AbsoluteAudio.context.usingWebAudio() || AbsoluteAudio.context.usingSoundManagerAudio()) {
                        AudioManager.playSound(this.currentTrack);
                    } else {
                        window.setTimeout(function () {
                            AudioManager.playSound(this.currentTrack);
                        }.bind(this), 500);
                    }
                }
            }
        },

        stopMusic: function () {
            AudioManager.stopSound(this.currentTrack);
            this.currentTrack = null;
        },

        setMuted: function (muted, temp) {
            var _temp = !!temp;

            if (!_temp) {
                if (muted === this.isMuted()) {
                    return;
                }
                GameConfig.setVal("musicEnabled", !muted);
            }

            if (this.currentTrack) {
                if (muted) {
                    AudioManager.muteSound(this.currentTrack);
                } else {
                    AudioManager.unmuteSound(this.currentTrack);
                }
            }
        }
    };

    return MusicManager;
});