GAME = {};



GAME.begin = function() {
    GAME.score=0;
    GAME.zoomRate = 0.00001;
    GAME.mainscreen = new Geometry.Polygon([[0,0], [0, GAME.size], [GAME.size, GAME.size], [GAME.size, 0]]);
    GAME.gaskets = [
        new Geometry.Sierpinski(
            [[GAME.size*0.07,GAME.size*0.60],[GAME.size*0.85,GAME.size*0.75],[GAME.size*0.56,GAME.size*0.08]],
            GAME.sierpLimit
        )
    ];
    GAME.points = 0;
    GAME.mousepoint = [GAME.size/2, GAME.size/2];
}

GAME.update = function(dt) {
    if(GAME.inProgress) {
        GAME.gaskets = Geometry.clipGaskets(GAME.gaskets, GAME.mainscreen);
        for(var k=0; k<GAME.gaskets.length; k++) {
            GAME.gaskets[k] = GAME.gaskets[k].scale(GAME.mousepoint, 1+GAME.zoomRate*dt);
        }
        GAME.actualDt = dt;
        GAME.score += Math.floor(dt/10);
        GAME.highScore = Math.max(GAME.score, GAME.highScore);
        GAME.zoomRate += (5e-8)*dt;
        // End the game
        if(GAME.gaskets.length === 0) {
            GAME.inProgress = false;
        }
    } else {

    }
}

GAME.redraw = function() {
    GAME.canvas.clear();

    if(GAME.inProgress) {
        GAME.mainscreen.draw(GAME.canvas).fill('none').stroke({color: '#eee', width:2});
        for(var k=0; k < GAME.gaskets.length; k++) {
            GAME.gaskets[k].draw(GAME.canvas);
        }
    } else {
        GAME.canvas.text('CLICK ANYWHERE TO TRY AGAIN').center(GAME.size/2,GAME.size/2);
    }

    GAME.canvas.text('SCORE:      '+GAME.score).move(10,10);
    GAME.canvas.text('HIGH SCORE: '+GAME.highScore).move(10,50);
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
    GAME.canvasPos = [10, 10];
    GAME.timestamp = null;
    GAME.sierpLimit = Math.pow(GAME.size*0.02, 2);
    GAME.dt = 30; // milliseconds
    GAME.inProgress = true;
    GAME.highScore = 0;

    GAME.canvas.mousemove(function(e) {
        GAME.mousepoint = [e.clientX-GAME.canvasPos[0], e.clientY-GAME.canvasPos[1]];
    });

    GAME.canvas.mouseup(function(e) {
        if(!GAME.inProgress) {
            GAME.inProgress = true;
            GAME.begin();
        }
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

});