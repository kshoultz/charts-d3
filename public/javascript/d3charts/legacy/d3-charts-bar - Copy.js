var d3 = d3 || console.log("Warning: D3 Libraries are required (d3.js).");
d3.charts = d3.charts || console.log("Warning: D3 charts Libraries are required (charts/d3-charts.js).");

// TODO: Figure out how to use the function properly
d3.charts.BarChart = function (config) {

    // Configuration Parameters:
    var target = "#" + config.target || "body",
        data = config.data || [
            { key: "Glazed", value: 132 },
            { key: "Jelly", value: 71 },
            { key: "Holes", value: 337 },
            { key: "Sprinkles", value: 93 },
            { key: "Crumb", value: 78 },
            { key: "Chocolate", value: 43 },
            { key: "Coconut", value: 20 },
            { key: "Cream", value: 10 },
            { key: "Cruller", value: 30 },
            { key: "Eclair", value: 8 },
            { key: "Fritter", value: 17 },
            { key: "Bearclaw", value: 21 }
        ],
        yAxisLabel = config.yAxisLabel || "y Axis",
        xAxisLabel = config.xAxisLabel || "x Axis",
        width = config.width || 600,
        height = config.height || 400,
        margin = config.margin || { top: 20, right: 20, bottom: 30, left: 50 },
        trim = config.trim || false,
        colorScale = config.colorScale || d3.scaleOrdinal(d3.schemeCategory20);

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

    // Left y Scale:
    var x = d3.scaleBand()
        .domain(data.map(function (entry) { return entry.key; }))
        .range([0, chartWidth]);

    // Bottom x Scale:
    var y = d3.scaleLinear()
        .domain([0, d3.max(data, function (d) { return d.value; })])
        .range([chartHeight, 0]);

    // Left Axis for gridline:
    g.append("g")
        .call(d3.axisLeft(y).tickSize(-chartWidth).tickFormat(""))
        .classed("gridline", true)
        .attr("transform", "translate(0,0)");

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
        .attr("transform", "translate(0,0) rotate(-45)")
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


    // Binding data to the bars.  
    g.selectAll(".bar")
        .data(data)
        .enter()
            .append("rect")
                .classed("bar", true) // You can add and remove classes with this method. 
                .attr("x", function (d, i) { return x(d.key); })
                .attr("y", function (d, i) { return y(d.value+300); }) // TODO: Something is wrong here. 
                .attr("height", function (d, i) { return y(d.value); })
                .attr("width", function (d, i) { return x.bandwidth(); })
                .style("fill", function (d, i) { return colorScale(i); });

    // Adding labels to the bars.
    g.selectAll(".bar-label")
        .data(data)
        .enter()
        .append("text")
        .classed("bar-label", true)
        .attr("x", function (d, i) { return x(d.key) + x.bandwidth() / 2; })
        .attr("dx", 0)
        .attr("y", function (d, i) { return y(d.value); })
        .attr("dy", -6)
        .text(function (d, i) { return d.value; });
};