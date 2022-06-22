var d3 = d3 || console.log("Warning: D3 Libraries are required (d3.js).");
d3.charts = d3.charts || console.log("Warning: D3 charts Libraries are required (charts/d3-charts.js).");

d3.charts.StackedBarChart = function (config) {
    var target = "#" + config.target || "body",
        data = config.data || [],
        keys = config.keys || [],
        title = config.title || "Chart Title",
        yAxisLabel = config.yAxisLabel || "y Axis",
        xAxisLabel = config.xAxisLabel || "x Axis",
        width = config.width || 600,
        height = config.height || 400,
        margin = config.margin || { top: 28, right: 50, bottom: 36, left: 50 },
        colorScale = config.colorScale || d3.scaleOrdinal(d3.schemeCategory20),
        trim = config.trim || false;

    // SVG Definition:
    var svg = d3.select(target)
        .append("svg")
        .attr("width", width)
        .attr("height", height),
        chartWidth = +svg.attr("width") - margin.left - margin.right,
        chartHeight = +svg.attr("height") - margin.top - margin.bottom;

    // Title for chart:
    var t = svg.append("text")
        .classed("chart-title", true)
        .attr("y", margin.top-10)
        .attr("x", margin.left)
        .text(title);

    // Define the div for the tooltip
    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);


    // Grouping Definition for Chart:
    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // Bottom x Scale:
    var x = d3.scaleBand()
        .rangeRound([0, chartWidth])
        .paddingInner(0.05)
        .align(0.1);

    // Left y Scale:
    var y = d3.scaleLinear()
        .range([chartHeight, 0]);

    // x y domains:
    x.domain(data.map(function (d) { return d.key; }));
    y.domain([0, d3.max(data, function (d) { return d.total; })]).nice();

    // The domain keys for the colors for the different categories:
    colorScale.domain(keys);

    // Left Axis for gridline:
    g.append("g")
        .call(d3.axisLeft(y).tickSize(-chartWidth).tickFormat(""))
        .classed("gridline", true)
        .attr("transform", "translate(0,0)");


    // Bars:
    // Binding data to the bar groups:
    g.append("g")
        .selectAll("g")
        .data(d3.stack().keys(keys)(data))
        .enter().append("g")
        .attr("fill", function (d) { return colorScale(d.key); })
        .selectAll("rect")
        .data(function (d) { return d; })
        .enter().append("rect")
        .attr("x", function (d) { return x(d.data.key); })
        .attr("y", function (d) { return y(d[1]); })
        .attr("height", function (d) { return y(d[0]) - y(d[1]); })
        .attr("width", x.bandwidth())
        .on("mouseover", function (d, i) {
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html(d.data.key + ": " + keys[i] + "<br/>" + d.data[keys[i]])
                .style("left", (d3.event.pageX - 35) + "px")
                .style("top", (d3.event.pageY - 35) + "px");
        })
        .on("mouseout", function (d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        });;

    // Bottom Axis:
    g.append("g")
        .attr("transform", "translate(0," + chartHeight + ")")
        .call(d3.axisBottom(x))
            .append("text")
            .attr("fill", "#000")
            .attr("y", 32)
            .attr("x", chartWidth /2)
            .attr("dy", 0)
            .attr("dx", 0)
            .attr("text-anchor", "middle")
            .text(xAxisLabel);

    // Left Axis:
    g.append("g")
        .call(d3.axisLeft(y))
            .append("text")
            .attr("fill", "#000")
            .attr("transform", "rotate(-90)")
            .attr("x", (chartHeight / 2)*(-1))
            .attr("y", -margin.left+8)
            .attr("dy", 0)
            .attr("text-anchor", "middle")
            .text(yAxisLabel);

    // Legend:
    var legend = g.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "start")
        .selectAll("g")
        .data(keys.slice().reverse())
        .enter().append("g")
        .attr("transform", function (d, i) { return "translate(0," + i * 20 + ")"; });

    // Legend part 2:
    legend.append("rect")
        .attr("x", width - margin.right- margin.left + 6)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", colorScale);

    // Legend Text: 
    legend.append("text")
        .attr("x", width - margin.right - margin.left + 30)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(function (d) { return d; });
};