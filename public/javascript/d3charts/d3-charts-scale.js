var d3 = d3 || console.log("Warning: D3 Libraries are required (d3.js).");
d3.charts = d3.charts || console.log("Warning: D3 charts Libraries are required (charts/d3-charts.js).");

// TODO: Need to work more on this. Yes it works, but is it absolutely correct with all models? 
d3.charts.Scale = function (config) {

    var target = "#" + config.target || "body",
        data = config.data || [1, 2, 3, 4, 5, 6],
        title = config.title || "Chart Title",
        xAxisLabel = config.xAxisLabel || "X Axis",
        width = config.width || 600,
        height = config.height || 100,
        margin = config.margin || { top: 20, right: 20, bottom: 30, left: 50 },
        colorScale = config.colorScale || d3.scaleOrdinal(d3.schemeCategory20),
        scaleType = config.scaleType || "Linear";
    
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

    var scale = d3["scale" + scaleType]()

    if (scaleType == "Linear") {
        scale.domain(d3.extent(data, function (d) { return d; }))
            .range([0, chartWidth]);
    }
    if (scaleType == "Log") {
        scale.range([0, chartWidth]);
    }
    if (scaleType == "Pow") {
        scale.domain(d3.extent(data, function (d) { return d; }))
            .exponent(.1)
            .range([0, chartWidth]);
    }
    if (scaleType == "Point") {
        scale.domain(data)
            .padding([1])
            .rangeRound([0, chartWidth]);
    }
    if (scaleType == "Band") {
        scale.domain(data)
            .padding([.5])
            .rangeRound([0, chartWidth]);
    }
    if (scaleType == "Ordinal") {
        scale.domain(data)
            .range([0, 40, 30, 125, chartWidth]);
    }

    // Title:
    g.append("text")
        .attr("y", 10) // vertical offset of scale title
        .text(title);

    // Plots:
    // With the varying sizes, the plots look better behind the scale. (Accuracy)
    g.selectAll("." + scaleType)
        .data(data)
        .enter().append("circle")
        .attr("fill", function (d, i) { return colorScale(i); })
        .attr("r", function (d, i) { return d; }) // radius
        .attr("cy", 40) // vertical offset
        .attr("cx", function (d) { return scale(d); }) // horizontal position

    // Bottom X Scale:
    g.append("g")
        //.attr("class", "x axis")
        .attr("transform", "translate(0," + (chartHeight-10) + ")")
        .call(d3.axisBottom(scale));
};