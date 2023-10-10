'use strict';

const Canvas = document.getElementById("plot");
const Ctx = Canvas.getContext("2d");
const CanvasEdgeOffset = 5;

const YxBox = document.getElementById("yx");
const NumpointsBox = document.getElementById("numpoints");
const XstartBox = document.getElementById("xstart");
const XendBox = document.getElementById("xend");
const PlotButton = document.getElementById("plotbutton");
const InterpolateCheckbox = document.getElementById("enable-interpolate");
const InterpolateBox = document.getElementById("interpolate-points");
const ShowpointsBox = document.getElementById("show-points");
PlotButton.addEventListener("mousedown", onPlot);
InterpolateCheckbox.addEventListener("change", onStateChange);

// Initial values for UI elements.
YxBox.value = "Math.sin(Math.PI * x)";
NumpointsBox.value = 200;
XstartBox.value = -4;
XendBox.value = 4;

onStateChange();
onPlot();

// -----------------------------------------------------------------------------

function onPlot() {
    let yx = YxBox.value;
    let numpoints = Number(NumpointsBox.value);
    let xstart = Number(XstartBox.value);
    let xend = Number(XendBox.value);
    let numInterpolate = -1;
    if (InterpolateCheckbox.checked) {
        numInterpolate = Number(InterpolateBox.value);
        if (isNaN(numInterpolate) || numInterpolate < numpoints) {
            alert(`invalid number of interpolation points: ${numInterpolate}`);
            return;
        }
    }

    drawPlot(yx, xstart, xend, numpoints, numInterpolate);
}

function onStateChange() {
    InterpolateBox.disabled = !InterpolateCheckbox.checked;
}

function drawPlot(yx, xstart, xend, numpoints, numInterpolate) {
    console.log(`drawPlot(${yx}, ${xstart}, ${xend}, ${numpoints})`);
    let xdata = linspace(xstart, xend, numpoints);
    let ydata = xdata.map((x, _) => eval(yx));

    // originalPoints are the original calculated points (in canvas coordinates)
    let originalPoints = dataToCanvasPoints(xdata, ydata, Canvas.clientWidth, CanvasEdgeOffset);

    // We draw either originalPoints or interpolated points, depending on
    // whether interpolation is enabled.
    let drawnPoints = originalPoints;
    if (numInterpolate > 0) {
        let [pxs, pys] = doInterpolate(xdata, ydata, numInterpolate);
        drawnPoints = dataToCanvasPoints(pxs, pys, Canvas.clientWidth, CanvasEdgeOffset);
    }

    Ctx.clearRect(0, 0, Canvas.width, Canvas.height);
    Ctx.beginPath();
    Ctx.lineWidth = 2;
    Ctx.lineJoin = 'bevel';
    Ctx.strokeStyle = 'blue';
    Ctx.moveTo(drawnPoints[0][0], drawnPoints[0][1]);
    for (let i = 1; i < drawnPoints.length; i++) {
        Ctx.lineTo(drawnPoints[i][0], drawnPoints[i][1]);
    }
    Ctx.stroke();

    // Show the points themselves; this is always the original points.
    if (ShowpointsBox.checked) {
        Ctx.fillStyle = 'red';
        for (let i = 0; i < originalPoints.length; i++) {
            Ctx.beginPath();
            Ctx.arc(originalPoints[i][0], originalPoints[i][1], 3, 0, 2 * Math.PI, false);
            Ctx.fill();
            Ctx.closePath();
        }
    }
}

// linspace returns an array of numPoints values distributed linearly in
// the (inclusive) range [start,end], just like Numpy's linspace.
function linspace(start, end, numPoints) {
    if (numPoints === undefined || numPoints < 2) {
        return [start, end];
    }

    const step = (end - start) / (numPoints - 1);
    return new Array(numPoints).fill(null).map((_, i) => start + i * step);
}

// dataToCanvasPoints takes data for a 2D plot (array of x and array of y values
// that have to be of the same length) and maps them to canvas points for
// plotting. For each i, y[i] should correspond to x[i] and they should be
// sorted from left to right.
//
// canvasSize is the width and height of the canvas (in pixels);
// canvasEdgeOffset is the blank offset (in pixels) from the canvas's edges for
// where the plot can go (this value can be 0). Returns an array of pairs - each
// pair is a point on the canvas.
function dataToCanvasPoints(x, y, canvasSize, canvasEdgeOffset) {
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
