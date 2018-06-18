var graph = {
        nodes: [],
        links: []
    },


barabasiAlbert = BarabasiAlbert(graph);
graphVis = GraphVis(graph),
    previousTime = -1,
    tickTimes = [],
    tickSamples = 5,
    nodeStep = 1000;
var count = 0;
graphVis.onTick(function() {
    count += 1
    var currentTime = Date.now();
    if (previousTime !== -1) {
        tickTimes.push(currentTime - previousTime);
        if (tickTimes.length === tickSamples) {
            tickTimes.length = 0;
        }
    }
    previousTime = currentTime;
    console.log(count)
});

function addNodes(n) {
    for (var i = 0; i < n; i++) {
        barabasiAlbert.addNode();
    }
    graphVis.update();
}

graphVis.update();

barabasiAlbert.ondataLoad(function(n) {
    for (var i = 0; i < n; i++) {
        barabasiAlbert.addNode();
    }
    graphVis.update();
});

barabasiAlbert.autocomplete(function() {
    var substringMatcher = function(strs) {
        return function findMatches(q, cb) {
            var matches, substringRegex;
            matches = [];
            substrRegex = new RegExp(q, 'i');
            $.each(strs, function(i, str) {
                if (substrRegex.test(str)) {
                    matches.push(str);
                }
            });
            cb(matches);
        };
    };
    var states = [];
    var tempNodes = barabasiAlbert.getNodes();
    for (var i = 0; i < tempNodes.length; i++) {
        states.push(tempNodes[i].id)
    }

    $('.typeahead').typeahead({
        hint: true,
        highlight: true,
        minLength: 1
    }, {
        name: 'states',
        source: substringMatcher(states)
    });
});

function createTree() {
    if (document.getElementsByClassName('typeahead')[1].value.length == 0) {
        location.reload();
    }
    let source = document.getElementsByClassName('typeahead')[1].value
    var child = document.getElementsByTagName('h3')[0];
    var btn = document.getElementById('loadBtn')
    btn.disabled = true;
    child.innerHTML = 'Connections for : ' + source;
    graphVis.destroy()
    data = barabasiAlbert.getLinks();
    targets = []
    for (var i = 0; i < data.length; i++) {
        link = data[i]
        if (link.source == source) {
            targets.push(link.target)
        }
    }
    target_json = []
    for (var i = 0; i < targets.length; i++) {
        child = {
            name: targets[i]
        }
        target_json.push(child)
    }
    root = {
        name: source,
        children: target_json
    }
    createRadialTree(root)
}

function createRadialTree(root) {
    var diameter = 1024;
    var tree = d3.layout.tree()
        .size([360, diameter / 2 - 120])
        .separation(function(a, b) {
            return (a.parent == b.parent ? 1 : 10) / a.depth;
        });

    var diagonal = d3.svg.diagonal.radial()
        .source(function(d) {
            return d.source.depth == 0 ? {
                x: d.target.x,
                y: d.source.y
            } : d.source;
        })
        .projection(function(d) {
            return [d.y, d.x / 180 * Math.PI];
        });

    var svg = d3.select("body").append("svg")
        .attr("width", diameter)
        .attr("height", diameter)
        .append("g")
        .attr("transform",
            "translate(" + diameter / 2 + "," + diameter / 2 + ")");

    var nodes = tree.nodes(root),
        links = tree.links(nodes);

    if (root.children && root.children.length > 200) {
        var link = svg.selectAll(".link")
            .data(links)
            .enter().append("path")
            .attr("class", "link")
            .attr("d", diagonal);
        var node = svg.selectAll(".node")
            .data(nodes)
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", length_transform)
    } else {
        var link = svg.selectAll(".link")
            .data(links)
            .enter().append("path")
            .attr("class", "link")
            .attr("d", diagonal);
        var node = svg.selectAll(".node")
            .data(nodes)
            .enter().append("g")
            .attr("class", "node")
            .attr("transform", function(d) {
                return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"
            });
    }

    node.append("circle")
        .attr("r", 4);

    node.append("text")
        .attr("dy", ".31em")
        .attr("text-anchor", function(d) {
            return d.x < 180 ? "start" : "end";
        })
        .attr("transform", function(d) {
            return d.x < 180 ? "translate(8)" : "rotate(180)translate(-8)";
        })
        .text(function(d) {
            return d.name;
        });
    d3.select(self.frameElement).style("height", diameter - 150 + "px");
}

function length_transform(d) {
    if (Math.random() < 0.4) {
        return "rotate(" + (d.x - 90) + ")translate(" + d.y * 0.2 + ")";
    } else if (Math.random() < 0.4) {
        return "rotate(" + (d.x - 90) + ")translate(" + d.y * 0.5 + ")";
    } else {
        return "rotate(" + (d.x - 90) + ")translate(" + d.y * 1. + ")";
    }
}

function chunkArray(myArray, chunk_size) {
    var index = 0;
    var arrayLength = myArray.length;
    var tempArray = [];

    for (index = 0; index < arrayLength; index += chunk_size) {
        myChunk = myArray.slice(index, index + chunk_size);
        // Do something if you want with the group
        tempArray.push(myChunk);
    }

    return tempArray;
}