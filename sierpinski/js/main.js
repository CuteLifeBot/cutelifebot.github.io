GAME = {};



GAME.begin = function() {
    GAME.sierpLimit = 100;
    GAME.mainscreen = new Geometry.Polygon([[150,100],[350,100],[350,300],[150,300]]);
    GAME.gaskets = [
        new Geometry.Sierpinski([[205,405],[405,105],[605,505]], GAME.sierpLimit)
    ];
    GAME.points = 0;
    GAME.mousepoint = [GAME.size/2, GAME.size/2];
}

GAME.update = function(dt) {
    GAME.gaskets = Geometry.clipGaskets(GAME.gaskets, GAME.mainscreen);
    for(var k=0; k<GAME.gaskets.length; k++) {
        GAME.gaskets[k] = GAME.gaskets[k].scale(GAME.mousepoint, 1+0.0005*dt);
    }
    GAME.actualDt = dt;
}

GAME.redraw = function() {
    GAME.canvas.clear();
    GAME.canvas.text(''+GAME.actualDt).move(10,10);
    GAME.mainscreen.draw(GAME.canvas).fill('none').stroke({color: '#eee', width:2});
    for(var k=0; k < GAME.gaskets.length; k++) {
        GAME.gaskets[k].draw(GAME.canvas);
    }
    GAME._drawCursor_();
}



GAME._drawCursor_ = function() {
    GAME.canvas.line(GAME.mousepoint[0], GAME.mousepoint[1]-5, GAME.mousepoint[0], GAME.mousepoint[1]+5).stroke({color: '#700', width: 2});
    GAME.canvas.line(GAME.mousepoint[0]-5, GAME.mousepoint[1], GAME.mousepoint[0]+5, GAME.mousepoint[1]).stroke({color: '#700', width: 2});
}



$(document).ready(function() {
    var scale = 0.9; // Canvas will a square that is 90% the width of the window's smallest dimension
    var gridWidthHeight = 0.9*Math.min($(document).width(), $(document).height());
    GAME.canvas = SVG('canvas').size(gridWidthHeight, gridWidthHeight);
    GAME.size = gridWidthHeight;
    GAME.canvasPos = getPosition(GAME.canvas.node);
    GAME.timestamp = null;
    GAME.dt = 30; // milliseconds

    GAME.canvas.mousemove(function(e) {
        GAME.mousepoint = [e.clientX-GAME.canvasPos[0], e.clientY-GAME.canvasPos[1]];
    });

    // Main loop of the game, updates approximately once every GAME.dt milliseconds
    GAME.mainloop = function(timestamp) {
        // At beginning of game
        if(GAME.timestamp === null) {
            GAME.timestamp = timestamp;
            GAME.begin();
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

    function getPosition(element) {
        var xPosition = 0;
        var yPosition = 0;

        while(element) {
            xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
            yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
            element = element.offsetParent;
        }
        return [xPosition, yPosition];
    }

});