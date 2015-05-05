GAME = {};

$(document).ready(function() {
    var scale = 0.9; // Canvas will a square that is 90% the width of the window's smallest dimension
    var gridWidthHeight = 0.9*Math.min($(document).width(), $(document).height());
    GAME.canvas = SVG('canvas').size(gridWidthHeight, gridWidthHeight);
});