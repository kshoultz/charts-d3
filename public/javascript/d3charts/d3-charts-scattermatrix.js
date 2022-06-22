var d3 = d3 || console.log("Warning: D3 Libraries are required (d3.js).");
d3.charts = d3.charts || console.log("Warning: D3 charts Libraries are required (charts/d3-charts.js).");
d3.charts.Scatterplot = d3.charts.Scatterplot || console.log("Warning: d3.charts.Scatterplot Libraries are required ('charts/scatterplot.js')."); 

d3.charts.ScatterplotMatrix = function (config) {
    // Configure Matrix:
    this.rowCount = config.numberOfRows || 0;
    this.columnCount = config.numberOfColumns || 0;
    this.scatterplotCount = 0;
    // Set up svg
    // Set up grid
    // Set up 
}

d3.charts.models = d3.charts.models || {};
d3.charts.models.ScatterplotMatrixModel = {
    title: "Scatterplot Matrix",
    width: 0,
    height: 0,
    cellSize: 100,
    columns: [
        {
            title: "Column"
        }
    ],
    rows: [
        {
            title: "Row",
            cells: [
                {
                    scatterplot: {}
                }
            ]
        }
    ],
    addColumn: function () {
        // Add column. This will probably add cells to rows. 
    },
    addRow: function () {
        // Add Row
    }
}