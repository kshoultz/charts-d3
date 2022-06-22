
d3.csv('numMatrix.csv', function (error, dataset) {
    dataset.forEach(function (d) {
        d.col1 = +d.col1;
        d.col2 = +d.col2;
        d.col3 = +d.col3;
        d.col4 = +d.col4;
        d.col5 = +d.col5;
    })
    console.log(dataset);


    function gridData() {
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

    var gridData = gridData();

    var margin = { top: 100, right: 20, bottom: 50, left: 100 },
        width = 900 - margin.left - margin.right,
        height = 900 - margin.top - margin.bottom;

    var x = d3.scaleLinear().range([0, 500])
        .domain([0, 20]);


    var grid = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");


    var colors = ["#fff5eb", "#fee6ce", "#fdd0a2", "#fdae6b", "#fd8d3c", "#f16913", "#d94801", "#a63603", "#7f2704"];
    //    var colors = ["red","blue","green"];
    var colorScale = d3.scaleQuantile()
        .domain([0, 20])
        .range(colors);

    var row = grid.selectAll(".row")
        .data(gridData)
        .enter().append("g")
        .attr("class", "row");

    var tooltip = grid.append("text").attr("class", "toolTip");

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

    grid.append("g")
        .attr("transform", "translate(0," + 50 + ")")
        .call(d3.axisRight(x)
            .ticks(6));

    grid.append("text")
        .attr("transform", "translate(" + (280) + " ," + (600) + ")")
        .style("text-anchor", "middle")
        .text("HEAT-MAP");

    grid.append("g")
        .attr("transform", "translate(" + 50 + ",0)")
        .call(d3.axisBottom(x)
            .ticks(6));

});
