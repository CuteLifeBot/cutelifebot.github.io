var Geometry = {};

Geometry.Polygon = function(verticies) {
    this.verticies = verticies;
}

// Provided an SVN.draw as an argument, draws the polygon onto that
// SVN canvas.  Returns the SVN object
Geometry.Polygon.prototype.draw = function(canvas, isBoundary) {
    if (isBoundary) {
        return canvas.polygon(this.verticies);
    }
    var IMG_WIDTH = 678.0;
    var IMG_HEIGHT = 582.0;
    var OPACITY_FACTOR = 2.0; // Chosen somewhat arbitrarily, depends on GAME.sierpLimit
    var maxvert_X = Math.max(this.verticies[0][0], this.verticies[1][0], this.verticies[2][0]);
    var minvert_X = Math.min(this.verticies[0][0], this.verticies[1][0], this.verticies[2][0]);
    var minvert_Y = Math.min(this.verticies[0][1], this.verticies[1][1], this.verticies[2][1]);
    var width = maxvert_X-minvert_X;
    var scaleFactor = width/IMG_WIDTH;

    var img = canvas.image('img/base_678x582.png');
    img.size(IMG_WIDTH*scaleFactor, IMG_HEIGHT*scaleFactor).move(minvert_X, minvert_Y).opacity(1-OPACITY_FACTOR*scaleFactor);
    return img;
}

// Given another Geometry.Polygon, returns true if the polygons intersect,
// false otherwise
Geometry.Polygon.prototype.intersects = function(other) {
    var vert1 = [];
    for(var i=0; i<this.verticies.length; i++) {
        vert1.push({x: this.verticies[i][0], y: this.verticies[i][1]});
    }
    var vert2 = [];
    for(var j=0; j<other.verticies.length; j++) {
        vert2.push({x: other.verticies[j][0], y: other.verticies[j][1]});
    }
    var intersection = intersectionPolygons(vert1, vert2);
    return intersection.length > 0;
}

// Get the area of this polygon
Geometry.Polygon.prototype.area = function() {
    var value = 0.0;
    var j = this.verticies.length-1;
    for(var i=0; i<this.verticies.length; i++) {
        value += (this.verticies[j][0]+this.verticies[i][0])*(this.verticies[j][1]-this.verticies[i][1]);
        j = i;
    }
    return Math.abs(value/2.0);
}

// Scales a polygon by factor relative to point (an array of two floats)
// Does NOT mutate the polygon, but rather returns a new one
Geometry.Polygon.prototype.scale = function(point, factor) {
    var newVerticies = [];
    for(var k=0; k<this.verticies.length; k++) {
        newVerticies[k] = [
            (this.verticies[k][0]-point[0])*factor + point[0],
            (this.verticies[k][1]-point[1])*factor + point[1]
        ];
    }
    return new Geometry.Polygon(newVerticies);
}



// minArea = if the area of a Sierpinski triangle is less than or equal to this area, then
//           we just draw a triangle instead of recursively drawing three new Sierpinskis.
Geometry.Sierpinski = function(verticies, minArea) {
    Geometry.Polygon.call(this, verticies);
    this.minArea = minArea;
    if(this.area() <= minArea) {
        this.nestedShapes = [new Geometry.Polygon(verticies)];
    } else {
        var midpoints = [
            [(verticies[0][0]+verticies[1][0])/2.0, (verticies[0][1]+verticies[1][1])/2.0],
            [(verticies[1][0]+verticies[2][0])/2.0, (verticies[1][1]+verticies[2][1])/2.0],
            [(verticies[2][0]+verticies[0][0])/2.0, (verticies[2][1]+verticies[0][1])/2.0],
        ];
        this.nestedShapes = [
            new Geometry.Sierpinski([verticies[0], midpoints[0], midpoints[2]], minArea),
            new Geometry.Sierpinski([midpoints[0], verticies[1], midpoints[1]], minArea),
            new Geometry.Sierpinski([midpoints[2], midpoints[1], verticies[2]], minArea)
        ];
    }
}

Geometry.Sierpinski.prototype = Object.create(Geometry.Polygon.prototype);

// Returns an array of drawn objects (nested)
Geometry.Sierpinski.prototype.draw = function(canvas) {
    var drawables = [];
    for(var i=0; i<this.nestedShapes.length; i++) {
        drawables[i] = this.nestedShapes[i].draw(canvas);
    }
    return drawables;
}

// Returns a new Sierpinski gasket, scaled like above (small triangles that grow
// are resolved into gaskets)
Geometry.Sierpinski.prototype.scale = function(point, factor) {
    // Object.getPrototypeOf(...).scale.call(...) is like doing super(point, factor)
    return new Geometry.Sierpinski(
        Object.getPrototypeOf(Geometry.Sierpinski.prototype).scale.call(this, point, factor).verticies,
        this.minArea
    );
}



// This function takes an array of gaskets, splits gaskets which are partially or entirely off
// screen, then removes gaskets that are entirely off screen.  This allows us to infinitely zoom
// into a gasket while maintaining O(1) memory with respect to time.
// Parameters: an array of Gaskets, a single rectangle
// Returns: an array of Gaskets
Geometry.clipGaskets = function(arrayOfGaskets, rect) {
    var remainingGaskets = [];
    var notBaseCase = false;
    for(var k=0; k<arrayOfGaskets.length; k++) {
        if(arrayOfGaskets[k].nestedShapes.length === 3) {
            for(var i=0; i<arrayOfGaskets[k].nestedShapes.length; i++) {
                if(arrayOfGaskets[k].nestedShapes[i].intersects(rect)) {
                    remainingGaskets.push(arrayOfGaskets[k].nestedShapes[i]);
                }
            }
            notBaseCase = true;
        } else {
            if(arrayOfGaskets[k].intersects(rect)) {
                remainingGaskets.push(arrayOfGaskets[k]);
            }
        }
    }
    // Flatten array and recursively clip if necessary
    if(notBaseCase) {
        return Geometry.clipGaskets(remainingGaskets, rect);
    } else {
        return remainingGaskets;
    }
}