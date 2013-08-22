{
    "baseUrl": "../lib",
    "paths": {
        "absolute": "../absolute"
    },
    "include": ["../tools/almond", "absolute"],
    "exclude": ["pixi", "tween", "absoluteaudio"],
    "out": "../dist/absolute.js",
    "wrap": {
        "startFile": "wrap.start",
        "endFile": "wrap.end"
    },
    "optimize": "none"
}
