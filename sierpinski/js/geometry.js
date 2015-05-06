var Geometry = Geometry || {};

Geometry.Polygon = function(verticies) {
    this.verticies = verticies;
}

// Provided an SVN.draw as an argument, draws the polygon onto that
// SVN canvas.  Returns the SVN object
Geometry.Polygon.prototype.draw = function(canvas) {
    return canvas.polygon(this.verticies);
}

// Given another Geometry.Polygon, returns true if the polygons intersect,
// false otherwise
Geometry.Polygon.prototype.intersects = function(other) {
    // TODO: Implement
    var vert1 = [];
    for(var i=0; i<this.verticies.length; i++) {
        vert1.push({x: this.verticies[i][0], y: this.verticies[i][1]});
    }
    var vert2 = [];
    for(var j=0; j<other.verticies.length; j++) {
        vert2.push({x: other.verticies[j][0], y: other.verticies[j][1]});
    }
    var intersection = intersectionPolygons(vert1, vert2);
    return intersection.length === 0;
}

// Get the area of this polygon
Geometry.Polygon.prototype.area = function() {
    var area = 0.0;
    var j = this.verticies.length-1;
    for(var i=0; i<this.verticies.length; i++) {
        area += (this.verticies[j][0]+this.verticies[i][0])*(this.verticies[j][1]-this.verticies[i][1]);
        j = i;
    }
    return Math.abs(area/2.0);
}



// minArea = if the area of a Sierpinski triangle is less than or equal to this area, then
//           we just draw a triangle instead of recursively drawing three new Sierpinskis.
Geometry.Sierpinski = function(verticies, minArea) {
    Geometry.Polygon.call(this, verticies);
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