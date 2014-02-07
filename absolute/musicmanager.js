/**
 * Created with IntelliJ IDEA.
 * User: craig
 * Date: 5/28/13
 * Time: 8:32 PM
 * To change this template use File | Settings | File Templates.
 */
define(['absolute/gameconfig', 'absolute/audiomanager'], function(GameConfig, AudioManager) {

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
                    AudioManager.playSound(this.currentTrack);
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