var d3 = d3 || console.log("Warning: D3 Libraries are required (d3.js)."); 
d3.charts = d3.charts || console.log("Warning: D3 charts Libraries are required (charts/d3-charts.js).");

d3.charts.ChordChart = function (config) {
    var target = "#" + config.target || "body",
        subsections = config.subsections || ["one","two","three","four", "five"],
        data = config.data || [
            [11975, 5871, 8916, 2868, 7078],
            [1951, 10048, 2060, 6171,8088],
            [8010, 16145, 8090, 8045, 9098],
            [1013, 990, 940, 6907, 108],
            [1010, 2020, 3030, 4040, 5050]
        ],
        title = config.title || "Chart Title",
        yAxisLabel = config.yAxisLabel || "Numeric Axis",
        xAxisLabel = config.xAxisLabel || "Date Axis",
        width = config.width || 600,
        height = config.height || 400,
        margin = config.margin || { top: 20, right: 20, bottom: 20, left: 50 },
        colorScale = config.colorScale || d3.scaleOrdinal(d3.schemeCategory10),
        trim = config.trim || false; // Trim chart white space.

    // SVG Definition:
    var svg = d3.select(target)
        .append("svg")
        .attr("width", width)
        .attr("height", height),
        outerRadius = Math.min(width, height) * 0.5 - 40,
        innerRadius = outerRadius - 10,
        chartWidth = +svg.attr("width") - margin.left - margin.right,
        chartHeight = +svg.attr("height") - margin.top - margin.bottom;

    var formatValue = d3.formatPrefix(",.0", 1e3);

    var chord = d3.chord()
        .padAngle(0.05)
        .sortSubgroups(d3.descending);

    var arc = d3.arc()
        .innerRadius(innerRadius)
        .outerRadius(outerRadius);

    var ribbon = d3.ribbon()
        .radius(innerRadius);
    
    var color = colorScale;

    var g = svg.append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
        .datum(chord(data));

    var group = g.append("g")
        .attr("class", "groups")
        .selectAll("g")
        .data(function (chords) { return chords.groups; })
        .enter().append("g");

    var gLocations = group.append("path")
        .style("fill", function (d) { return color(d.index); })
        .style("stroke", function (d) { return d3.rgb(color(d.index)).darker(); })
        .attr("d", arc);
    gLocations.append("svg:title")
        .text(function (d, i) { return subsections[i] + " (" + d.value + " lbs)"; });
    
    group.append("svg:text")
        .each(function (d) {
            d.angle = (d.startAngle + d.endAngle) / 2;
        })
        .attr("dy", ".35em")
        .style("font-family", "helvetica, arial, sans-serif")
        .style("font-size", "9px")
        .style("font-weight", "bold")
        .attr("text-anchor", function (d) {
            return d.angle > Math.PI ? "end" : null;
        })
        .attr("transform", function (d) {
            return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")" +
                "translate(" + (+outerRadius + 36) + ")" + (d.angle > Math.PI ? "rotate(180)" : "");
        })
        .text(function (d, i) {
            return "Station " + subsections[i];//mapReader(d).gname;
        });

    var groupTick = group.selectAll(".group-tick")
        .data(function (d) { return groupTicks(d, 1e3); })
        .enter().append("g")
        .attr("class", "group-tick")
        .attr("transform", function (d) { return "rotate(" + (d.angle * 180 / Math.PI - 90) + ") translate(" + outerRadius + ",0)"; });

    groupTick.append("line")
        .attr("x2", 6);

    groupTick
        .filter(function (d) { return d.value % 5e3 === 0; })
        .append("text")
        .attr("x", 8)
        .attr("dy", ".35em")
        .attr("transform", function (d) { return d.angle > Math.PI ? "rotate(180) translate(-16)" : null; })
        .style("text-anchor", function (d) { return d.angle > Math.PI ? "end" : null; })
        .text(function (d) { return formatValue(d.value); });

    var gRibbons = g.append("g")
        .attr("class", "ribbons")
        .selectAll("path")
        .data(function (chords) { return chords; })
        .enter().append("path")
        .attr("d", ribbon)
        .style("fill", function (d) { return color(d.target.index); })
        .style("stroke", function (d) { return d3.rgb(color(d.target.index)).darker(); });
    gRibbons.append("svg:title")
        .text(function (d, i) { return subsections[d.target.index] + " (" + d.source.value + " lbs)" + " - " + subsections[d.source.index] + " (" + d.target.value +     " lbs)"; });

    // Returns an array of tick angles and values for a given group and step.
    function groupTicks(d, step) {
        var k = (d.endAngle - d.startAngle) / d.value;
        return d3.range(0, d.value, step).map(function (value) {
            return { value: value, angle: value * k + d.startAngle };
        });
    }
};