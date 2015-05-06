GAME = {};

GAME.update = function(dt) {
    
}

GAME.redraw = function() {
    GAME.canvas.clear();
    
}

$(document).ready(function() {
    var scale = 0.9; // Canvas will a square that is 90% the width of the window's smallest dimension
    var gridWidthHeight = 0.9*Math.min($(document).width(), $(document).height());
    GAME.canvas = SVG('canvas').size(gridWidthHeight, gridWidthHeight);
    GAME.timestamp = null;
    GAME.dt = 30; // milliseconds

    // Main loop of the game, updates approximately once every GAME.dt milliseconds
    GAME.mainloop = function(timestamp) {
        // At beginning of game
        if(GAME.timestamp === null) {
            GAME.timestamp = timestamp;
            return;
        }
        // During gameplay
        var dt = timestamp - GAME.timestamp;
        if(dt >= GAME.dt) {
            GAME.timestamp = timestamp;
            //UPDATE
            GAME.update(dt);
            //REDRAW
            GAME.redraw();
        }
    };



    /*
     * WARNING - MAGIC BELOW
     */
    var animFrame = window.requestAnimationFrame ||
              window.webkitRequestAnimationFrame ||
              window.mozRequestAnimationFrame    ||
              window.oRequestAnimationFrame      ||
              window.msRequestAnimationFrame     ||
           null ;
    if (animFrame !== null) {
        var recursiveAnim = function() {
            GAME.mainloop(Date.now());
            animFrame(recursiveAnim, GAME.canvas.node);
        };
        // start the mainloop
        animFrame(recursiveAnim, GAME.canvas.node);
    } else {
        setInterval(
            function() {
                GAME.mainloop(Date.now())
            },
            GAME.dt
        );
    }
    /*
     * WARNING - MAGIC ABOVE
     */

});