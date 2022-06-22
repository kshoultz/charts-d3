var d3 = d3 || console.log("Warning: D3 Libraries are required (d3.js).");
d3.charts = d3.charts || console.log("Warning: D3 charts Libraries are required (charts/d3-charts.js).");

// TODO: Figure out how to use the function properly
d3.charts.Area = function (config) {
    var parseTime = d3.timeParse("%d-%b-%y");

    // Configuration Parameters:
    var target = "#" + config.target || "body",
        data = config.data || [
            { key: parseTime("24-Apr-07"), value: 43.24 },
            { key: parseTime("25-Apr-07"), value: 55.35 },
            { key: parseTime("26-Apr-07"), value: 68.84 },
            { key: parseTime("27-Apr-07"), value: 79.92 },
            { key: parseTime("30-Apr-07"), value: 89.80 }
        ],
        yAxisLabel = config.yAxisLabel || "Numeric Axis",
        xAxisLabel = config.xAxisLabel || "Date Axis",
        width = config.width || 600,
        height = config.height || 400,
        margin = config.margin || { top: 20, right: 20, bottom: 30, left: 50 },
        trim = config.trim || false;

    // SVG Definition:
    var svg = d3.select(target)
        .append("svg")
        .attr("width", width)
        .attr("height", height),
        chartWidth = +svg.attr("width") - margin.left - margin.right,
        chartHeight = +svg.attr("height") - margin.top - margin.bottom;

    // Grouping Definition:
    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Left Scale:
    var x = d3.scaleTime()
        .rangeRound([0, chartWidth]);

    // Bottom Scale:
    var y = d3.scaleLinear()
        .rangeRound([chartHeight, 0]);

    // Area Binding:
    var area = d3.area()
        .x(function (d) { return x(d.key); })
        .y1(function (d) { return y(d.value); });

    // Domain Ranges:
    x.domain(d3.extent(data, function (d) { return d.key; }));
    if (trim === false) {
        y.domain([0, d3.max(data, function (d) { return d.value; })]);
    } else {
        y.domain(d3.extent(data, function (d) { return d.value; }));
    }

    // Define Area:
    area.y0(y(0));

    // Area Path:
    g.append("path")
        .datum(data)
        .attr("fill", "steelblue")
        .attr("d", area);

    // Bottom Axis:
    g.append("g")
        .attr("transform", "translate(0," + chartHeight + ")")
        .call(d3.axisBottom(x))
        .append("text")
            .attr("fill", "#000")
            .attr("y", -10)
            .attr("x", chartWidth)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .text(xAxisLabel);

    // Left Axis:
    g.append("g")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text(yAxisLabel);
}


var d3 = d3 || console.log("Warning: D3 Libraries are required (d3.js)."); 
d3.charts = d3.charts || console.log("Warning: D3 charts Libraries are required (charts/d3-charts.js).");

// TODO: Figure out how to use the function properly
d3.charts.LineChart = function (config) {
    var parseTime = d3.timeParse("%d-%b-%y");
    var bisectDate = d3.bisector(function (d) { return d.key; }).left;

    // Configuration Parameters:
    var target = "#" + config.target || "body",
        data = config.data || [
            { key: parseTime("24-Apr-07"), value: 43.24 },
            { key: parseTime("25-Apr-07"), value: 55.35 },
            { key: parseTime("26-Apr-07"), value: 68.84 },
            { key: parseTime("27-Apr-07"), value: 79.92 },
            { key: parseTime("30-Apr-07"), value: 89.80 }
        ],
        yAxisLabel = config.yAxisLabel || "Numeric Axis",
        xAxisLabel = config.xAxisLabel || "Date Axis",
        width = config.width || 600,
        height = config.height || 400,
        margin = config.margin || { top: 20, right: 20, bottom: 30, left: 50 },
        trim = config.trim || false;

    // SVG Definition:
    var svg = d3.select(target)
        .append("svg")
        .attr("width", width)
        .attr("height", height),
        chartWidth = +svg.attr("width") - margin.left - margin.right,
        chartHeight = +svg.attr("height") - margin.top - margin.bottom;

    // Grouping Definition:
    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Left Scale:
    var x = d3.scaleTime()
        .rangeRound([0, chartWidth]);

    // Bottom Scale:
    var y = d3.scaleLinear()
        .rangeRound([chartHeight, 0]);

    // Plot definition:
    var line = d3.line()
        .x(function (d) { return x(d.key); })
        .y(function (d) { return y(d.value); });

    // Domain Ranges:
    x.domain(d3.extent(data, function (d) { return d.key; }));
    if (trim === false) {
        y.domain([0, d3.max(data, function (d) { return d.value; })]);
    } else {
        y.domain(d3.extent(data, function (d) { return d.value; }));
    }

    // Line Path:
    g.append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-linejoin", "round")
        .attr("stroke-linecap", "round")
        .attr("stroke-width", 1.5)
        .attr("d", line);

    // Bottom Axis:
    g.append("g")
        .attr("transform", "translate(0," + chartHeight + ")")
        .call(d3.axisBottom(x))
            .append("text")
            .attr("fill", "#000")
            .attr("y", -10)
            .attr("x", chartWidth)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .text(xAxisLabel);

    // Left Axis:
    g.append("g")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text(yAxisLabel);

    // Focus for cursor location:
    var focus = g.append("g")
        .attr("class", "focus")
        .attr("display", "none");

    // Circle Highlight:
    focus.append("circle")
        .attr("r", 4.5);

    // Text for Circle Highlight:
    focus.append("text")
        .attr("x", 9)
        .attr("dy", ".353em");

    // 
    focus.append('line')
        .attr("id", "focusLineX")
        .attr("class", "focusLine");

    //
    focus.append('line')
        .attr("id", "focusLineY")
        .attr("class", "focusLine");


    // Overlay elemment to respond to the cursor position:
    g.append("rect")
        .attr("class", "overlay")
        .attr("width", chartWidth)
        .attr("height", chartHeight)
        .on("mouseover", function () { focus.attr("display", null); }) // May clear other styles. 
        .on("mouseout", function () { focus.attr("display", "none"); }) // May clear other styles. 
        .on("mousemove", mousemove);

    // Callback for overlay info:
    function mousemove() {
        var x0 = x.invert(d3.mouse(this)[0]),
            i = bisectDate(data, x0, 1),
            d0 = data[i - 1],
            d1 = data[i],
            d = x0 - d0.date > d1.date - x0 ? d1 : d0;
        focus.attr("transform", "translate(" + x(d.key) + "," + y(d.value) + ")");
        focus.select("text").text(d.value);

        focus.select("focusLineX")
            .attr("x1", x(d.key)).attr("y1", y(y.Domain[0]))
            .attr("x2", x(d.key)).attr("y2", y(y.Domain[1]));
        focus.select("focusLineY")
            .attr("transform", "translate(" + x(d.key) + "," + y(d.value) + ")")
            .attr("x1", x(y.Domain[0])).attr("y1", y(d.value))
            .attr("x2", x(y.Domain[1])).attr("y2", y(d.value));
    }
};
var d3 = d3 || console.log("Warning: D3 Libraries are required (d3.js).");
d3.charts = d3.charts || console.log("Warning: D3 charts Libraries are required (charts/d3-charts.js).");

// TODO: Figure out how to use the function properly
d3.charts.Sand = function (config) {

    // Configuration Parameters:
    var target = "#" + config.target || "body",
        data = config.data || [],
        keys = config.keys || [],
        yAxisLabel = config.yAxisLabel || "Numeric Axis",
        xAxisLabel = config.xAxisLabel || "Date Axis",
        width = config.width || 600,
        height = config.height || 400,
        margin = config.margin || { top: 20, right: 130, bottom: 30, left: 100 },
        trim = config.trim || false;

    var filteredOut = [];
    var filteredData;
    var parseDate = d3.timeParse('%Y');
    var formatSi = d3.format(".3s");
    var formatNumber = d3.format(".1f"),
        formatBillion = function (x) { return formatNumber(x / 1e9); };

    var svg = d3.select(target)
        .append("svg")
        .attr("width", width)
        .attr("height", height);


    // Define the div for the tooltip
    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    var chartWidth = +svg.attr("width") - margin.left - margin.right,
        chartHeight = +svg.attr("height") - margin.top - margin.bottom;

    // Grouping Definition:
    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Left Scale:
    var x = d3.scaleTime()
        .rangeRound([0, chartWidth]);

    // Bottom Scale:
    var y = d3.scaleLinear()
        .rangeRound([chartHeight, 0]);

    // Color scale:
    var color = d3.scaleOrdinal(d3.schemeCategory20);

    // x Axis:
    var xAxis = d3.axisBottom()
        .scale(x);

    // y Axis:
    var yAxis = d3.axisLeft()
        .scale(y)
        .tickFormat(formatBillion);

    // Area Definition:
    var area = d3.area()
        .x(function (d) {
            return x(d.data.date);
        })
        .y0(function (d) { return y(d[0]); })
        .y1(function (d) { return y(d[1]); });
    
    // Legend Click method:
    legendClick = function (d, i) {
        var exist = false;
        filteredOut.forEach(function (f, n) {
            if (filteredOut[n] === i) {
                exist = true;
                const index = filteredOut.indexOf(i);
                filteredOut.splice(index, 1);
                return;
            }
        });
        if (exist === false) {
            filteredOut.push(i);
        }
        update(filteredOut, data)
    };

    var stack = d3.stack();
    color.domain(d3.keys(data[0]).filter(function (key) { return key !== 'date'; }));
    var keys = data.columns.filter(function (key) { return key !== 'date'; });
    
    // Parse the date:
    data.forEach(function (d) {
        d.date = parseDate(d.date);
    });

    // Max value for the y domain:
    var maxDateVal = d3.max(data, function (d) {
        var vals = d3.keys(d).map(function (key) { return key !== 'date' ? d[key] : 0 });
        return d3.sum(vals);
    });

    // Domain Ranges:
    x.domain(d3.extent(data, function (d) { return d.date; }));
    y.domain([0, maxDateVal]);

    // Stack Definitions;
    stack.keys(keys);
    stack.order(d3.stackOrderReverse);
    stack.offset(d3.stackOffsetNone);

    // Method to render the chart:
    var update = function (filteredOut) {
        var areaGroup = g.selectAll('.area');
        areaGroup.remove();

        // Filtered Data
        var temp = [];
        filteredData = temp.concat(data);
        filteredData.forEach(function (d, i) {
            filteredOut.forEach(function (key, n) {
                d[keys[filteredOut[n]]] = 0;
            });
        });

        // JOIN: new data with old elements:
        areaGroup = g.selectAll('.area')
            .data(stack(filteredData));

        // ENTER: new elements present in new data.
        areaGroup.enter()
            .append('path')
            .attr('class', 'area')
            .attr('d', area)
            .style('fill', function (d) { return color(d.key); })
            .attr('fill-opacity', 0.5)
            .on("mouseover", function (d,i) {
                div.transition()
                    .duration(200)
                    .style("opacity", .9);
                div.html(d.key)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function (d) {
                div.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .on("mousemove", function (d) {
                div
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
                
            });


        // EXIT: old elements not present in new data.
        areaGroup.exit().remove();

        // UPDATE: old elements present in the new data.
        // areaGroup
        //.transition(t);
    }

    // First Render:
    update(filteredOut,data)

    // Bottom Axis:
    g.append("g")
        .attr("transform", "translate(0," + chartHeight + ")")
        .call(xAxis)
        .append("text")
            .attr("fill", "#000")
            .attr("y", -10)
            .attr("x", chartWidth)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .text(xAxisLabel);

    // Left Axis:
    g.append("g")
        .call(yAxis)
        .append("text")
            .attr("fill", "#000")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", "0.71em")
            .attr("text-anchor", "end")
            .text(yAxisLabel);

    // Legend:
    var legend = g.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        //.attr("text-anchor", "end")
        .selectAll("g")
            .data(keys.slice())
            .enter().append("g")
                .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

    // Legend part 2:
    legend.append("rect")
        .attr("x", chartWidth + 4)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", color)
        .attr('fill-opacity', 0.5)
        .on('click', legendClick);

    // Legend Text: 
    legend.append("text")
        .attr("x", chartWidth + 24 + 4)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(function (d) { return d; })
        .on('click', legendClick);
}
var d3 = d3 || console.log("Warning: D3 Libraries are required (d3.js).");
d3.charts = d3.charts || console.log("Warning: D3 charts Libraries are required (charts/d3-charts.js).");
d3.charts.Scatterplot = d3.charts.Scatterplot || console.log("Warning: d3.charts.Scatterplot Libraries are required ('charts/scatterplot.js')."); 

d3.charts.ScatterplotMatrix = function (config) {
    // Configure Matrix:
    this.rowCount = config.numberOfRows || 0;
    this.columnCount = config.numberOfColumns || 0;
    this.scatterplotCount = 0;
    // Set up svg
    // Set up grid
    // Set up 
}

d3.charts.models = d3.charts.models || {};
d3.charts.models.ScatterplotMatrixModel = {
    title: "Scatterplot Matrix",
    width: 0,
    height: 0,
    cellSize: 100,
    columns: [
        {
            title: "Column"
        }
    ],
    rows: [
        {
            title: "Row",
            cells: [
                {
                    scatterplot: {}
                }
            ]
        }
    ],
    addColumn: function () {
        // Add column. This will probably add cells to rows. 
    },
    addRow: function () {
        // Add Row
    }
}
var d3 = d3 || console.log("Warning: D3 Libraries are required (d3.js).");
d3.charts = d3.charts || console.log("Warning: D3 charts Libraries are required (charts/d3-charts.js).");

d3.charts.Scatterplot = function (config) {

    // Configuration Parameters:
    var target = "#" + config.target || "body", // Element to place svg chart.
        title = config.title || "[x,y] Scatterplot",
        xData = config.xData || [0, 1, 2, 3], // x axis data.
        yData = config.yData || [0, 1, 2, 3], // y axis data.
        labelData = config.labelData || undefined,
        data = d3.charts.Correlate(xData, yData, labelData), // Data for scatterplot.
        xAxisLabel = config.xAxisLabel || "x Axis", // x axis label.
        yAxisLabel = config.yAxisLabel || "y Axis", // y axis label.
        width = config.width || 600, // Width of container.
        height = config.height || 400, // Height of container.
        margin = config.margin || { top: 20, right: 20, bottom: 30, left: 50 }, // Margins of svg element.
        origin = config.origin || [0, 0], // Minimum [x,y]
        trim = config.trim || false, // Trim chart to the data. (Don't use min max values')
        matchScale = config.matchScale || true

    // SVG Definition:
    var svg = d3.select(target)
        .append("svg")
        .attr("width", width)
        .attr("height", height),
        chartWidth = +svg.attr("width") - margin.left - margin.right,
        chartHeight = +svg.attr("height") - margin.top - margin.bottom;

    // Define the div for the tooltip
    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Grouping Definition:
    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // y Scale:
    var x = d3.scaleLinear()
        .rangeRound([0, chartWidth]);

    // x Scale:
    var y = d3.scaleLinear()
        .rangeRound([chartHeight, 0]);

    // Plot definition:
    /*
    var line = d3.line()
        .x(function (d) { return x(d[0]); })
        .y(function (d) { return y(d[1]); });

    */

    // Domain Ranges:
    x.domain(d3.extent(data, function (d) { return d[0]; }));
    if (trim === false) {
        y.domain([0, d3.max(data, function (d) { return d[1]; })]);
    } else {
        y.domain(d3.extent(data, function (d) { return d[1]; }));
    }

    // Line Path:
    /*
    g.append("path")
        .datum(data)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr("d", line);
    */

    // Scatter plot dots
    g.selectAll("circle")
        .data(data)
        .enter().append("svg:circle")
        .attr("fill","steelblue")
        .attr("fill-opacity", 0.6)
        // Consider a color scale.
        //.attr("class", function (d) { return color_class(d); })
        .attr("cx", function (d) { return x(d[0]); })
        .attr("cy", function (d) { return y(d[1]); })
        .attr("r", 4) // TODO: Make size configurable. 
        .on("mouseover", function (d, i) {
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html(d[2]+"<br/>"+d[0] +"/"+d[1])
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function (d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .on("mousemove", function (d) {
            div
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");

        });

    // Bottom Axis:
    g.append("g")
        .attr("transform", "translate(0," + chartHeight + ")")
        .call(d3.axisBottom(x))
        .append("text")
        .attr("fill", "#000")
        .attr("y", -10)
        .attr("x", chartWidth)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text(xAxisLabel);

    // Left Axis:
    g.append("g")
        .call(d3.axisLeft(y))
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text(yAxisLabel);
};
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
        if (labelData) { label = labelData[i] };
        data.push([xData[i], yData[i], label]);
    }
    return data;
}

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
    }
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
    }
    return config;
}