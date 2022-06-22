var d3 = d3 || console.log("Warning: D3 Libraries are required (d3.js).");
d3.charts = d3.charts || console.log("Warning: D3 charts Libraries are required (charts/d3-charts.js).");

d3.charts.BarChart = function (config) {
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
        .attr("y", 12)
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
    y.domain([0, d3.max(data, function (d) { return d.value; })]).nice();

    // Left Axis for gridline:
    g.append("g")
        .call(d3.axisLeft(y).tickSize(-chartWidth).tickFormat(""))
        .classed("gridline", true)
        .attr("transform", "translate(0,0)");

    // Binding data to the bars.  
    g.selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar") // You can add and remove classes with this method. 
        .attr("x", function (d, i) { return x(d.key); })
        .attr("y", function (d, i) { return y(d.value); }) 
        .attr("height", function (d, i) { return chartHeight - y(d.value); }) // TODO: Something is wrong here. 
        .attr("width", function (d, i) { return x.bandwidth(); })
        .style("fill", function (d, i) { return colorScale(i); })
        .on("mouseover", function (d, i) {
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html(d.key+"<br/>"+d.value)
                .style("left", (d3.event.pageX-35) + "px")
                .style("top", (d3.event.pageY-35) + "px");
        })
        .on("mouseout", function (d) {
            div.transition()
                .duration(500)
                .style("opacity", 0);
        });

    // Bottom Axis:
    g.append("g")
        .attr("transform", "translate(0," + chartHeight + ")")
        .call(d3.axisBottom(x))
        .append("text")
        .attr("fill", "#000")
        .attr("y", 30)
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
        .attr("y", -30)
        .attr("dy", 0)
        .attr("text-anchor", "middle")
        .text(yAxisLabel);
};