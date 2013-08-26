{
    "baseUrl": "../",
    "paths": {
        "absolute": "absolute",
	    "pixi": "bower_components/pixi/bin/pixi.dev",
	    "tween": "bower_components/tweenjs/src/Tween",
	    "absoluteaudio": "../absoluteaudio/absoluteaudio"
    },
    "include": ["tools/almond", "absolute"],
    "exclude": ["pixi", "tween", "absoluteaudio"],
    "out": "../dist/absolute.js",
    "wrap": {
        "startFile": "wrap.start",
        "endFile": "wrap.end"
    },
    "optimize": "none"
}
