var d3 = d3 || console.log("Warning: D3 Libraries are required (d3.js).");
d3.charts = d3.charts || console.log("Warning: D3 charts Libraries are required (charts/d3-charts.js).");

d3.charts.HeatMap = function (config) {
    var parseTime = d3.timeParse("%d-%b-%y");
    var bisectDate = d3.bisector(function (d) { return d.key; }).left;
    var target = "#" + config.target || "body",
        data = config.data || undefined,
        title = config.title || "Chart Title",
        yAxisLabel = config.yAxisLabel || "Numeric y Axis",
        xAxisLabel = config.xAxisLabel || "Numeric x Axis",
        width = config.width || 800,
        height = config.height || 400,
        margin = config.margin || { top: 50, right: 50, bottom: 50, left: 50 },
        colorScale = config.colorScale || d3.scaleLinear().domain([0, 100]).range(['#FFFFFF', '#6666FF']),
        trim = config.trim || false; // Trim chart white space.
    
    // SVG Definition:
    var svg = d3.select(target)
        .append("svg")
        .attr("width", width)
        .attr("height", height),
        chartWidth = +svg.attr("width") - margin.left - margin.right,
        chartHeight = +svg.attr("height") - margin.top - margin.bottom;

    var numberOfColumns = data.columns.length,
        numberOfRows = data.length;
    
        var gridData = new Array(),
            xpos = 0,
            ypos = 0,
            width = chartWidth / numberOfColumns,
            height = chartHeight / numberOfRows,
            click = 0,
            value = 0;
        for (var row = 0; row < numberOfRows; row++) {
            gridData.push(new Array()); // new array into gridData array.
            var rowData = data[row]; // push real data into a new object.
            var element = d3.map(rowData); // 
            var elementValues = element.values();
            for (var column = 0; column < numberOfColumns; column++) {
                gridData[row].push({
                    x: xpos,
                    y: ypos,
                    width: width,
                    height: height,
                    value: elementValues[column]
                })
                xpos += width;
            }
            xpos = 0;
            ypos += height;
        }

    // Grouping Definition for Chart:
    var g = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // x Scale:
    var x = d3.scaleLinear()
        .rangeRound([0, chartWidth]);

    // y Scale:
    var y = d3.scaleLinear()
        .rangeRound([0, chartHeight]);

    // Domain Ranges:
    x.domain([0, numberOfColumns]);
    y.domain([0, numberOfRows]);

    var row = g.selectAll(".row")
        .data(gridData)
            .enter().append("g")
                .attr("class", "row");

    var tooltip = g.append("text").attr("class", "toolTip");

    var column = row.selectAll(".square")
        .data(function (d) { return d; })
            .enter().append("rect")
        .attr("class", "square")
        .attr("x", function (d) { return d.x; })
        .attr("y", function (d) { return d.y; })
        .attr("width", function (d) { return chartWidth / numberOfColumns; })
        .attr("height", function (d) { return chartHeight / numberOfRows; })
        .style("fill", function (d) { return colorScale(d.value); })
            .style("stroke", "#222")
            .on("mouseover", function (d) {
                tooltip.style("visibility", "visible")
                    .attr("x", d.x + 20)
                    .attr("y", d.y + 20)
                    .attr("font-size", "20px")
                    .text(d.value);
            })
            .on("mouseout", function (d) { tooltip.style("visibility", "hidden"); });

    // Left Axis:
    g.append("g")
        .call(d3.axisLeft(y)
            .ticks(6));

    // Bottom Axis:
    g.append("g")
        .attr("transform", "translate(0," + chartHeight + ")")
        .call(d3.axisBottom(x)
            .ticks(6));
};