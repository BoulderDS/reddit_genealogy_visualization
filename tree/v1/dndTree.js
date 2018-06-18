var select2_data = [];
var _root = []
var stratify = d3.stratify()
    .parentId(function(d) {
        return d.parent;
    });
var random_vals = ['AskReddit', 'pics', 'funny', 'Music', 'leagueoflegends',
    'todayilearned', 'worldnews', 'Bitcoin', 'tf2', 'videos', 'trees',
    'AdviceAnimals', 'anime', 'Android', 'DotA2', 'Overwatch',
    'GlobalOffensive', 'Minecraft', 'gonewild', 'WTF', 'news', 'BabyBumps',
    'GrandTheftAutoV', 'Celebs', 'magicTCG', 'mylittlepony',
    'pokemontrades', 'firstworldproblems', 'soccer', 'guns', 'circlejerk',
    'hearthstone', 'atheism', 'electronic_cigarette', 'aww', 'reactiongifs',
    'GlobalOffensiveTrade', 'ass', 'DestinyTheGame', 'fffffffuuuuuuuuuuuu',
    'pcmasterrace', 'movies', 'oculus', 'comicbooks', 'technology',
    'buildapc', 'SquaredCircle', 'amiibo', 'starcraft', 'StarWars',
    'xboxone', 'programming', 'motorcycles', 'television', 'nintendo',
    'Civcraft', 'cats', 'Libertarian', 'spam', 'travel', 'mindcrack',
    'apple', 'gamedev', 'gaymers', 'india', 'MLS', 'Showerthoughts',
    'hiphopheads', 'ClashOfClans', 'ImaginaryCityscapes', 'wow', 'rpg',
    'feedthebeast', 'nfl', 'vita', 'hockey', 'RealGirls', 'Smite',
    'beermoney', 'formula1', 'CollegeBasketball', 'Drugs', 'NoFap',
    'dirtypenpals', 'Games', 'Metal', 'Christianity', '3DS', 'dogecoinbeg',
    'boardgames', 'darksouls', 'Anarchism', 'SkincareAddiction', 'cumsluts',
    'FULLCOMMUNISM', 'Diablo', 'gamegrumps', 'AbandonedPorn',
    'SandersForPresident'
]

function extract_select2_data(node, leaves, index) {
    if (node.children) {
        for (var i = 0; i < node.children.length; i++) {
            index = extract_select2_data(node.children[i], leaves, index)[0];
        }
    } else {
        leaves.push({
            id: ++index,
            text: node.id
        });
    }
    return [index, leaves];
}
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

function searchTree(obj, search, path) {
    if (obj.id === search) { //if search is found return, add the object to the path and return it
        path.push(obj);
        return path;
    } else if (obj.children || obj._children) { //if children are collapsed d3 object will have them instantiated as _children
        var children = (obj.children) ? obj.children : obj._children;
        for (var i = 0; i < children.length; i++) {
            path.push(obj); // we assume this path is the right one
            var found = searchTree(children[i], search, path);
            if (found) { // we were right, this should return the bubbled-up path from the first if statement
                return found;
            } else { //we were wrong, remove this parent from the path and continue iterating
                path.pop();
            }
        }
    } else { //not the right object, return false so it will continue to iterate in the loop
        return false;
    }
}
treeJSON = d3.csv("../../data/d3-reddit.csv", function(error, treeData) {
    treeData = stratify(treeData)
        .sort(function(a, b) {
            return a.id.localeCompare(b.id);
        });
    // Calculate total nodes, max label length
    var selectData = treeData
    nextlevel = []
    for (var i = 0; i < selectData.children.length; i++) {
        if (selectData.children[i].children && selectData.children[i].height >= 2) {
            nextlevel.push(selectData.children[i])
        }
    }
    selectData.children = nextlevel
    select2_data = extract_select2_data(selectData, [], 0)[1];
    autocomplete = []
    for (i in select2_data) {
        autocomplete.push(select2_data[i]['text'])
    }
    $('.typeahead').typeahead({
        hint: true,
        highlight: true,
        minLength: 1
    }, {
        name: 'autocomplete',
        source: substringMatcher(autocomplete)
    });
    var totalNodes = 0;
    var maxLabelLength = 0;
    // variables for drag/drop
    var selectedNode = null;
    var draggingNode = null;
    // panning variables
    var panSpeed = 200;
    var panBoundary = 20; // Within 20px from edges will pan when dragging.
    // Misc. variables
    var i = 0;
    var duration = 750;
    var root;
    // size of the diagram
    var viewerWidth = $(document).width();
    var viewerHeight = $(document).height();
    console.log(viewerWidth, viewerHeight)
    var tree = d3.layout.tree()
        .size([viewerHeight, viewerWidth]);
    // define a d3 diagonal
    //projection for use by the node paths later on.
    var diagonal = d3.svg.diagonal()
        .projection(function(d) {
            return [d.x, d.y];
        });
    // A recursive helper function for performing some setup by walking through all nodes
    function visit(parent, visitFn, childrenFn) {
        if (!parent) return;
        visitFn(parent);
        var children = childrenFn(parent);
        if (children) {
            var count = children.length;
            for (var i = 0; i < count; i++) {
                visit(children[i], visitFn, childrenFn);
            }
        }
    }
    // Call visit function to establish maxLabelLength
    visit(treeData, function(d) {
        totalNodes++;
        maxLabelLength = Math.max(d.id.length, maxLabelLength);
    }, function(d) {
        return d.children && d.children.length > 0 ? d.children : null;
    });
    // sort the tree according to the node names
    // function sortTree() {
    //     tree.sort(function(a, b) {
    //         return b.id.toLowerCase() < a.id.toLowerCase() ? 1 : -1;
    //     });
    // }
    // // Sort the tree initially incase the JSON isn't in a sorted order.
    // sortTree();
    // TODO: Pan function, can be better implemented.
    // Define the zoom function for the zoomable tree
    function zoom() {
        svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }
    // define the zoomListener which calls the zoom function on the "zoom" event constrained within the scaleExtents
    var zoomListener = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoom);
    // define the baseSvg, attaching a class for styling and the zoomListener
    var baseSvg = d3.select("#tree-container").append("svg")
        .attr("width", viewerWidth)
        .attr("height", viewerHeight)
        .attr("class", "overlay")
        .call(zoomListener);
    // Helper functions for collapsing and expanding nodes.
    function collapse(d) {
        if (d.children) {
            d._children = d.children;
            d._children.forEach(collapse);
            d.children = null;
        }
    }

    function expand(d) {
        if (d._children) {
            d.children = d._children;
            d.children.forEach(expand);
            d._children = null;
        }
    }
    var overCircle = function(d) {
        selectedNode = d;
        updateTempConnector();
    };
    var outCircle = function(d) {
        selectedNode = null;
        updateTempConnector();
    };
    // Function to update the temporary connector indicating dragging affiliation
    var updateTempConnector = function() {
        var data = [];
        if (draggingNode !== null && selectedNode !== null) {
            // have to flip the source coordinates since we did this for the existing connectors on the original tree
            data = [{
                source: {
                    x: selectedNode.x0,
                    y: selectedNode.y0
                },
                target: {
                    x: draggingNode.x0,
                    y: draggingNode.y0
                }
            }];
        }
        var link = svgGroup.selectAll(".templink").data(data);
        link.enter().append("path")
            .attr("class", "templink")
            .attr("d", d3.svg.diagonal())
            .attr('pointer-events', 'none');
        link.attr("d", d3.svg.diagonal());
        link.exit().remove();
    };
    // Function to center node when clicked/dropped so node doesn't get lost when collapsing/moving with large amount of children.
    function centerNode(source) {
        scale = zoomListener.scale();
        x = -source.x0;
        y = -source.y0;
        x = x * scale + viewerWidth / 2;
        y = y * scale + viewerHeight / 8;
        d3.select('g').transition()
            .duration(duration)
            .attr("transform", "translate(" + x + "," + y + ")scale(" + scale + ")");
        zoomListener.scale(scale);
        zoomListener.translate([x, y]);
    }
    // Toggle children function
    function toggleChildren(d) {
        if (d.children) {
            d._children = d.children;
            d.children = null;
        } else if (d._children) {
            if (d.temp != undefined && d.temp == true) {
                var curr = d.parent.children.slice(-1)
                d.parent.children.splice(-1, 1)
                d.parent.children = d.parent.children.concat(d._children.slice(0, 10))
                if (d._children.length <= 0) {
                    d.temp = false
                } else {
                    d.parent.children.push(curr[0])
                    d._children = d._children.slice(10)
                }
                return d.parent
            } else if (d._children.length > 10) {
                temp = {
                    temp: true,
                    data: {
                        id: "load more " + d.id,
                        parent: d.id
                    },
                    depth: d.depth,
                    height: d.height,
                    id: "load more " + d.id,
                    parent: d,
                    _children: d._children.slice(5)
                }
                d._children = d._children.slice(0, 5)
                d._children.push(temp)
            }
            d.children = d._children;
            d._children = null;
        }
        return d;
    }
    // Toggle children on click.
    function collapse(d) {
        if (d.children) {
            // nextlevel = []
            // for(var i = 0 ; i < d.children.length;i++){
            //     if(d.children[i].children && d.children[i].height >= 2 ){
            //         nextlevel.push(d.children[i])
            //     }
            // }
            // //console.log(nextlevel.length,nextlevel)
            // d.children = nextlevel
            d._children = d.children;
            d._children.forEach(collapse);
            d.children = null;
        }
    }

    function click(d) {
        // if (d3.event.defaultPrevented) return; // click suppressed
        d = toggleChildren(d);
        update(d, true);
        //centerNode(d);
    }

    function openPaths(paths) {
        for (var i = 0; i < paths.length; i++) {
            if (paths[i].id !== "1") { //i.e. not root
                paths[i].class = 'found';
                if (paths[i]._children) {
                    if (paths[i].temp != undefined && paths[i].temp == true) {
                        paths[i].parent.children.push(paths[i + 1])
                        paths[i].class = undefined
                        update(paths[i].parent, true);
                        continue
                    } else if (paths[i]._children.length > 10) {
                        temp = {
                            temp: true,
                            data: {
                                id: "load more " + paths[i].id,
                                parent: paths[i].id
                            },
                            depth: paths[i].depth,
                            height: paths[i].height,
                            id: "load more " + paths[i].id,
                            parent: paths[i],
                            _children: paths[i]._children.slice(5)
                        }
                        paths[i]._children = paths[i]._children.slice(0, 5)
                        var ispathpresent = false
                        for( path in paths[i]._children){
                            if(paths[i]._children[path].id == paths[i+1].id){
                                ispathpresent= true
                                break
                            }   
                        }
                        if(!ispathpresent){
                            paths[i]._children.push(paths[i+1])
                        }
                        paths[i]._children.push(temp)
                    }
                    paths[i].children = paths[i]._children;
                    paths[i]._children = null;
                }
                update(paths[i], true);
            }
        }
    }
    $("#searchBtn").on("click", function(e) {
        var paths = searchTree(root, document.getElementById('search').value, []);
        if (typeof(paths) !== "undefined") {
            openPaths(paths);
        } else {
            alert(e.object.text + " not found!");
        }
    })
    $("#randomBtn2").on("click", function(e) {
        var root_val = random_vals[Math.round(Math.random() * 100)]
        var paths = searchTree(_root, root_val, [])
        while (paths == undefined) {
            root_val = random_vals[Math.round(Math.random() * 100)]
            console.log(root_val)
            paths = searchTree(_root, root_val, [])
        }
        root = paths[paths.length - 1]
        update(root);
        nextlevel = []
        for (var i = 0; i < root._children.length; i++) {
            nextlevel.push(root._children[i])
        }
        root.children = nextlevel
        root.children.forEach(collapse);
        toggleChildren(root);
        toggleChildren(root);
        update(root);
        centerNode(root);
    })
    $("#randomBtn").on("click", function(e) {
        
        var root_val = random_vals[Math.round(Math.random() * 100)]
        var paths = searchTree(root, root_val, [])
        while (paths == undefined) {
            root_val = random_vals[Math.round(Math.random() * 100)]
            console.log(root_val)
            paths = searchTree(root, root_val, [])
        }
        openChildren(paths);
        centerNode(paths[0]);
    })
    function openChildren(paths) {
        for (var i = 0; i < paths.length; i++) {
            if (paths[i].id !== "1") { //i.e. not root
                paths[i].class = 'found';
                if(paths[i].temp == true){
                    paths[i].class = undefined
                    paths[i].parent.children.unshift(paths[i+1])
                    update(paths[i].parent,true)
                    continue
                }
                if (paths[i]._children) {
                    toggleChildren(paths[i])
                }
                update(paths[i], true);
            }
        }
    }
    $("#resetBtn").on("click", function(e) {
        tree.size([viewerHeight, viewerWidth]);
        root = _root
        root.children.forEach(collapse);
        var resetClass = function(n) {
            if (n.class == 'found') {
                n.class = undefined
            }
            if (n.children && n.children.length > 0) {
                n.children.forEach(resetClass);
            }
            if (n._children && n._children.length > 0) {
                n._children.forEach(resetClass);
            }
        };
        resetClass(root);
        update(root);
        // d3.selectAll('path').style('stroke', "#ccc")
        // d3.selectAll('circle').style("fill", function(d) {
        //         return d._children ? "#049ae5" : "#fff";
        //     })
        centerNode(root);
    })

    function update(source, resize) {
        // Compute the new height, function counts total children of root node and sets tree height accordingly.
        // This prevents the layout looking squashed when new nodes are made visible or looking sparse when nodes are removed
        // This makes the layout more consistent.
        var levelWidth = [1];
        var childCount = function(level, n) {
            if (n.children && n.children.length > 0) {
                if (levelWidth.length <= level + 1) levelWidth.push(0);
                levelWidth[level + 1] += n.children.length;
                n.children.forEach(function(d) {
                    childCount(level + 1, d);
                });
            }
        };
        childCount(0, root);
        //var newHeight = d3.max(levelWidth) * 25;
        var newWidth = d3.max(levelWidth) * 3 * maxLabelLength;
        var newHeight = 50 * d3.max(levelWidth);
        // 25 pixels per line
        if (resize && viewerHeight < newHeight && viewerWidth < newWidth) {
            tree.size([newWidth, newHeight]);
        }
        // Compute the new tree layout.
        var nodes = tree.nodes(root).reverse(),
            links = tree.links(nodes);
        // Set widths between levels based on maxLabelLength.
        nodes.forEach(function(d) {
            d.y = (d.depth * (maxLabelLength * 5)); //maxLabelLength * 10px
            // alternatively to keep a fixed scale one can set a fixed depth per level
            // Normalize for fixed-depth by commenting out below line
            // d.y = (d.depth * 500); //500px per level.
        });
        // Update the nodes…
        node = svgGroup.selectAll("g.node")
            .data(nodes, function(d) {
                return d.id || (d.id = ++i);
            });
        // Enter any new nodes at the parent's previous position.
        var nodeEnter = node.enter().append("g")
            .attr("class", "node")
            .on('click', click);
        // .attr("transform", function(d) {
        //     return "translate(" + source.y0 + "," + source.x0 + ")";
        // })
        nodeEnter.append("circle")
            .attr('class', 'nodeCircle')
            .attr("r", 0)
            .style("fill", function(d) {
                if (d.class === "found") {
                    return "#ff4136"; //red
                }
                return d._children ? "#049ae5" : "#fff";
            })
            .style("stroke", function(d) {
                if (d.class === "found") {
                    return "#ff4136"; //red
                }
            });
        nodeEnter.append("text")
            .attr("y", function(d) {
                return -10;
            })
            .attr("x", function(d) {
                return 0;
            })
            .attr('class', 'nodeText')
            .attr("text-anchor", function(d) {
                return "middle";
            })
            .attr("transform", "rotate(10)")
            .text(function(d) {
                return d.id;
            })
            .style("fill", "#fff")
            .style("fill-opacity", 0);
        // phantom node to give us mouseover in a radius around it
        nodeEnter.append("circle")
            .attr('class', 'ghostCircle')
            .attr("r", 50)
            .attr("opacity", 0.2) // change this to zero to hide the target area
            .style("fill", "red")
            .attr('pointer-events', 'mouseover')
            .on("mouseover", function(node) {
                overCircle(node);
            })
            .on("mouseout", function(node) {
                outCircle(node);
            });
        // Update the text to reflect whether node has children or not.
        node.select('text')
            .attr("x", function(d) {
                return 0;
            })
            .attr("text-anchor", function(d) {
                return "middle";
            })
            .attr("transform", "rotate(10)")
            .text(function(d) {
                return d.id;
            })
            .style("fill", "#fff");
        // Change the circle fill depending on whether it has children and is collapsed
        node.select("circle.nodeCircle")
            .attr("r", function(d) {
                if (d.id.startsWith('load more ', 0)) {
                    return 15;
                } else {
                    return 8;
                }
            })
            .style("fill", function(d) {
                if (d.class === "found") {
                    return "#ff4136"; //red
                }
                return d._children ? "#049ae5" : "#fff";
            });
        // Transition nodes to their new position.
        var nodeUpdate = node.transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            });
        // Fade the text in
        nodeUpdate.select("text")
            .style("fill-opacity", 1);
        // Transition exiting nodes to the parent's new position.
        var nodeExit = node.exit().transition()
            .duration(duration)
            .attr("transform", function(d) {
                return "translate(" + source.x + "," + source.y + ")";
            })
            .remove();
        nodeExit.select("circle")
            .attr("r", 0);
        nodeExit.select("text")
            .style("fill-opacity", 0);
        // Update the links…
        var link = svgGroup.selectAll("path.link")
            .data(links, function(d) {
                return d.target.id;
            });
        // Enter any new links at the parent's previous position.
        link.enter().insert("path", "g")
            .attr("class", "link")
            .attr("d", function(d) {
                var o = {
                    x: source.x0,
                    y: source.y0
                };
                return diagonal({
                    source: o,
                    target: o
                });
            });
        // Transition links to their new position.
        link.transition()
            .duration(duration)
            .attr("d", diagonal)
            .style("stroke", function(d) {
                if (d.target.class === "found") {
                    return "#ff4136";
                }
            });
        // Transition exiting nodes to the parent's new position.
        link.exit().transition()
            .duration(duration)
            .attr("d", function(d) {
                var o = {
                    x: source.x,
                    y: source.y
                };
                return diagonal({
                    source: o,
                    target: o
                });
            })
            .remove();
        // Stash the old positions for transition.
        nodes.forEach(function(d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }
    // Append a group which holds all nodes and which the zoom Listener can act upon.
    var svgGroup = baseSvg.append("g");
    // Define the root
    root = treeData;
    root.x0 = viewerHeight / 5;
    root.y0 = 0;
    nextlevel = []
    for (var i = 0; i < root.children.length; i++) {
        if (root.children[i].children && root.children[i].height >= 2) {
            nextlevel.push(root.children[i])
        }
    }
    root.children = nextlevel
    root.children.forEach(collapse);
    
    toggleChildren(root);
    toggleChildren(root);
    update(root);
    // if(root.children){
    //     for(i in root.children){
    //         if(root.children[i]._children && root.children[i].temp != true){
    //             root.children[i]._children.forEach(collapse);
    //             update(toggleChildren(root.children[i]),true);
    //             update(toggleChildren(root.children[i]),true)
    //         }
    //     }
    // }
    // Layout the tree initially and center on the root node.
    
    centerNode(root);
    _root = root
});

function searchNode() {
    //find the node
    var selectedVal = document.getElementById('search').value;
    var node = d3.selectAll("g.node");
    if (selectedVal == "none") {
        node.style("stroke", "white").style("stroke-width", "1");
    } else {
        var selected = node.filter(function(d, i) {
            return d.id != selectedVal;
        });
        selected.style("opacity", "0");
        var link = d3.selectAll("path.link")
        link.style("opacity", "0");
        // d3.selectAll("g.node, path.link").transition()
        // .duration(5000)
        // .style("opacity", 1);
    }
}

function resetNode() {
    d3.selectAll("g.node, path.link").style("opacity", 1);
}