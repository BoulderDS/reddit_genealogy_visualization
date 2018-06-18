var select2_data = [];
var _root = []
var stratify = d3.stratify()
    .parentId(function(d) {
        return d.parent;
    });
var random_vals = [, 'AskReddit', 'pics', 'funny', 'Music', 'leagueoflegends',
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
    // if (node.children) {
    //     for (var i = 0; i < node.children.length; i++) {
    //         index = extract_select2_data(node.children[i], leaves, index)[0];
    //     }
    // } else {
    //     leaves.push({
    //         id: ++index,
    //         text: node.id
    //     });
    // }
    // return [index, leaves];
    return Array.from(Object.keys(graph))
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

var layer_sample = 2
var graph = {};
var layer_dict = {};
var reverse_dict = {};
var init_random = new Set();

mutliPair = d3.csv("../../data/data-0.04.csv", function(error, entireTree) {
    for (var i = 0; i < entireTree.length; i++) {
        if (entireTree[i]['id'] in graph) {
            graph[entireTree[i]['id']][entireTree[i]['parent']] = parseInt(entireTree[i]['score'], 10)
        } else {
            graph[entireTree[i]['id']] = {}
            graph[entireTree[i]['id']][entireTree[i]['parent']] = parseInt(entireTree[i]['score'], 10)
        }
    }
    layers = d3.csv("../../data/layer_year.csv", function(error, layerData) {

        for (var i = 0; i < layerData.length; i++) {
            layer_dict[layerData[i]['subreddit']] = parseInt(layerData[i]['layer'], 10)
        }

        for (k in layer_dict) {
            v = layer_dict[k]
            v = parseInt(v, 10)
            if (!(v in reverse_dict)) {
                reverse_dict[v] = []
            }
            reverse_dict[v].push(k)
        }
        post_size = d3.csv("../../data/size.csv", function(error, post_size) {
            var post_to_size = {}
            for (var i = 0; i < post_size.length; i++) {
                post_to_size[post_size[i]['subreddit']] = parseInt(post_size[i]['size'])
            }
            //loaded data.
            function sample_layer(graph_d3, layer_dictionary, posts_size, layer_sample, init_samples) {
                chosen = new Set()
                ancestors = new Set()
                if (init_samples) {
                    init_samples.forEach(function(s) {
                        chosen.add(s)
                    });
                }
                ancestors = add_ancestor(ancestors, chosen, graph_d3)
                var yset = Object.keys(layer_dictionary)
                yset.sort(function(a, b) {
                    return parseInt(b, 10) - parseInt(a, 10);
                });
                var max_y = yset.reduce(function(a, b) {
                    return Math.max(parseInt(a, 10), parseInt(b, 10));
                });
                for (y in yset) {
                    candidates = []
                    y_val = parseInt(yset[y], 10)
                    if (y_val == max_y) {
                        for (s in layer_dictionary[y_val]) {
                            candidates.push({
                                postSize: posts_size[layer_dictionary[y_val][s]],
                                subreddit: layer_dictionary[y_val][s]
                            });
                        }
                    } else {
                        for (s in layer_dictionary[y_val]) {
                            if (ancestors.has(layer_dictionary[y_val][s])) {
                                candidates.push({
                                    postSize: posts_size[layer_dictionary[y_val][s]],
                                    subreddit: layer_dictionary[y_val][s]
                                });
                            }
                        }
                    }
                    if (candidates.length == 0)
                        continue
                    sortByKey(candidates, 'postSize')
                    var probs = []
                    for (v in candidates) {
                        probs.push(candidates[v]['postSize'])
                    }

                    function getSum(total, num) {
                        return total + num;
                    }
                    probs_sum = probs.reduce(getSum);
                    for (i in probs) {
                        probs[i] = probs[i] / probs_sum
                    }
                    count = 0
                    if (chosen.size > 0) {
                        for (s in layer_dictionary[y]) {
                            if (layer_dictionary[y][s] in chosen) {
                                count += 1
                            }
                        }
                    }
                    if (layer_sample > count) {
                        var samples = new Set()
                        if (candidates.length < layer_sample - count) {
                            for (var x = 0; x < candidates.length; x++) {
                                //var rand = Math.floor(Math.random() * candidates.length);
                                samples.add(candidates[x]['subreddit'])
                            }
                        } else {
                            for (var x = 0; x < (layer_sample - count); x++) {
                                //var rand = Math.floor(Math.random() * candidates.length);
                                samples.add(candidates[x]['subreddit'])
                            }
                        }
                        samples.forEach(function(i) {
                            chosen.add(i)
                        });
                        ancestors = add_ancestor(ancestors, samples, graph_d3)
                    }
                }
                return [chosen, ancestors]

            }

            function sortByKey(array, key) {
                return array.sort(function(a, b) {
                    var x = a[key];
                    var y = b[key];
                    return ((x < y) ? 1 : ((x > y) ? -1 : 0));
                });
            }

            function add_ancestor(an, samples, graph_d3) {
                samples.forEach(function(s) {
                    for (n in graph_d3[s]) {
                        an.add(n)
                    }
                });
                return an
            }

            function prep_data(chosen) {
                chosen = Array.from(chosen)
                nodes = new Set()
                tree_nodes = []
                multiparentnodes = []
                child_nodes = new Set()
                temp_nodes = new Set()
                parent_nodes = new Set()
                for (node in chosen) {
                    curr = chosen[node];
                    if (curr != undefined && graph[curr] != undefined) {
                        Object.keys(graph[curr]).forEach(function(p) {
                            if (child_nodes.has(curr)) {
                                multiparentnodes.push({
                                    id: curr,
                                    parent: p
                                });
                            } else {
                                child_nodes.add(curr)
                                if (parent_nodes.has(curr)) {
                                    parent_nodes.delete(curr)
                                }
                                if (!temp_nodes.has(p)) {
                                    parent_nodes.add(p)
                                    temp_nodes.add(p)
                                }
                                tree_nodes.push({
                                    id: curr,
                                    parent: p
                                });
                            }
                        })
                    }
                }
                parent_nodes.forEach(function(d) {
                    tree_nodes.push({
                        id: d,
                        parent: 'root'
                    });
                });
                tree_nodes.push({
                    id: 'root',
                    parent: ''
                })
                tree_nodes = tree_nodes.sort(function(a, b) {
                    return a.id.localeCompare(b.id);
                });
                console.log("tree : " + tree_nodes.length)
                console.log('multiparentnodes : ' + multiparentnodes.length)
                tree_nodes = stratify(tree_nodes)
                    .sort(function(a, b) {
                        return a.id.localeCompare(b.id);
                    });
                return [tree_nodes, multiparentnodes];
            }
            initial_samples = ["MemeEconomy", "AskThe_Donald", "bidenbro", "cynicalbritofficial",
                "OverwatchUniversity", "battlefield_one", "2meirl4meirl", "CatTaps",
                "evilbuildings", "fixingmovies"
            ]

            var chosen_nodes = sample_layer(graph, reverse_dict, post_to_size, layer_sample)
            var prep = prep_data(chosen_nodes[0]);
            var treeData = prep[0];
            var pairnodes = prep[1];
            var selectData = treeData
            var autocomplete = []
            autocomplete = extract_select2_data(selectData, [], 0);
            // autocomplete = []
            // for (i in select2_data) {
            //     autocomplete.push(select2_data[i]['text'])
            // }
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
            var tree = d3.layout.tree()
                .size([viewerHeight, viewerWidth]);
            // define a d3 diagonal
            //projection for use by the node paths later on.
            var diagonal = d3.svg.diagonal()
                .projection(function(d) {
                    return [d.x, d.y];
                });
            var linkRadial = d3.svg.diagonal()
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
                y = y * scale + viewerHeight / 25;
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
                    d.children = d._children;
                    d._children = null;
                }
                return d;
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
                            paths[i].children = paths[i]._children;
                            paths[i]._children = null;
                        }
                        update(paths[i], true);
                    }
                }
            }
            $("#searchBtn").on("click", function(e) {
                searchTerm = document.getElementById('search').value
                var paths = searchTree(root, searchTerm, []);
                if (typeof(paths) !== "undefined") {
                    openPaths(paths);
                } else {
                    notFound = true
                    for (i in graph[searchTerm]) {
                        paths = searchTree(root, i, []);
                        if (typeof(paths) !== "undefined") {
                            last = paths.slice(-1)[0]
                            child_path = {
                                data: {
                                    id: searchTerm,
                                    parent: last.id
                                },
                                depth: last.depth + 1,
                                height: 1,
                                id: searchTerm,
                                parent: paths.slice(-1),
                                class: "found"
                            };
                            if (paths.slice(-1)[0]._children) {
                                paths.slice(-1)[0]._children.push(child_path)
                            } else if (paths.slice(-1)[0].children) {
                                paths.slice(-1)[0].children.push(child_path)
                            } else {
                                paths.slice(-1)[0]._children = []
                                paths.slice(-1)[0]._children.push(child_path)

                            }
                            openPaths(paths);
                            notFound = false
                            break;
                        }
                    }
                    if (notFound) {
                        alert(searchTerm + " not found!");
                    }
                }
            })
            $("#loadBtn").on("click", function(e) {
                if (layer_sample >= 5 ) {
                    $('#loadAlert').removeClass('hide')
                    return
                }
                layer_sample += 1
                var chosen_nodes = []
                if( Array.from(init_random).length > 0){
                     chosen_nodes = sample_layer(graph, reverse_dict, post_to_size, layer_sample, Array.from(init_random));
                } else {
                     chosen_nodes = sample_layer(graph, reverse_dict, post_to_size, layer_sample);
                }
                var prep = prep_data(chosen_nodes[0]);
                var treeData = prep[0];
                var temp_pair_nodes = prep[1];
                root = treeData
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
                var tempWidth = d3.max(levelWidth) * 3 * maxLabelLength;
                var tempHeight = 50 * d3.max(levelWidth);
                tree.size([tempWidth, tempHeight]);
                update(root, true, temp_pair_nodes);
                centerNode(root);
                _root = treeData
            })
            $("#randomBtn").on("click", function(e) {
                $('#loadAlert').addClass('hide');
                init_random = new Set()
                layer_sample = 2
                for (var i = 0; i < 5; i++) {
                    init_random.add(initial_samples[Math.floor((Math.random() * 100) % initial_samples.length)])
                }
                var chosen_nodes = sample_layer(graph, reverse_dict, post_to_size, layer_sample, Array.from(init_random))
                var prep = prep_data(chosen_nodes[0]);
                var treeData = prep[0];
                var temp_pair_nodes = prep[1];
                root = treeData
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
                var tempWidth = d3.max(levelWidth) * 3 * maxLabelLength;
                var tempHeight = 50 * d3.max(levelWidth);
                tree.size([tempWidth, tempHeight]);

                update(root, true, temp_pair_nodes);
                centerNode(root);
                _root = treeData
            })


            function update(source, resize, multipairnodes) {
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
                    d.y = (d.depth * (maxLabelLength * 8)); //maxLabelLength * 10px
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
                        return d._children ? "#fff" : "#049ae5";
                    })
                    .style("stroke", function(d) {
                        if (d.id == 'root') {
                            return "#000000";
                        }
                        if (d.class === "found") {
                            return "#ff4136"; //red
                        }
                    })
                    .style("fill-opacity", function(d) {
                        if (d.id == 'root') {
                            return 0;
                        } else {
                            return 1;
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
                        if (d.id == undefined) {
                            console.log(d);
                            return 8;
                        }
                        if (!((typeof d.id === 'string' || d.id instanceof String))) {
                            console.log(d)
                        }
                        if ((typeof d.id === 'string' || d.id instanceof String) &&
                            d.id.startsWith('load more ', 0)) {
                            return 15;
                        } else {
                            return 8;
                        }
                    })
                    .style("fill", function(d) {
                        if (d.id == 'root') {
                            return "#ff4136";
                        }
                        if (d.class === "found") {
                            return "#ff4136"; //red
                        }
                        return d._children ? "#fff" : "#049ae5";
                    })
                    .style("fill-opacity", function(d) {
                        if (d.id == 'root') {
                            return 0;
                        } else {
                            return 1;
                        }
                    });
                // Transition nodes to their new position.
                var nodeUpdate = node.transition()
                    .duration(duration)
                    .attr("transform", function(d) {
                        return "translate(" + d.x + "," + d.y + ")";
                    });
                // Fade the text in
                nodeUpdate.select("text")
                    .style("fill-opacity", function(d) {
                        if (d.id == 'root') {
                            return 0;
                        } else {
                            return 1;
                        }
                    });
                // Transition exiting nodes to the parent's new position.
                var nodeExit = node.exit().transition()
                    .duration(duration)
                    .attr("transform", function(d) {
                        if (d.source) {
                            return "translate(" + d.source.x + "," + d.source.y + ")";
                        } else {
                            return "translate(" + d.x + "," + d.y + ")";
                        }
                    })
                    .remove();
                d3.selectAll('path.additionalParentLink').remove()
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
                            x: d.source.x,
                            y: d.source.y
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
                    })
                    .style("opacity", function(d) {
                        if (d.source.id == 'root') {
                            return 0;
                        } else {
                            return 1;
                        }
                    });
                // Transition exiting nodes to the parent's new position.
                link.exit().transition()
                    .duration(duration)
                    .attr("d", function(d) {
                        var o = {
                            x: d.source.x,
                            y: d.source.y
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

                var curr_nodes = tree.nodes(root)
                    // multipairnodes = [
                    //     {id:'reddit.com', parent:'AndroidPay'},
                    //     {id:'stevenuniverse',parent:'Android'}
                    // ]
                if (multipairnodes == undefined) {
                    multipairnodes = pairnodes
                } else {
                    pairnodes = multipairnodes
                }
                var multipair = multipairnodes
                    // if (source.children && source.children.length > 0) {
                    //     source_children = []
                    //     for (var l = 0; l < curr_nodes.length; l++) {
                    //         source_children.push(curr_nodes[l].id)
                    //     }
                    //     for (var l = 0; l < multipairnodes.length; l++) {
                    //         multiPair = multipairnodes[l]
                    //         if (source_children.includes(multiPair.id)) {
                    //             multipair.push(multiPair)
                    //         }
                    //     }
                    // }

                multiParents = []
                for (var x = 0; x < multipair.length; x++) {
                    parent_1 = tree.nodes(root).filter(function(d) {
                        return d['id'] == multipair[x]['parent']
                    });
                    child_1 = tree.nodes(root).filter(function(d) {
                        return d['id'] == multipair[x]['id']
                    });
                    if (parent_1 != undefined && parent_1.length > 0 &&
                        child_1 != undefined && child_1.length) {
                        if (parent_1[0]._children != undefined ||
                            parent_1[0].depth == child_1[0].depth) {
                            continue
                        } else {
                            multiParents.push({
                                parent: parent_1[0],
                                child: child_1[0]
                            });
                        }
                    }
                }
                multiParents.forEach(function(multiPair) {
                    svgGroup.append("path", "g")
                        .attr("class", "additionalParentLink")
                        .attr("d", function() {
                            var oTarget = {
                                x: multiPair.parent.x0,
                                y: multiPair.parent.y0
                            };
                            var oSource = {
                                x: multiPair.child.x0,
                                y: multiPair.child.y0
                            };
                            //return [d.x, d.y / 180 * Math.PI];
                            return linkRadial({
                                source: oSource,
                                target: oTarget
                            });
                        });
                });

            }



            var svgGroup = baseSvg.append("g");
            svgGroup.append('defs').append('marker')
                .attr('id', 'arrowhead')
                .attr('viewBox', '0 0 10 10 ')
                .attr('refX', 9)
                .attr('refY', 4)
                .attr('orient', 'auto')
                .attr('markerWidth', 5)
                .attr('markerHeight', 5)
                .attr('xoverflow', 'visible')
                .append('svg:path')
                .attr('d', 'M-15,-15 L8,4 L-15,15 L6,6 L-15,-15')
                .attr('fill', '#fff')
                .style('stroke-width', '2px')
                .style('stroke', '#fff');
            // Define the root
            root = treeData;
            root.x0 = viewerHeight / 10;
            root.y0 = 0;
            //root.children.forEach(collapse);
            update(root, true, pairnodes);
            centerNode(root);
            _root = root

        });
    });
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