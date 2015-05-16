var node_drag = d3.behavior.drag()
    .on("dragstart", dragstart)
    .on("drag", dragmove)
    .on("dragend", dragend);

function dragstart(d, i) {
    force.stop() // stops the force auto positioning before you start dragging
}

function dragmove(d, i) {
    d.px += d3.event.dx;
    d.py += d3.event.dy;
    d.x += d3.event.dx;
    d.y += d3.event.dy;
    tick(); // this is the key to make it work together with updating both px,py,x,y on d !
}

function dragend(d, i) {
    d.fixed = true; // of course set the node to fixed so the force doesn't include the node in its auto positioning stuff
    tick();
    force.resume();
}

function update() {
    var nodes = flatten(root),
        links = d3.layout.tree().links(nodes);

    // Restart the force layout.
    force
        .nodes(nodes)
        .links(links)
        .start();
        
    // Update the links…
    link = link.data(links, function (d) { return d.target.id; });

    // Exit any old links.
    link.exit().remove();

    // Enter any new links.
    link.enter().insert("line", ".node")
        .attr("class", "link")
        .attr("x1", function (d) { return d.source.x; })
        .attr("y1", function (d) { return d.source.y; })
        .attr("x2", function (d) { return d.target.x; })
        .attr("y2", function (d) { return d.target.y; });

    // Update the nodes…
    node = node.data(nodes, function (d) { return d.id; }).style("fill", color);

    // Exit any old nodes.
    node.exit().remove();

    var node_drag = d3.behavior.drag()
      .on("dragstart", dragstart)
      .on("drag", dragmove)
      .on("dragend", dragend);




    // Enter any new nodes.
    node.enter().append("circle")
         .call(node_drag)
        .attr("class", "node")
        .attr("cx", function (d) { return d.x; })
        .attr("cy", function (d) { return d.y; })
        .attr("r", function (d) { return Math.sqrt(d.size) / 10 || 4.5; })
        .style("fill", color)
        
        .on("click", click);
        
}


function tick() {
    link.attr("x1", function (d) { return d.source.x; })
        .attr("y1", function (d) { return d.source.y; })
        .attr("x2", function (d) { return d.target.x; })
        .attr("y2", function (d) { return d.target.y; });

    node.attr("cx", function (d) { return d.x; })
        .attr("cy", function (d) { return d.y; });
}

// Color leaf nodes black, and packages white or blue.
function color(d) {
    return d._children ? "#3182bd" : d.children ? "#c6dbef" : "#000";
}

// Toggle children on click.
function click(d) {
    if (!d3.event.defaultPrevented) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else {
            d.children = d._children;
            d._children = null;
        }
        update();
    }
}

// Returns a list of all nodes under the root.
function flatten(root) {
    var nodes = [], i = 0;

    function recurse(node) {
        if (node.children) node.children.forEach(recurse);
        if (!node.id) node.id = ++i;
        nodes.push(node);
    }

    recurse(root);
    return nodes;
}

var app = angular.module("D3Graphics", []);

app.directive("sanphics", function () {
    return {

        $scope: {
            title: '=attr1'
        },
        controller: function ($scope, $element, $attrs) {
            $scope.typeOfChart = $attrs.chart;
            $scope.value = $attrs.val;
            $scope.label = $attrs.label;
            $scope.filePath = $attrs.filepath;
            $scope.load = function () {
                var data = new Array;
                d3.json($scope.filePath, function (data) {
                    // data = dataFile.split("\r\n");
                    var barData = data;
                    if ($scope.typeOfChart == 'bar') {
                        d3.json($scope.filePath, function (barData) {
                            //barData = JSON.parse(dataFile);
                            var height = 100;
                            var width = 200;
                            var barWidth = 50;
                            var barOffset = 5;
                            var chart = d3.select("#chart");
                            var svg = chart.append('svg')
                            svg.attr('width', width)
                            .attr('height', height)
                            .style('background', '#FFFFFF');

                            svg.selectAll(".bartext")
                             .data(barData)
                             .enter()
                                 .append("text")
                                 .attr("class", "bartext")
                                 .attr("text-anchor", "middle")
                                 .attr("fill", "black")
                                 .attr("x", function (d, i) {
                                     return i * (barOffset + barWidth) + 20;
                                 })
                                 .attr("y", function (d, i) {
                                     return height - d[$scope.value];
                                 })
                                 .text(function (d) {
                                     return d.label;
                                 });


                            svg.selectAll('rect')
                            .data(barData)
                            .enter().append('rect')
                               .style('fill', '#C61C6F')
                               .attr('width', barWidth)
                               .attr('height', function (d) {
                                   return d[$scope.value];
                               })
                               .attr('x', function (d, i) {
                                   return i * (barOffset + barWidth);
                               })
                               .attr('y', function (d, i) {
                                   return height - d[$scope.value];
                               });


                        });
                    }

                    else if ($scope.typeOfChart == "force") {
                        width = 960;
                        height = 500;
                        //root=0;

                        force = d3.layout.force()
                           .size([width, height])
                           .on("tick", tick)
                        .charge(function (d) { return d._children ? -d.size / 100 : -30; })
                        .linkDistance(function (d) { return d.target._children ? 80 : 30; });


                         svg = d3.select("#chart").append("svg")
                            .attr("width", width)
                            .attr("height", height);

                         link = svg.selectAll(".link"),
                            node = svg.selectAll(".node");

                        d3.json("clusterdata.txt", function (json) {
                            root = json;
                            update();
                        });
                        
                   

                    }
                    else if ($scope.typeOfChart == "cluster") {


                        w = 1500;
                        h = 1500;
                        rx = w / 2;
                        ry = h / 2;
                        m0 = 0;
                        rotate = 0;

                        cluster = d3.layout.cluster()
                           .size([360, ry - 120])
                           .sort(null);

                        diagonal = d3.svg.diagonal.radial()
                           .projection(function (d) { return [d.y, d.x / 180 * Math.PI]; });

                        svg = d3.select("#chart").append("div")
                           .style("width", w + "px")
                           .style('background', '#FFFFFF')
                           .style("height", w + "px");

                        vis = svg.append("svg:svg")
                           .attr("width", w)
                           .attr("height", w)
                         .append("svg:g")

                           .attr("transform", "translate(" + rx + "," + ry + ")");

                        vis.append("svg:path")
                            .attr("class", "arc")
                            .attr("d", d3.svg.arc().innerRadius(ry - 120).outerRadius(ry).startAngle(0).endAngle(2 * Math.PI))
                            .on("mousedown", mousedown);

                        d3.json($scope.filePath, function (json) {
                            var nodes = cluster.nodes(json);

                            var link = vis.selectAll("path.link")
                                .data(cluster.links(nodes))
                              .enter()
                                .append("svg:path")
                                .attr("class", "link")
                                .attr("d", diagonal);

                            var node = vis.selectAll("g.node")
                                .data(nodes)
                              .enter().append("svg:g")
                                .attr("class", "node")
                                .attr("transform", function (d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })

                            node.append("svg:circle")
                                .attr("r", 3);

                            node.append("svg:text")
                                .attr("dx", function (d) { return d.x < 180 ? 8 : -8; })
                                .attr("dy", ".31em")
                                .attr("text-anchor", function (d) { return d.x < 180 ? "start" : "end"; })
                                .attr("transform", function (d) { return d.x < 180 ? null : "rotate(180)"; })
                                .text(function (d) { return d.name; });
                        });

                        d3.select(window)
                            .on("mousemove", mousemove)
                            .on("mouseup", mouseup);



                    }

                    else if ($scope.typeOfChart == 'pie') {

                        d3.json($scope.filePath, function (barData) {
                            //barData = JSON.parse(dataFile);
                            var height = 400;
                            var width = 600;
                            var barWidth = 50;
                            var barOffset = 5;
                            var w = 300,
                            h = 300,
                            r = 100,
                            color = d3.scale.category20c();



                            var vis = d3.select("#chart")
                                .append("svg:svg")
                                .data([barData])
                                .attr("width", w)
                                    .attr("height", h)
                                .append("svg:g")
                                    .attr("transform", "translate(" + r + "," + r + ")")

                            var arc = d3.svg.arc()
                                .outerRadius(r);

                            var pie = d3.layout.pie()
                                .value(function (d) { return d[$scope.value]; });

                            var arcs = vis.selectAll("g.slice")
                                .data(pie)
                                .enter()
                                    .append("svg:g")
                                        .attr("class", "slice");

                            arcs.append("svg:path")
                                    .attr("fill", function (d, i) { return color(i); })
                                    .attr("d", arc);



                            arcs.append("svg:text")
                                    .attr("transform", function (d) {

                                        d.innerRadius = 0;
                                        d.outerRadius = r;
                                        return "translate(" + arc.centroid(d) + ")";
                                    })
                                .attr("text-anchor", "middle")
                                .text(function (d, i) {
                                    if (barData[i][$scope.value] > 0) return barData[i][$scope.label]; else return ""
                                });
                        });
                    }
                });

            };
        },
        template: function (elem, attr) {
            return '<div id="chart"></div>'

        },
        link: function (scope, element, attrs) {

            scope.attr = attrs.attr1
            //            alert("I am loaded1");
            // scope.title = scope.$eval(attrs.attr1);
            //alert(scope.title);
        }
    };
});

function mouse(e) {
    return [e.pageX - rx, e.pageY - ry];
}

function mousedown() {
    m0 = mouse(d3.event);
    d3.event.preventDefault();
}

function mousemove() {
    if (m0) {
        var m1 = mouse(d3.event),
            dm = Math.atan2(cross(m0, m1), dot(m0, m1)) * 180 / Math.PI,
            tx = "translate3d(0," + (ry - rx) + "px,0)rotate3d(0,0,0," + dm + "deg)translate3d(0," + (rx - ry) + "px,0)";
        svg
            .style("-moz-transform", tx)
            .style("-ms-transform", tx)
            .style("-webkit-transform", tx);
    }
}

function children(d) {
    d.children1;
}

function mouseup() {
    if (m0) {
        var m1 = mouse(d3.event),
            dm = Math.atan2(cross(m0, m1), dot(m0, m1)) * 180 / Math.PI,
            tx = "rotate3d(0,0,0,0deg)";

        rotate += dm;
        if (rotate > 360) rotate -= 360;
        else if (rotate < 0) rotate += 360;
        m0 = null;

        svg
            .style("-moz-transform", tx)
            .style("-ms-transform", tx)
            .style("-webkit-transform", tx);

        vis
            .attr("transform", "translate(" + rx + "," + ry + ")rotate(" + rotate + ")")
          .selectAll("g.node text")
            .attr("dx", function (d) { return (d.x + rotate) % 360 < 180 ? 8 : -8; })
            .attr("text-anchor", function (d) { return (d.x + rotate) % 360 < 180 ? "start" : "end"; })
            .attr("transform", function (d) { return (d.x + rotate) % 360 < 180 ? null : "rotate(180)"; });
    }
}

function cross(a, b) {
    return a[0] * b[1] - a[1] * b[0];
}

function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1];
}


$(function () {


});