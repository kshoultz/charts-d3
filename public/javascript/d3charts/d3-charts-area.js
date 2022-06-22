var d3 = d3 || console.log("Warning: D3 Libraries are required (d3.js).");
d3.charts = d3.charts || console.log("Warning: D3 charts Libraries are required (charts/d3-charts.js).");

d3.charts.Area = function (config) {
    var parseTime = d3.timeParse("%d-%b-%y");
    var bisectDate = d3.bisector(function (d) { return d.key; }).left;
    var target = "#" + config.target || "body",
        data = config.data || [
            { key: parseTime("24-Apr-07"), value: 43.24 },
            { key: parseTime("25-Apr-07"), value: 55.35 },
            { key: parseTime("26-Apr-07"), value: 68.84 },
            { key: parseTime("27-Apr-07"), value: 79.92 },
            { key: parseTime("30-Apr-07"), value: 89.80 }
        ],
        title = config.title || "Chart Title",
        yAxisLabel = config.yAxisLabel || "Numeric Axis",
        xAxisLabel = config.xAxisLabel || "Date Axis",
        width = config.width || 600,
        height = config.height || 400,
        margin = config.margin || { top: 20, right: 20, bottom: 40, left: 50 },
        colorScale = config.colorScale || d3.scaleOrdinal(d3.schemeCategory20),
        trim = config.trim || false; // Trim chart white space.
    
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
        .attr("fill", function (d, i) { return colorScale(i); })
        .attr("d", area);

    // Bottom Axis:
    g.append("g")
        .attr("transform", "translate(0," + chartHeight + ")")
        .call(d3.axisBottom(x))
            .append("text")
            .attr("fill", "#000")
            .attr("y", 32)
            .attr("x", chartWidth / 2)
            .attr("dy", 0)
            .attr("text-anchor", "middle")
            .text(xAxisLabel);

    // Left Axis:
    g.append("g")
        .call(d3.axisLeft(y))
            .append("text")
            .attr("fill", "#000")
            .attr("transform", "rotate(-90)")
            .attr("x", (chartHeight / 2) * (-1))
            .attr("y", -margin.left + 8)
            .attr("dy", 0)
            .attr("text-anchor", "middle")
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

    // X Line. This line should move left and right, tracking with the cursor/hilight circle.
    var xLine = g.append('line')
        .attr("id", "focus-lineX")
        .attr("class", "focus-line")
        .attr("display", "none")
        .attr("x1", 0).attr("y1", 0)
        .attr("x2", 0).attr("y2", chartHeight);

    // Y line. This line goes up and down, tracking on the value with 
    var yLine = g.append('line')
        .attr("id", "focus-lineY")
        .attr("class", "focus-line")
        .attr("display", "none")
        .attr("x1", 0).attr("y1", 0)
        .attr("x2", chartWidth).attr("y2", 0);

    // Overlay elemment to respond to the cursor position:
    g.append("rect")
        .attr("class", "overlay")
        .attr("width", chartWidth)
        .attr("height", chartHeight)
        .attr("fill-opacity", 0)
        .on("mouseover", function () { focus.attr("display", null); xLine.attr("display", null); yLine.attr("display", null); }) // May clear other styles. 
        .on("mouseout", function () { focus.attr("display", "none"); xLine.attr("display", "none"); yLine.attr("display", "none"); }) // May clear other styles. 
        .on("mousemove", mousemove);

    // Callback for overlay info:
    function mousemove() {
        var x0 = x.invert(d3.mouse(this)[0]),
            i = bisectDate(data, x0, 1),
            d0 = data[i - 1],
            d1 = data[i],
            d = x0 - d0.date > d1.date - x0 ? d1 : d0;

        // Move and change the focus cursor:
        focus.attr("transform", "translate(" + x(d.key) + "," + y(d.value) + ")");
        focus.select("text").text(d.value);

        // x,y Line Movement:
        xLine.attr("x1", x(d.key)).attr("x2", x(d.key));
        yLine.attr("y1", y(d.value)).attr("y2", y(d.value));
    }
};

