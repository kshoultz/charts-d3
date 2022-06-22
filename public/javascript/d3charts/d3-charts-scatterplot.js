var d3 = d3 || console.log("Warning: D3 Libraries are required (d3.js).");
d3.charts = d3.charts || console.log("Warning: D3 charts Libraries are required (charts/d3-charts.js).");

d3.charts.Scatterplot = function (config) {
    var target = "#" + config.target || "body", // Element to place svg chart.
        xData = config.xData || [0, 1, 2, 3], // x axis data.
        yData = config.yData || [0, 1, 2, 3], // y axis data.
        labelData = config.labelData || undefined, // Unique to data.
        data = d3.charts.Correlate(xData, yData, labelData), // Data for scatterplot.
        title = config.title || "[x,y] Scatterplot",
        xAxisLabel = config.xAxisLabel || "x Axis", // x axis label.
        yAxisLabel = config.yAxisLabel || "y Axis", // y axis label.
        width = config.width || 600, // Width of container.
        height = config.height || 400, // Height of container.
        margin = config.margin || { top: 20, right: 20, bottom: 40, left: 50 }, // Margins of svg element.
        colorScale = config.colorScale || d3.scaleOrdinal(d3.schemeCategory20),
        trim = config.trim || false; // Trim chart to the data. (Don't use min max values')

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
};