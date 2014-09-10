/**
 * Created by lisawick on 4/16/14.
 */
define(['absolute/textutils'],
    function (TextUtils) {

    var DigitAnimator = function() {
        this.initDigitAnimator();
    };

    DigitAnimator.prototype.initDigitAnimator = function() {
    };

    /*
        This assumes integer values for start and end and assumes increasing value
     */
     DigitAnimator.prototype.animate = function (digitLabel, options, callback) {
        var start = options.start;
        var end = options.end;
        var duration = (typeof options.duration !== 'undefined' ? options.duration : 0);
        var formatInt = (typeof options.formatInt !== 'undefined' ? options.formatInt : false);
        var onComplete = (typeof options.onComplete === 'function' ? options.onComplete : null);

        if (typeof start !== 'number') {
            return;
        }
        if (typeof end !== 'number') {
            end = start;
        }
        if (start == end || duration <= 0) {
            if (formatInt) {
                digitLabel.setText(TextUtils.formatInt(end));
            } else {
                digitLabel.setText(String(end));
            }
            if (typeof callback === 'function') {
                callback();
            }
        } else {
            var range = Math.abs(end - start);
            var minTime = 50; // ms

            var stepTime = Math.abs(Math.floor(duration / range));

            stepTime = Math.max(stepTime, minTime);

            var startTime = new Date().getTime();
            var endTime = startTime + duration;
            var timer;

            function run() {
                var now = new Date().getTime();
                var remaining = Math.max((endTime - now) / duration, 0);
                var value;

                if (end > start) {
                    value = Math.round(end - (remaining * range));
                } else {
                    value = Math.round(end + (remaining * range));
                }

                if (formatInt) {
                    digitLabel.setText(TextUtils.formatInt(value));
                } else {
                    digitLabel.setText(String(value));
                }
                if (typeof callback === 'function') {
                    callback();
                }

                if (end > start) {
                    if (value >= end) {
                        clearInterval(timer);
                        if (onComplete) {
                            onComplete();
                        }
                    }
                } else {
                    if (value <= end) {
                        clearInterval(timer);
                        if (onComplete) {
                            onComplete();
                        }
                    }
                }
            }
            timer = setInterval(run, stepTime);
            run();
        }
    };

    return DigitAnimator;
});
