if (!d3) { console.log("Warning: D3 Libraries are required (d3.js)."); }
var d3 = d3 || {};
d3.charts = d3.charts || console.log("Warning: D3 charts Libraries are required (charts/d3-charts.js).");

// Azimuthal mapping:
d3.charts.MapAzimuth = function (config) {
    var me = this;
    var target = "#" + config.target || "body",
        title = config.title || "Chart Title",
        yAxisLabel = config.yAxisLabel || "y Axis",
        xAxisLabel = config.xAxisLabel || "x Axis",
        width = config.width || 600,
        height = config.height || 400,
        margin = config.margin || { top: 28, right: 50, bottom: 36, left: 50 },
        trim = config.trim || false,
        projectionOptions = config.projectionOptions || d3.charts.projections.getOptions(width, height),
        oceanData = config.oceanData || d3.charts.oceanData(),
        graticuleData = config.graticuleData || d3.charts.graticuleData(),
        landData = config.landData || [],
        routeData = config.routeData || [],
        locationData = config.locationData || [],
        colorScale = config.colorScale || d3.scaleOrdinal(d3.schemeCategory20),
        theme = config.theme || "Default",
        projectionName = config.projectionName || "Default",
        projectionScale = config.projectionScale || 1,
        showLabels = config.showLabels || false,
        showStars = config.showStars || false,
        showRouteLines = config.showRouteLines || false,
        onLocationClick = config.onLocationClick || function () { };

    var projection, path, circle;
    var spaceProjection, spaceCircle, spacePath;
    var svg;
    var gSpaceGroup, gOceansGroup, gGraticulesGroup, gLandsGroup, gLocationsGroup, gLocationLabelsGroup, gRoutesGroup;
    var gSpace, gOceans, gGraticules, gLands, gLocations, gRoutes;
    var gLocationRects, gLocationTexts;
    var boundingClientRect;
    var projectionMenu;
    d3.charts.projections.currentProjectionIndex = config.projectionIndex || 0;

    // SVG Container:
    svg = d3.select(target)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .on("mousedown", mousedown);

    // Information about the position of the SVG Container:
    boundingClientRect = svg.node().getBoundingClientRect();

    // Projection Menu: 
    projectionMenu = d3.charts.getProjectionMenu(width, height, boundingClientRect.left, boundingClientRect.top);
    projectionMenu.on("change", function () {
        // TODO: Test variable context here:
        // console.log(width,height);
        d3.charts.projections.currentProjectionIndex = this.selectedIndex;
        update(projectionOptions[this.selectedIndex]);
    });

    // Projection Definitions:
    projection = projectionOptions[d3.charts.projections.currentProjectionIndex].projection.translate([((width / 2)-boundingClientRect.left), ((height / 2)-boundingClientRect.top)]);
    circle = d3.geo.greatCircle().origin(projectionOptions[0].projection.origin());
    path = d3.geo.path().projection(projection);

    // Space Projection Definitions:
    spaceProjection = d3.geo.azimuthal()
        .scale(height / 2)
        .origin([-71.03, 42.37])
        .mode("gnomonic")
        .translate([width / 2, height / 2]);
    spaceCircle = d3.geo.greatCircle()
        .origin(spaceProjection.origin());
    spacePath = d3.geo.path()
        .projection(spaceProjection)
        .pointRadius(2);

    // Initialize SVG Groups:
    gSpaceGroup = svg.append("g").attr("id", "gSpace").attr("class", "gSpace" + theme);
    gOceansGroup = svg.append("g").attr("id", "gOceans").attr("class", "gOceans" + theme);
    gGraticulesGroup = svg.append("g").attr("id", "gGraticules").attr("class", "gGraticules" + theme);
    gLandsGroup = svg.append("g").attr("id", "gLands").attr("class", "gLands" + theme);
    gRoutesGroup = svg.append("g").attr("id", "gRoutes").attr("class", "gRoutes" + theme);
    gLocationsGroup = svg.append("g").attr("id", "gLocations").attr("class", "gLocations" + theme);
    gLocationLabelsGroup = svg.append("g").attr("id", "gLocationLabels").attr("class", "gLocationLabels");
    
    // D3 Selections of elements:
    gSpace = gSpaceGroup.selectAll('path');
    gOceans = gOceansGroup.selectAll("path");
    gGraticules = gGraticulesGroup.selectAll("path");
    gLands = gLandsGroup.selectAll("path");
    gRoutes = gRoutesGroup.selectAll("path");
    gLocations = gLocationsGroup.selectAll("path");

    function updateConstellations(show) {
        // TODO: Test hoisting here by moving this to the top. 
        if (show) {
            // Create and add the Space vector:
            gSpaceGroup.append('rect')
                .attr('height', height)
                .attr('width', width);
            
            // Create and add the star vectors:
            gSpace = gSpaceGroup.selectAll('path')
                .data(d3.charts.StarMap.createStars(500))
                .enter()
                .append("path");
        } else {
            gSpaceGroup.selectAll('rect').remove();
            gSpace = gSpaceGroup.selectAll('path').remove();
        }
    }
    updateConstellations(showStars);

    function updateOceans() {
        // Create and add the ocean vector:
        gOceans = gOceansGroup.selectAll("path")
            .data(oceanData)
            .enter()
            .append("svg:path")
            .attr("vector-effect", "non-scaling-stroke");
    }
    updateOceans();

    function updateGraticules() {
        // Create and add the map graticules:
        gGraticules = gGraticulesGroup.selectAll("path")
            .data(graticuleData)
            .enter()
            .append("svg:path")
            .attr("vector-effect", "non-scaling-stroke")
            .attr("pointer-events", "none");
    }
    updateGraticules();

    function updateLands() {
        // Add lands to the land layer:
        gLands = gLandsGroup.selectAll("path")
            .data(landData)
            .enter()
            .append("svg:path");

        // Add mouse over titles to the land masses vectors:
        gLands.append("svg:title")
            .text(function (d) { return d.properties.name; });
    }
    updateLands();

    // Routes update function:
    function updateRoutes(show) {
        if (show) {
            gRoutes = gRoutesGroup.selectAll("path").data(routeData)
                .enter()
                .append("svg:path");
            gRoutes.append("svg:title").text(function (d, i) { return d.source.get("label"); });
        } else {
            gRoutes = gRoutesGroup.selectAll('path').remove();
        }
    }
    updateRoutes(showRouteLines);
      
    // Create and add location vectors:
    function updateLocations(data) {
        gLocations = gLocationsGroup.selectAll("path").data(data)
            .enter()
            .append("svg:path")
            .attr("r", 5)
            .on("click", onLocationClick)
            .on("mouseover", function (d, i) {
                var activeClass = "active";
                var alreadyIsActive = d3.select(this).classed(activeClass);
                gLocations.classed(activeClass, false);
                d3.select(this).classed(activeClass, !alreadyIsActive);
            })
            .on("mouseout", function (d, i) {
                var activeClass = "active";
                var alreadyIsActive = d3.select(this).classed(activeClass);
                gLocations.classed(activeClass, false);
                d3.select(this).classed(activeClass, !alreadyIsActive);
            });

        // Add mouse over titles to the location vectors:
        gLocations.append("svg:title")
            .text(function (d, i) { return d.geometry.source.label; });
    }
    updateLocations(locationData);
    
    // Create and add labels:
    function updateLabels(data){
        gLocationRects = gLocationLabelsGroup.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("width", 30)
            .attr("height", 16).attr("fill", "#ffffff")
            .attr("dy", ".353em");

        // Add the title to the rects:
        gLocationTexts = gLocationLabelsGroup.selectAll("text")
            .data(data)
            .enter()
            .append("text")
            .text(function (d, i) { return data[i].geometry.source.label; })
            .attr("dy", ".353em")
            .attr("dx", ".700em");
    }
    if (showLabels) { updateLabels(locationData); }
    
    /* Gesturing: */
    d3.select(window)
        .on("mousemove", mousemove)
        .on("mouseup", mouseup)
        .on("wheel", mousewheel);

    var m0, o0;

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

            if (showStars) {
                spaceProjection.origin(o2);
                spaceCircle.origin(o2);
            }

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
        if (showStars) {
            spaceProjection.scale(spaceProjection.scale() * (1 + (0.05 * direction)));
        }
        update({ projection: projection });
    }

    /* ProjectionClipping: */
    function getX(d, i) {
        var xLoc = projection(d.geometry.coordinates)[0];
        return xLoc;
    }
    function getY(d, i) {
        var yLoc = projection(d.geometry.coordinates)[1];
        return yLoc;
    }

    function rectX(d) {
        return clipX(d) + 6;
    }
    function rectY(d) {
        return clipY(d) - 8;
    }

    function clip(d) {
        var clip;
        if (d3.charts.projections.currentProjectionIndex === 0) {
            clip = path(circle.clip(d));
        } else {
            clip = path(d);
        }
        return clip;
    }
    function clipX(d) {
        if (d3.charts.projections.currentProjectionIndex === 0) {
            if (circle.clip(d)) {
                return getX(d);
            } else {
                return -1000;
            }
        } else {
            return getX(d);
        }
    }
    function clipY(d) {
        if (d3.charts.projections.currentProjectionIndex === 0) {
            if (circle.clip(d)) {
                return getY(d);
            } else {
                return -1000;
            }
        } else {
            return getY(d);
        }
    }

    // Transition between projections:
    function projectionTween(projection0, projection1) {
        return function (d) {
            var t = 0;
            var projection = d3.geoProjection(project)
                .scale(1)
                .translate([((width / 2)-170), ((height / 2)-80)]);
            var path = d3.geoPath(projection);
            function project(λ, φ) {
                λ *= 180 / Math.PI, φ *= 180 / Math.PI;
                var p0 = projection0([λ, φ]), p1 = projection1([λ, φ]);
                return [(1 - t) * p0[0] + t * p1[0], (1 - t) * -p0[1] + t * -p1[1]];
            }
            return function (_) {
                t = _;
                return path(d);
            };
        };
    }

    // Refresh the locations of everything according to the projection:
    function refresh(duration) {
        gOceans.attr("d", clip); // Refresh Oceans. 
        (duration ? gLands.transition().duration(duration) : gLands).attr("d", clip); // Refresh Countries.
        (duration ? gGraticules.transition().duration(duration) : gGraticules).attr("d", clip); // Refresh Graticules.
        (duration ? gRoutes.transition().duration(duration) : gRoutes).attr("d", clip); // Refresh Routes.
        (duration ? gLocations.transition().duration(duration) : gLocations).attr("d", clip); // Refresh Locations.
        if (showStars) {
            (duration ? gSpace.transition().duration(duration) : gSpace).attr("d", spacePath); // Refresh Space.
        }
        if (showLabels) {
            plotLabels();
        }
    }

    // Location Label positions.
    function plotLabels() {
        gLocationRects.attr("x", rectX); 
        gLocationRects.attr("y", rectY); 
        gLocationTexts.attr("x", clipX); 
        gLocationTexts.attr("y", clipY); 
    }

    // Update and tween the two projections:
    function update(option) {
        //if (!option) {option = {projection:projection}; }
        if (option.name !== "Azimuthal" && option.projection.name !== "azimuthal") {
            if (showStars) { 
                gSpace.attr("d", spacePath);
            }

            gOceans.interrupt().transition()
                .duration(1000).ease(d3.easeLinear)
                .attrTween("d", projectionTween(projection, projection1 = option.projection)); // TODO: projection1 is not defined. Need to address this. 

            gGraticules.interrupt().transition()
                .duration(1000).ease(d3.easeLinear)
                .attrTween("d", projectionTween(projection, projection2 = option.projection));

            gLands.interrupt().transition()
                .duration(1000).ease(d3.easeLinear)
                .attrTween("d", projectionTween(projection, projection3 = option.projection));

            gLocations.interrupt().transition()
                .duration(1000).ease(d3.easeLinear)
                .attrTween("d", projectionTween(projection, projection4 = option.projection));

            gRoutes.interrupt().transition()
                .duration(1000).ease(d3.easeLinear)
                .attrTween("d", projectionTween(projection, projection5 = option.projection));
        }

        projection = option.projection; // TODO: May be an issue here with not having enough assigned.
        path = d3.geo.path().projection(projection);

        if (showLabels) { plotLabels(); }

        if (option.name === "Azimuthal" || option.projection.name === "azimuthal") {
            refresh();
        }
    }

    // API: Switch the theme of the map:
    me.switchTheme = function (theme) {
        gSpaceGroup = d3.selectAll("#gSpace").attr("class", "gSpace" + theme);
        gOceansGroup = d3.selectAll("#gOceans").attr("class", "gOceans" + theme);
        gGraticulesGroup = d3.selectAll("#gGraticules").attr("class", "gGraticules" + theme);
        gLandsGroup = d3.selectAll("#gLands").attr("class", "gLands" + theme);
        gRoutesGroup = d3.selectAll("#gRoutes").attr("class", "gRoutes" + theme);
        gLocationsGroup = d3.selectAll("#gLocations").attr("class", "gLocations" + theme);
        gLocationLabelsGroup = d3.selectAll("#gLocationLabels").attr("class", "gLocationLabels"); // TODO: Possible addition of theming to labels.
    };

    // API: Switch the projection of the map:
    me.switchProjection = function (name) {
        var projection = projectionOptions[0];
        projectionOptions.forEach(function (option, i) {
            if (option.name === name) {
                projection = option;
                d3.charts.projections.currentProjectionIndex = i;
            }
        });
        update(projection);
    };

    // API: Focus to a location:
    me.focusLocation = function(loc) {
        if (projection.name === "azimuthal") {
            projection.origin(loc.geometry.coordinates);
            circle = d3.geo.greatCircle().origin(projection.origin());
            refresh(1000);
        }

        // Set the routes outgoing from this location to active. 
        if (showRouteLines) {
            gRoutes.classed("active", false);
            gRoutes.each(function (d2, i2) {
                var id = d2.source.get("id").slice(0, 3);
                if (id === loc.geometry.source.label) {
                    d3.select(this).classed("active", true);
                }
            });
        }
    };
    
    // API: Show/Hide Routes:
    me.showRoutes = function(show) {
        showRouteLines = show;
        updateRoutes(show);
        update({projection: projection});
    };
    
    // API: Show/Hide Constellation:
    me.showConstellation = function(show) {
        showStars = show;
        updateConstellations(show);
        update({ projection: projection });
    };
    
    if (projection.name === "azimuthal") {
        refresh();
    } else {
        update({ projection: projection });
    }

    // Return this object so that I can reference it:
    return me;
};

// Class for generating a star backdrop:
d3.charts.StarMap = {};
// Create stars for the space backdrop:
d3.charts.StarMap.createStars = function (number) {
    var data = [];
    for (var i = 0; i < number; i++) {
        data.push({
            geometry: {
                type: 'Point',
                coordinates: d3.charts.StarMap.randomLonLat()
            },
            type: 'Feature',
            properties: {
                radius: Math.random() * 1.5
            }
        });
    }
    return data;
};

// Randoms for createStars function:
// TODO: Should be in a general cartography class.
d3.charts.StarMap.randomLonLat = function () {
    return [Math.random() * 360 - 180, Math.random() * 180 - 90];
};

// Ocean Data
d3.charts.oceanData = function () {
    var data = [];
    for (var lat = -90; lat < 90; lat += 45) {
        for (var lon = -180; lon < 180; lon += 45) {
            var coords = [[[lon, lat], [lon + 45, lat], [lon + 45, lat + 45], [lon, lat + 45], [lon, lat]]];
            data.push({ "type": "Feature", area: ["ocean"], "properties": { area: ["ocean"] }, "geometry": { "type": "Polygon", "coordinates": coords } });
        }
    }
    return data;
};

d3.charts.graticuleData = function () {
    return d3.geoGraticule().step([20, 20]).lines();
}

d3.charts.projections = {
    currentProjectionIndex: 17,// 17,
    scale:300,
    getOptions: function (width, height, xOffset, yOffset) {
        var options = [
            { name: "Azimuthal", projection: d3.geo.azimuthal().origin([-71.03, 42.37]).mode("orthographic").scale(this.scale) },
            { name: "Aitoff", projection: d3.geoAitoff().scale(150) },
            { name: "Albers", projection: d3.geoAlbers().scale(145).parallels([20, 50]) },
            { name: "August", projection: d3.geoAugust().scale(70) },
            { name: "Baker", projection: d3.geoBaker().scale(100) },
            { name: "Boggs", projection: d3.geoBoggs() },
            { name: "Bonne", projection: d3.geoBonne().scale(120) },
            { name: "Bromley", projection: d3.geoBromley() },
            { name: "Collignon", projection: d3.geoCollignon().scale(93) },
            { name: "Craster Parabolic", projection: d3.geoCraster() },
            { name: "Eckert I", projection: d3.geoEckert1().scale(165) },
            { name: "Eckert II", projection: d3.geoEckert2().scale(165) },
            { name: "Eckert III", projection: d3.geoEckert3().scale(180) },
            { name: "Eckert IV", projection: d3.geoEckert4().scale(180) },
            { name: "Eckert V", projection: d3.geoEckert5().scale(170) },
            { name: "Eckert VI", projection: d3.geoEckert6().scale(170) },
            { name: "Eisenlohr", projection: d3.geoEisenlohr().scale(60) },
            { name: "Equirectangular (Plate Carrée)", projection: d3.geoEquirectangular().scale(200) },
            { name: "Hammer", projection: d3.geoHammer().scale(165) },
            { name: "Hill", projection: d3.geoHill() },
            { name: "Goode Homolosine", projection: d3.geoHomolosine() },
            { name: "Kavrayskiy VII", projection: d3.geoKavrayskiy7() },
            { name: "Lambert cylindrical equal-area", projection: d3.geoCylindricalEqualArea() },
            { name: "Lagrange", projection: d3.geoLagrange().scale(120) },
            { name: "Larrivée", projection: d3.geoLarrivee().scale(95) },
            { name: "Laskowski", projection: d3.geoLaskowski().scale(120) },
            { name: "Loximuthal", projection: d3.geoLoximuthal() },
            //{ name: "Mercator", projection: d3.geoMercator().scale(490 / 2 / Math.PI)},
            { name: "Miller", projection: d3.geoMiller().scale(100) },
            { name: "McBryde–Thomas Flat-Polar Parabolic", projection: d3.geoMtFlatPolarParabolic() },
            { name: "McBryde–Thomas Flat-Polar Quartic", projection: d3.geoMtFlatPolarQuartic() },
            { name: "McBryde–Thomas Flat-Polar Sinusoidal", projection: d3.geoMtFlatPolarSinusoidal() },
            { name: "Mollweide", projection: d3.geoMollweide().scale(165) },
            { name: "Natural Earth", projection: d3.geoNaturalEarth() },
            { name: "Nell–Hammer", projection: d3.geoNellHammer() },
            { name: "Polyconic", projection: d3.geoPolyconic().scale(100) },
            { name: "Robinson", projection: d3.geoRobinson() },
            { name: "Sinusoidal", projection: d3.geoSinusoidal() },
            //{ name: "Sinu-Mollweide", projection: d3.geoSinuMollweide() },
            { name: "van der Grinten", projection: d3.geoVanDerGrinten().scale(75) },
            { name: "van der Grinten IV", projection: d3.geoVanDerGrinten4().scale(120) },
            { name: "Wagner IV", projection: d3.geoWagner4() },
            { name: "Wagner VI", projection: d3.geoWagner6() },
            { name: "Wagner VII", projection: d3.geoWagner7() },
            { name: "Winkel Tripel", projection: d3.geoWinkel3() }
        ];
        options.forEach(function (o) {
            o.projection.translate([((width / 2) - 170), ((height / 2) - 80)]);
        });
        return options;
    }
};

d3.charts.getProjectionMenu = function (width, height, x, y) {
    var projectionOptions, projectionMenu, projectionMenuOptions;
    projectionOptions = d3.charts.projections.getOptions(width, height, x, y);
    projectionMenu = d3.select("#projection-menu");
    projectionMenuOptions = projectionMenu.selectAll("option")
        .data(projectionOptions)
        .enter().append("option")
        .attr("selected", function (d, i) {
            if (d3.charts.projections.currentProjectionIndex === i) { return "selected"; } else { return null; }
        })
        .text(function (d) { return d.name; });
    return projectionMenu;
};