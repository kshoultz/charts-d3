if (!d3) { console.log("Warning: D3 Libraries are required (d3.js)."); }
var d3 = d3 || {};
d3.charts = d3.charts || console.log("Warning: D3 charts Libraries are required (charts/d3-charts.js).");

d3.charts.MapAzimuthExp = function (config) {
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
        onLocationClick = config.onLocationClick || function () { };


    /****** Projections ******/

    // The different options for projections:
    var options = [
        {
            name: "Azimuthal", projection: d3.geo.azimuthal()
                .scale(width /3, height / 3)
                .origin([-71.03, 42.37])
                .mode("orthographic")
        },
        { name: "Aitoff", projection: d3.geoAitoff() },
        { name: "Albers", projection: d3.geoAlbers().scale(145).parallels([20, 50]) },
        { name: "August", projection: d3.geoAugust().scale(60) },
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
        { name: "Equirectangular (Plate Carrée)", projection: d3.geoEquirectangular() },
        { name: "Hammer", projection: d3.geoHammer().scale(165) },
        { name: "Hill", projection: d3.geoHill() },
        { name: "Goode Homolosine", projection: d3.geoHomolosine() },
        { name: "Kavrayskiy VII", projection: d3.geoKavrayskiy7() },
        { name: "Lambert cylindrical equal-area", projection: d3.geoCylindricalEqualArea() },
        { name: "Lagrange", projection: d3.geoLagrange().scale(120) },
        { name: "Larrivée", projection: d3.geoLarrivee().scale(95) },
        { name: "Laskowski", projection: d3.geoLaskowski().scale(120) },
        { name: "Loximuthal", projection: d3.geoLoximuthal() },
        // {name: "Mercator", projection: d3.geoMercator().scale(490 / 2 / Math.PI)},
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
        { name: "Sinu-Mollweide", projection: d3.geoSinuMollweide() },
        { name: "van der Grinten", projection: d3.geoVanDerGrinten().scale(75) },
        { name: "van der Grinten IV", projection: d3.geoVanDerGrinten4().scale(120) },
        { name: "Wagner IV", projection: d3.geoWagner4() },
        { name: "Wagner VI", projection: d3.geoWagner6() },
        { name: "Wagner VII", projection: d3.geoWagner7() },
        { name: "Winkel Tripel", projection: d3.geoWinkel3() }
    ];
    options.forEach(function (o) {
        o.projection.translate([width / 2, height / 2]);
    });
    var i = 0,
        n = options.length - 1;

    var menu = d3.select("#projection-menu")
        .on("change", change);

    menu.selectAll("option")
        .data(options)
        .enter().append("option")
        .text(function (d) { return d.name; });


    // World Projection:
    var projection = options[0].projection;

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
    
    var path = d3.geo.path()
        .projection(projection);

    var spacePath = d3.geo.path()
        .projection(spaceProjection)
        .pointRadius(2);
    // End Projection.


    /****** SVG ******/

    // SVG Groups: 
    var svg;
    var gSpaceGroup, gOceansGroup, gGraticulesGroup, gLandsGroup, gLocationsGroup, gLocationLabelsGroup, gRoutesGroup;
    var gSpace, gOceans, gGraticules, gLands, gLocations, gRoutes;
    
    // SVG Container:
    var svg = d3.select(target)
        .append("svg")
            .attr("width", width)
            .attr("height", height)
            .on("mousedown", mousedown);

    // Initialize SVG Groups:
    gSpaceGroup = svg.append("g").attr("id", "gSpace").attr("class", "gSpace");
    gOceansGroup = svg.append("g").attr("id", "gOceans").attr("class", "gOceans" + theme);
    gGraticulesGroup = svg.append("g").attr("id", "gGraticules").attr("class", "gGraticules" + theme);
    gLandsGroup = svg.append("g").attr("id", "gLands").attr("class", "gLands" + theme);
    gRoutesGroup = svg.append("g").attr("id", "gRoutes").attr("class", "gRoutes");
    gLocationsGroup = svg.append("g").attr("id", "gLocations").attr("class", "gLocations" + theme);
    gLocationLabelsGroup = svg.append("g").attr("id", "gLocationLabels").attr("class", "gLocationLabels");

    // Create and add the ocean vector:
    gSpaceGroup.append('rect')
        .attr('height', height)
        .attr('width', width);

    // Create and add the star vectors:
    gSpace = gSpaceGroup.selectAll("path")
        .data(createStars(500))
            .enter()
                .append("path")
                .attr("d", spacePath);

    // Create the ocean data:
    var oceanData = [];
    for (var lat = -90; lat < 90; lat += 45) {
        for (var lon = -180; lon < 180; lon += 45) {
            var coords = [[[lon, lat], [lon + 45, lat], [lon + 45, lat + 45], [lon, lat + 45], [lon, lat]]];
            oceanData.push({ "type": "Feature", area: ["ocean"], "properties": { area: ["ocean"] }, "geometry": { "type": "Polygon", "coordinates": coords } });
        }
    }

    // Create and add the ocean vector:
    gOceans = gOceansGroup.selectAll("path")
        .data(oceanData)
            .enter()
                .append("svg:path")
                    .attr("vector-effect", "non-scaling-stroke")
                    .attr("d", clip);

    // Create and add the map graticules:
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

    // Add mouse over titles to the land masses vectors:
    gLands.append("svg:title")
        .text(function (d) { return d.properties.name; });

    // If route data is provided:
    if (routeData !== undefined) {

        // Create and add the route vectors
        gRoutes = gRoutesGroup.selectAll("path")
            .data(routeData)
                .enter()
                    .append("path")
                    .attr("d", clip);
                    /*
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
                        });
                    */

        // Add mouse over titles for the routes:
        gRoutes.append("svg:title")
            .text(function (d, i) { return d.source.get("label"); });
    } else {

        // Initialize routes:
        gRoutes = gRoutesGroup.selectAll("path");
    }

    // Create and add location vectors:
    gLocations = gLocationsGroup.selectAll("path")
        .data(data)
            .enter()
                .append("svg:path")
                    //.classed("gLocation",true)
                .attr("r", 5)
                .attr("d", clip)
                .on("click", function (d, i) {
                    onLocationClick(d, i);
                    projection.origin(projection.invert(d3.mouse(this)));
                    circle = d3.geo.greatCircle().origin(projection.origin());
                    refresh(1000);

                    // Set the routes outgoing from this location to active. 
                    var debark = d.geometry.source.record.get("id");
                    gRoutes.classed("active", false);
                    gRoutes.each(function (d2, i2) {
                        var routeDebarkId = d2.source.get("id").slice(0, 3);
                        console.log(routeDebarkId);
                        if (routeDebarkId === debark) {
                            d3.select(this).classed("active", true);
                        }
                    });
                })
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
        .text(function (d, i) { return data[i].label; });

    // If show labels is set to true:
    if (showLabels) {

        // Create Labels group:
        var gLocationLabels = gLocationLabelsGroup.selectAll("g")
            .data(data)
            .enter()
            .append("g")
            .attr("x", clipX)
            .attr("y", clipY);

        // Create and add labels:
        var gLocationRects = gLocationLabelsGroup.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("width", 80)
            .attr("height", 16).attr("fill", "#ffffff")
            .attr("x", rectX)
            .attr("y", rectY)
            .attr("dy", ".353em");

        // Add the title to the rects:
        var gLocationTexts = gLocationLabelsGroup.selectAll("text")
            .data(data)
            .enter()
            .append("text")
            .text(function (d, i) { return data[i].label; })
            .attr("x", clipX)
            .attr("y", clipY)
            .attr("dy", ".353em")
            .attr("dx", ".700em");
    }

    // Add global event handlers:
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

    function clip(d) {
        return path(circle.clip(d));
    }
    function rectX(d) {
        return clipX(d) + 6;
    }
    function rectY(d) {
        return clipY(d) - 8;
    }
    function getX(d, i) {
        var xLoc = projection(d.geometry.coordinates)[0];
        return xLoc;
    }
    function getY(d, i) {
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

    // Create stars for the space backdrop:
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

    // Randoms for createStars function:
    function randomLonLat() {
        return [Math.random() * 360 - 180, Math.random() * 180 - 90];
    }

    // To switch the them of the map:
    this.switchTheme = function (theme) {
        gOceansGroup = d3.selectAll("#gOceans").attr("class", "gOceans" + theme);
        gGraticulesGroup = d3.selectAll("#gGraticules").attr("class", "gGraticules" + theme);
        gLandsGroup = d3.selectAll("#gLands").attr("class", "gLands" + theme);
        gRoutesGroup = d3.selectAll("#gRoutes").attr("class", "gRoutes");
        gLocationsGroup = d3.selectAll("#gLocations").attr("class", "gLocations" + theme);
        gLocationLabelsGroup = d3.selectAll("#gLocationLabels").attr("class", "gLocationLabels");
    };
    function loop() {
        var j = Math.floor(Math.random() * n);
        menu.property("selectedIndex", i = j + (j >= i));
        update(options[i]);
    }
    function change() {
        //clearInterval(interval);
        update(options[this.selectedIndex]);
    }
    /*
    function update(option) {
        svg.selectAll("path").interrupt().transition()
            .duration(1000).ease(d3.easeLinear)
            .attrTween("d", projectionTween(projection, projection = option.projection))
        //refresh();
        d3.timeout(loop, 2000)
    }
    */
    function update(option) {
        // gSpace, gOceans, gGraticules, gLands, gLocations, gRoutes
        gOceans.interrupt().transition()
            .duration(1000).ease(d3.easeLinear)
            .attrTween("d", projectionTween(projection, projection1 = option.projection));

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

        projection = option.projection;
    }

    // Transition between projections:
    function projectionTween(projection0, projection1) {
        return function (d) {
            var t = 0;
            var projection = d3.geoProjection(project)
                .scale(1)
                .translate([width / 2, height / 2]);
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
        if (showLabels) {
            gLocationRects.attr("x", rectX); // Refresh Location Labels.
            gLocationRects.attr("y", rectY); // Refresh Location Labels.
            gLocationTexts.attr("x", clipX); // Refresh Location Labels.
            gLocationTexts.attr("y", clipY); // Refresh Location Labels.
        }
        (duration ? gSpace.transition().duration(duration) : gSpace).attr("d", spacePath); // Refresh Oceans.
    }

    // Return this object so that I can reference it:
    return this;
};