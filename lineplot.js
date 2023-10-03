'use strict';

// TODO add slider that controls how many points of the function are
// plotted.
let x = linspace(-6, 6, 320);
// let y = x.map((v, _) => Math.sin(v * Math.PI));

// TODO: can I have a text box with JS code and "eval" this?
let y = x.map((v, _) => Math.sin(v * Math.PI) / (v * Math.PI));
// let y = x.map((v, _) => v ** 3);

let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

ctx.beginPath();
ctx.lineWidth = 2;
ctx.lineJoin = 'bevel';
ctx.strokeStyle = 'blue';

let points = dataToCanvasPoints(x, y, canvas.clientWidth, 5);
ctx.moveTo(points[0][0], points[0][1]);
for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i][0], points[i][1]);
}

ctx.stroke();

// linspace returns an array of numPoints values distributed linearly in
// the (inclusive) rane [start,end], just like Numpy's linspace.
function linspace(start, end, numPoints) {
    if (numPoints === undefined || numPoints < 2) {
        return [start, end];
    }

    const step = (end - start) / (numPoints - 1);
    return new Array(numPoints).fill(null).map((_, i) => start + i * step);
}

// dataToCanvasPoints takes data for a 2D plot (array of x and array of y
// values that have to be of the same length) and maps them to canvas points
// for plotting. For each i, y[i] should correspond to x[i] and they should
// be sorted from left to right.
// canvasSize is the width and height of the canvas (in
// pixels); canvasEdgeOffset is the blank offset (in pixels) from the
// canvas's edges for where the plot can go (this value can be 0).
// Returns an array of pairs - each pair is a point on the canvas.
function dataToCanvasPoints(xdata, ydata, canvasSize, canvasEdgeOffset) {
    if (x.length != y.length) {
        throw new Error(`x.length=${x.length} != y.length=${y.length}`);
    }
    // Calculate the x and y scale factors to know how to map x,y points to
    // canvas coordinates.
    let [xmin, xmax] = [Math.min(...x), Math.max(...x)];
    let xrange = xmax - xmin;
    let [ymin, ymax] = [Math.min(...y), Math.max(...y)];
    let yrange = ymax - ymin;

    const xSpan = canvasSize - 2 * canvasEdgeOffset;
    const xScale = xSpan / xrange;
    const ySpan = canvasSize - 2 * canvasEdgeOffset;
    const yScale = ySpan / yrange;

    let mapX = (x) => {
        let xoffset = x - xmin;
        return canvasEdgeOffset + xoffset * xScale;
    }

    let mapY = (y) => {
        let yoffset = y - ymin;
        return canvasSize - (canvasEdgeOffset + yoffset * yScale);
    }

    let result = new Array(x.length);
    for (let i = 0; i < x.length; i++) {
        result[i] = [mapX(x[i]), mapY(y[i])];
    }
    return result;
}