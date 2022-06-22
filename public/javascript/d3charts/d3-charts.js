var d3 = d3 || console.log("Warning: D3 Libraries are required (d3.js).");
d3.charts = {};

// Correlate separate arrays into an array suitable for the chart:
d3.charts.Correlate = function (xData, yData, labelData) {
    var data = [], label = "";

    // Validate all lengths are the same:
    if (xData.length !== yData.length) { console.log("xData and yData must have the same length."); }
    // Validate xData as an array of numbers.
    // Validate yData as an array of numbers.
    // Validate labelData as a string. 

    for (var i = 0, len = xData.length; i < len; i++) {
        if (labelData) { label = labelData[i]; }
        data.push([xData[i], yData[i], label]);
    }
    return data;
};

// Data configuration models:
d3.charts.models = d3.charts.models || {};

// Point to plot:
d3.charts.models.Point = function (config) {
    // Validate x is a number.
    // Validate y is a number.
    // validate radius is a number.
    // Validate color as a string?
    // Validate label as a string.
    // Validate callback as a function.
    var point = {
        x: config.x || undefined,
        y: config.y || undefined,
        radius: config.radius || 3,
        color: config.color || "#000000",
        label: config.label || "",
        callback: config.callback || function () { return; }
    };
    return point;
};

// Chart Configurator Documentation:
d3.charts.configurator = function () {
    var config = {

        // Target element to add svg component to:
        target: "targetContainer",

        // Title for the chart:
        title: "Chart Title",

        // data array for the charts. 
        data: [],

        // x and y data for the linear charts:
        xData: [], // x values
        yData: [], // y values
        labelData: [], // Label values

        // keys for the area chart groupings/areas
        keys: [],

        // x and y axis label for the chart:
        xAxisLabel: "Date Axis",
        yAxisLabel: "Numeric Axis",

        // width and height of the container:
        width: 600,
        height: 400,

        // Margin for the chart in the container.
        margin: { top: 20, right: 20, bottom: 30, left: 50 },

        // this caps the top end of both scales to the same scale (Not implemented):
        matchScale: true,

        // This parameter cuts white space in the chart to the data:
        trim: false,

        // min max of the axes:
        domain: { xMin: 0, yMin: 0, xMax: undefined, yMax: undefined }
    };
    return config;
};