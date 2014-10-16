define([],function(){
    MathUtils = {
        distance: function (x1, y1, x2, y2) {
            return Math.sqrt(Math.pow((x1 - x2), 2) + Math.pow((y1 - y2), 2));
        },

        degreesToRadians: function (degrees) {
            return degrees * Math.PI / 180;
        }
    }
    return MathUtils;
});
