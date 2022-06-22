var d3 = d3 || console.log("Warning: D3 Libraries are required (d3.js).");
d3.charts = d3.charts || console.log("Warning: D3 charts Libraries are required (charts/d3-charts.js).");

d3.charts.Sand = function (config) {
    var parseDate = d3.timeParse('%Y');
    var bisectDate = d3.bisector(function (d) { return d.key; }).left;
    var target = "#" + config.target || "body",
        data = config.data || [],
        keys = config.keys || [], // Keys are unique to stack type charts.
        title = config.title || "Chart Title",
        yAxisLabel = config.yAxisLabel || "Numeric Axis",
        xAxisLabel = config.xAxisLabel || "Date Axis",
        width = config.width || 600,
        height = config.height || 400,
        margin = config.margin || { top: 20, right: 130, bottom: 40, left: 40 },
        colorScale = config.colorScale || d3.scaleOrdinal(d3.schemeCategory20),
        trim = config.trim || false;

    var filteredOut = [];
    var filteredData;
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
    colorScale.domain(d3.keys(data[0]).filter(function (key) { return key !== 'date'; }));
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
            .style('fill', function (d) { return colorScale(d.key); })
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
            .on("mousemove", function (d,i) {
                div.style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY - 28) + "px");
                
                var x0 = x.invert(d3.mouse(this)[0]),
                    i = bisectDate(data, x0, 1),
                    d0 = data[i - 1],
                    d1 = data[i],
                    d = x0 - d0.date > d1.date - x0 ? d1 : d0;

                // Move and change the focus cursor:
                focus.attr("transform", "translate(" + x(d3.event.pageX - 100) + "," + y(d3.event.pageY - 100) + ")");
                focus.select("text").text(d.key);

                // x,y Line Movement:
                xLine.attr("x1", d3.event.pageX - 100).attr("x2", d3.event.pageX-100);
                yLine.attr("y1", d3.event.pageY - 100).attr("y2", d3.event.pageY - 100);

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
            .attr("y", 32)
            .attr("x", chartWidth / 2)
            .attr("dy", 0)
            .attr("text-anchor", "middle")
            .text(xAxisLabel);

    // Left Axis:
    g.append("g")
        .call(yAxis)
            .append("text")
            .attr("fill", "#000")
            .attr("transform", "rotate(-90)")
            .attr("x", (chartHeight / 2) * (-1))
            .attr("y", -margin.left + 8)
            .attr("dy", 0)
            .attr("text-anchor", "middle")
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
        .attr("fill", colorScale)
        .attr('fill-opacity', 0.5)
        .on('click', legendClick);

    // Legend Text: 
    legend.append("text")
        .attr("x", chartWidth + 24 + 4)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(function (d) { return d; })
        .on('click', legendClick);

    // Focus for cursor location:
    var focus = g.append("g")
        .attr("class", "focus")
        //.attr("display", "none");

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
        //.attr("display", "none")
        .attr("x1", 0).attr("y1", 0)
        .attr("x2", 0).attr("y2", chartHeight);

    // Y line. This line goes up and down, tracking on the value with 
    var yLine = g.append('line')
        .attr("id", "focus-lineY")
        .attr("class", "focus-line")
        //.attr("display", "none")
        .attr("x1", 0).attr("y1", 0)
        .attr("x2", chartWidth).attr("y2", 0);
    

    // Callback for overlay info:
    function mousemove() {
           }

    /*
        Custom stuff for advanced charting:
        Specific for requirements:
    */

    var todayLine = g.append('line')
        .attr("id", "todayMarker")
        .attr("class", "lineMarker")
        .attr("x1", x(new Date(2010, 2, 1))).attr("y1", 0)
        .attr("x2", x(new Date(2010, 2, 1))).attr("y2", chartHeight);

    var todayText = g.append("text")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("x", 0)
        .attr("y", x(new Date(2010, 2, 1)) - 12)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Today (" + new Date() + ")");

    var todayPlusLine = g.append('line')
        .attr("id", "todayPlusMarker")
        .attr("class", "lineMarker")
        .attr("stroke-dasharray", "5, 5")
        .attr("x1", x(new Date(2011, 1, 1))).attr("y1", 0)
        .attr("x2", x(new Date(2011, 1, 1))).attr("y2", chartHeight);

    var todayPlusText = g.append("text")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("x", 0)
        .attr("y", x(new Date(2011, 1, 1)) - 12)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Today Puls 21 (2011, 1, 1)");

}