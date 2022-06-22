var d3 = d3 || console.log("Warning: D3 Libraries are required (d3.js).");
d3.charts = d3.charts || console.log("Warning: D3 charts Libraries are required (charts/d3-charts.js).");

d3.charts.HeatMap = function (config) {
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

    function gridData(dataset) {
        var data = new Array();
        var xpos = 1;
        var ypos = 1;
        var width = 100;
        var height = 100;
        var click = 0;
        var value = 0;


        for (var row = 0; row < 5; row++) {
            data.push(new Array());
            var rowData = dataset[row];
            console.log(rowData);

            var element = d3.map(rowData);
            var elementValues = element.values();
            console.log(elementValues);

            for (var column = 0; column < 5; column++) {

                data[row].push({
                    x: xpos,
                    y: ypos,
                    width: width,
                    height: height,
                    value: elementValues[column]

                })

                xpos += width;
            }

            xpos = 1;

            ypos += height;
        }

        return data;
    }

    var gridData = gridData(data);
    var x = d3.scaleLinear().range([0, 500])
        .domain([0, 20]);
    
    var colors = ["#fff5eb", "#fee6ce", "#fdd0a2", "#fdae6b", "#fd8d3c", "#f16913", "#d94801", "#a63603", "#7f2704"];
    //    var colors = ["red","blue","green"];
    var colorScale = d3.scaleQuantile()
        .domain([0, 20])
        .range(colors);

    var row = svg.selectAll(".row")
        .data(gridData)
        .enter().append("g")
        .attr("class", "row");

    var tooltip = svg.append("text").attr("class", "toolTip");

    var column = row.selectAll(".square")
        .data(function (d) { return d; })
        .enter().append("rect")
        .attr("class", "square")
        .attr("x", function (d) { return d.x + 50; })
        .attr("y", function (d) { return d.y + 50; })
        .attr("width", function (d) { return d.width; })
        .attr("height", function (d) { return d.height; })
        .style("fill", function (d) { return colorScale(d.value); })
        .style("stroke", "#222")
        .on("mouseover", function (d) {

            tooltip.style("visibility", "visible")
                .attr("x", d.x + 70)
                .attr("y", d.y + 70)
                .attr("font-size", "20px")
                .text(d.value);
        })
        .on("mouseout", function (d) { tooltip.style("visibility", "hidden"); });

    svg.append("g")
        .attr("transform", "translate(0," + 50 + ")")
        .call(d3.axisRight(x)
            .ticks(6));

    svg.append("text")
        .attr("transform", "translate(" + (280) + " ," + (600) + ")")
        .style("text-anchor", "middle")
        .text("HEAT-MAP");

    svg.append("g")
        .attr("transform", "translate(" + 50 + ",0)")
        .call(d3.axisBottom(x)
            .ticks(6));
};