if (!d3) { console.log("Warning: D3 Libraries are required (d3.js)."); }
var d3 = d3 || {};
d3.charts = d3.charts || console.log("Warning: D3 charts Libraries are required (charts/d3-charts.js).");

d3.charts.MapAzimuth = function (config) {
    var target = "#" + config.target || "body",
        data = config.data || [],
        landData = config.landData || undefined,
        routeData = config.routeData || undefined,
        title = config.title || "Chart Title",
        yAxisLabel = config.yAxisLabel || "y Axis",
        xAxisLabel = config.xAxisLabel || "x Axis",
        width = config.width || 600,
        height = config.height || 400,
        margin = config.margin || { top: 28, right: 50, bottom: 36, left: 50 },
        colorScale = config.colorScale || d3.scaleOrdinal(d3.schemeCategory20),
        theme = config.theme || "Default",
        showLabels = config.showLabels || false,
        trim = config.trim || false, 
        onLocationClick = config.onLocationClick || function(){};
    
    // Layers: 
    var gSpaceGroup, gOceansGroup, gGraticulesGroup, gLandsGroup, gLocationsGroup, gLocationLabelsGroup, gRoutesGroup;
    var gSpace, gOceans, gGraticules, gLands, gLocations, gRoutes;

    // Globe Projection:
    var projection = d3.geo.azimuthal()
        .scale(height/1)
        .origin([-71.03, 42.37])
        .mode("orthographic")
        .translate([width/2, height/2]);

    // Space Projection:
    var spaceProjection = d3.geo.azimuthal()
        .scale(height / 2)
        .origin([-71.03, 42.37])
        .mode("gnomonic")
        .translate([width / 2, height / 2]);

    var circle = d3.geo.greatCircle()
        .origin(projection.origin());

    var spaceCircle = d3.geo.greatCircle()
        .origin(spaceProjection.origin());

    // TODO fix d3.geo.azimuthal to be consistent with scale
    var scale = {
        orthographic: height,
        stereographic: height,
        gnomonic: height,
        equidistant: height / Math.PI * 2,
        equalarea: height / Math.SQRT2
    };

    var path = d3.geo.path()
        .projection(projection);

    var spacePath = d3.geo.path()
        .projection(spaceProjection)
        .pointRadius(2);
    // End Projection.
    

    // SVG container:
    var svg = d3.select(target)
        .append("svg")
            .attr("width", width)
            .attr("height", height)
            .on("mousedown", mousedown);

    // Initialize space:
    gSpaceGroup = svg.append("g").attr("id", "gSpace").attr("class", "gSpace");
    gSpaceGroup
        .append('rect')
        .attr('height', height)
        .attr('width', width);

    gSpace = gSpaceGroup.selectAll("path")
        .data(createStars(500))
        .enter()
        .append("path")
        .attr("d", spacePath);

    // Initialize layer groups:
    gOceansGroup = svg.append("g").attr("id", "gOceans").attr("class", "gOceans"+theme);
    gGraticulesGroup = svg.append("g").attr("id", "gGraticules").attr("class", "gGraticules"+theme);
    gLandsGroup = svg.append("g").attr("id", "gLands").attr("class", "gLands"+theme);
    gRoutesGroup = svg.append("g").attr("id","gRoutes").attr("class","gRoutes");
    gLocationsGroup = svg.append("g").attr("id", "gLocations").attr("class", "gLocations" + theme);
    gLocationLabelsGroup = svg.append("g").attr("id", "gLocationLabels").attr("class", "gLocationLabels");

    // Add the ocean to the map layer:
    var oceanData = [];
    for (var lat = -90; lat < 90; lat += 45) {
        for (var lon = -180; lon < 180; lon += 45) {
            var coords = [[[lon, lat], [lon + 45, lat], [lon + 45, lat + 45], [lon, lat + 45], [lon, lat]]];
            oceanData.push({ "type": "Feature", area: ["ocean"], "properties": { area: ["ocean"] }, "geometry": { "type": "Polygon", "coordinates": coords } });
        }
    }
    gOceans = gOceansGroup.selectAll("path")
        .data(oceanData)
            .enter()
                .append("svg:path")
                    .attr("vector-effect", "non-scaling-stroke")
                    .attr("d", clip);
    // End ocean.

    // Add the graticules to the map layer:
    var graticuleData = d3.geoGraticule().step([20, 20]).lines();
    gGraticules = gGraticulesGroup.selectAll("path")
        .data(graticuleData)
            .enter()
                .append("svg:path")
                    .attr("vector-effect", "non-scaling-stroke")
                    .attr("pointer-events", "none")
                    .attr("d", clip);

    // Add lands to the land layer:
    gLands = gLandsGroup.selectAll("path")
        .data(landData)
        .enter()
        .append("svg:path")
        .attr("d", clip);

    gLands.append("svg:title")
        .text(function (d) { return d.properties.name; });

    if (routeData !== undefined){
        // Add the Routes to the map:
        gRoutes = gRoutesGroup.selectAll("path")
            .data(routeData)
                .enter()
                    .append("path")
                        .attr("d",clip); /*
                        .on("mouseover",function(d,i){
                            var activeClass = "active";
                            var alreadyIsActive = d3.select(this).classed(activeClass);
                            gRoutes.classed(activeClass,false);
                            d3.select(this).classed(activeClass,!alreadyIsActive);
                        })
                        .on("mouseout",function(d,i){
                            var activeClass = "active";
                            var alreadyIsActive = d3.select(this).classed(activeClass);
                            gRoutes.classed(activeClass,false);
                            d3.select(this).classed(activeClass,!alreadyIsActive);
                        });*/

        gRoutes.append("svg:title")
             .text(function (d, i) { return d.source.get("label"); });
    } else {
        gRoutes = gRoutesGroup.selectAll("path");
    }
    // Add the data to the locations layer:
     gLocations = gLocationsGroup.selectAll("path")
        .data(data)
            .enter()
                .append("svg:path")
                    //.classed("gLocation",true)
                    .attr("r", 5)
                    .attr("d", clip)
                    .on("click", function (d,i) {
                         onLocationClick(d,i);
                         projection.origin(projection.invert(d3.mouse(this)));
                         circle = d3.geo.greatCircle().origin(projection.origin());
                         refresh(1000);
         
                         // Set the routes outgoing from this location to active. 
                         var debark = d.geometry.source.record.get("id"); 
                         gRoutes.classed("active",false);
                         gRoutes.each(function(d2,i2){
                             var routeDebarkId = d2.source.get("id").slice(0,3);
                             console.log(routeDebarkId);
                                 if (routeDebarkId === debark) {
                                     d3.select(this).classed("active",true);
                                 }
                             });
                         })
                    .on("mouseover",function(d,i){
                        var activeClass = "active";
                        var alreadyIsActive = d3.select(this).classed(activeClass);
                        gLocations.classed(activeClass,false);
                        d3.select(this).classed(activeClass,!alreadyIsActive);
                    })
                    .on("mouseout",function(d,i){
                        var activeClass = "active";
                        var alreadyIsActive = d3.select(this).classed(activeClass);
                        gLocations.classed(activeClass,false);
                        d3.select(this).classed(activeClass,!alreadyIsActive);
                    });

    gLocations.append("svg:title")
         .text(function (d, i) { return data[i].label; });

    if (showLabels) {
        // Labels
        var gLocationLabels = gLocationLabelsGroup.selectAll("g")
            .data(data)
            .enter()
            .append("g")
            .attr("x", clipX)
            .attr("y", clipY);

        var gLocationRects = gLocationLabelsGroup.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("width", 80)
            .attr("height", 16).attr("fill", "#ffffff")
            .attr("x", rectX)
            .attr("y", rectY)
            .attr("dy", ".353em");

        var gLocationTexts = gLocationLabelsGroup.selectAll("text")
            .data(data)
            .enter()
            .append("text")
            .text(function (d, i) { return data[i].label; })
            .attr("x", clipX)
            .attr("y", clipY)
            .attr("dy", ".353em")
            .attr("dx", ".700em");
        // End Labels.
    }

    d3.select(window)
        .on("mousemove", mousemove)
        .on("mouseup", mouseup)
        .on("wheel", mousewheel);
    
    var m0,
        o0;

    function mousedown() {
        m0 = [d3.event.pageX, d3.event.pageY];
        o0 = projection.origin();
        d3.event.preventDefault();
    }

    function mousemove() {
        if (m0) {
            var m1 = [d3.event.pageX, d3.event.pageY],
                m2 = [d3.event.pageX * (-1), d3.event.pageY * (-1)],
                o1 = [o0[0] + (m0[0] - m1[0]) / 8, o0[1] + (m1[1] - m0[1]) / 8],
                o2 = [o0[0] + (m0[0] - m2[0]) / 8, o0[1] + (m2[1] - m0[1]) / 8];

            projection.origin(o1);
            circle.origin(o1);

            spaceProjection.origin(o2);
            spaceCircle.origin(o2);

            refresh();
        }
    }

    function mouseup() {
        if (m0) {
            mousemove();
            m0 = null;
        }
    }

    function mousewheel(evt) {
        if (!evt) evt = event;
        var direction = (evt.detail < 0 || evt.wheelDelta > 0) ? 1 : -1;
        projection.scale(projection.scale() * (1 + (0.05 * direction)));
        spaceProjection.scale(spaceProjection.scale() * (1 + (0.05 * direction)));
        refresh();
    }

    function refresh(duration) {
        gOceans.attr("d", clip); // Refresh Oceans.
        (duration ? gLands.transition().duration(duration) : gLands).attr("d", clip); // Refresh Countries.
        (duration ? gGraticules.transition().duration(duration) : gGraticules).attr("d", clip); // Refresh Graticules.
        (duration ? gRoutes.transition().duration(duration) : gRoutes).attr("d", clip); // Refresh Routes.
        (duration ? gLocations.transition().duration(duration) : gLocations).attr("d", clip); // Refresh Locations.
        if (showLabels) {
            gLocationRects.attr("x", rectX); // Refresh Location Labels.
            gLocationRects.attr("y", rectY); // Refresh Location Labels.
            gLocationTexts.attr("x", clipX); // Refresh Location Labels.
            gLocationTexts.attr("y", clipY); // Refresh Location Labels.
        }
        (duration ? gSpace.transition().duration(duration) : gSpace).attr("d", spacePath); // Refresh Oceans.
    }

    function clip(d) {
        return path(circle.clip(d));
    }
    function rectX(d) {
        return clipX(d) + 6;
    }
    function rectY(d) {
        return clipY(d) - 8;
    }
    function getX (d, i) {
        var xLoc = projection(d.geometry.coordinates)[0];
        return xLoc;
    }
    function getY (d, i) {
        var yLoc = projection(d.geometry.coordinates)[1];
        return yLoc;
    }
    function clipX(d) {
        if (circle.clip(d)) {
            return getX(d);
        } else {
            return -1000;
        }
    }
    function clipY(d) {
        if (circle.clip(d)) {
            return getY(d);
        } else {
            return -1000;
        }
    }

    function createStars(number) {
        var data = [];
        for (var i = 0; i < number; i++) {
            data.push({
                geometry: {
                    type: 'Point',
                    coordinates: randomLonLat()
                },
                type: 'Feature',
                properties: {
                    radius: Math.random() * 1.5
                }
            });
        }
        return data;
    }

    function randomLonLat() {
        return [Math.random() * 360 - 180, Math.random() * 180 - 90];
    }
    
    this.switchTheme = function(theme) {
        gOceansGroup = d3.selectAll("#gOceans").attr("class", "gOceans"+theme);
        gGraticulesGroup = d3.selectAll("#gGraticules").attr("class", "gGraticules"+theme);
        gLandsGroup = d3.selectAll("#gLands").attr("class", "gLands"+theme);
        gRoutesGroup = d3.selectAll("#gRoutes").attr("class","gRoutes");
        gLocationsGroup = d3.selectAll("#gLocations").attr("class", "gLocations" + theme);
        gLocationLabelsGroup = d3.selectAll("#gLocationLabels").attr("class", "gLocationLabels");
    };

    return this;
};