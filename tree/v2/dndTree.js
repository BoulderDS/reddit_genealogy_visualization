Array.prototype.removeValue = function(name, value) {
    var array = $.map(this, function(v, i) {
        return v[name] === value ? null : v;
    });
    this.length = 0; //clear original array
    this.push.apply(this, array); //push all elements except the one we want to delete
}

//countries.results.removeValue('name', 'Albania');

var select2_data = [];
var _root = []
var stratify = d3.stratify()
    .parentId(function(d) {
        return d.parent;
    });
var random_vals = [, 'AskReddit', 'pics', 'funny', 'Music', 'leagueoflegends',
    'todayilearned', 'worldnews', 'Bitcoin', 'tf2', 'videos', 'trees',
    'AdviceAnimals', 'anime', 'Android', 'DotA2', 'Overwatch',
    'GlobalOffensive', 'gonewild', 'WTF', 'news', 'BabyBumps',
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
    if (obj.id === search) {
        path.push(obj);
        return path;
    } else if (obj.children || obj._children) {
        var children = (obj.children) ? obj.children : obj._children;
        for (var i = 0; i < children.length; i++) {
            path.push(obj);
            var found = searchTree(children[i], search, path);
            if (found) {
                return found;
            } else {
                path.pop();
            }
        }
    } else {
        return false;
    }
}

var layer_sample = 3
var graph = {};
var layer_dict = {};
var reverse_dict = {};
var init_random = new Set();
var parentGraph = {}
mutliPair = d3.csv("../../data/data-full.csv", function(error, entireTree) {
    for (var i = 0; i < entireTree.length; i++) {
        if (entireTree[i]['id'] in graph) {
            graph[entireTree[i]['id']][entireTree[i]['parent']] = parseFloat(entireTree[i]['score'], 10)

        } else {
            graph[entireTree[i]['id']] = {}
            graph[entireTree[i]['id']][entireTree[i]['parent']] = parseFloat(entireTree[i]['score'], 10)

        }
        if (entireTree[i]['parent'] in parentGraph) {
            parentGraph[entireTree[i]['parent']].push(entireTree[i]['id'])
        } else {
            parentGraph[entireTree[i]['parent']] = []
            parentGraph[entireTree[i]['parent']].push(entireTree[i]['id'])
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
            function sample_layer(graph_d3, layer_dictionary,
                posts_size, layer_sample, init_samples) {
                chosen = new Set()
                ancestors = new Set()
                if (init_samples) {
                    init_samples.forEach(function(s) {
                        chosen.add(s)
                    });
                }
                ancestors = add_ancestor(ancestors, chosen, graph_d3)
                if (init_samples) {
                    ancestors.delete('reddit.com')
                }
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
                        if ( max_y- 2  <= y_val
                            || candidates.length < layer_sample - count) {
                            for (var x = 0; x < candidates.length; x++) {
                                samples.add(candidates[x]['subreddit'])
                            }
                        } else {
                            for (var x = 0; x < (layer_sample * 3 - count) && x < candidates.length; x++) {
                                samples.add(candidates[x]['subreddit'])
                            }
                        }
                        // for (var x = 0; x < candidates.length; x++) {
                        //          samples.add(candidates[x]['subreddit'])
                        // }
                        samples.forEach(function(i) {
                            chosen.add(i)
                        });
                        ancestors = add_ancestor(ancestors, samples, graph_d3)
                    }
                }
                console.log(chosen);
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

            function prep_data(chosen, isRandomFlow, isSearchFlow, searchTerm) {
                chosen_copy = chosen
                var rand_val = Math.random()
                if (isRandomFlow) console.log(Math.floor(rand_val * 4))
                chosen = Array.from(chosen);
                chosen_layer = {}
                chosen.forEach(function(d) {
                    chosen_layer[d] = layer_dict[d];
                });
                parent_count = {}
                nodes = new Set()
                tree_nodes = []
                multiparentnodes = []
                child_nodes = new Set()
                temp_nodes = new Set()
                parent_nodes = new Set()
                search_term_parents = {}
                for (node in chosen) {
                    curr = chosen[node];
                    curr_layer = chosen_layer[curr];
                    if (isRandomFlow && Math.floor(rand_val * 4 + 1) > curr_layer) {
                        continue
                    } else if (curr != undefined && graph[curr] != undefined) {
                        Object.keys(graph[curr]).forEach(function(p) {
                            if ((layer_dict[p] == 0 &&
                                    layer_dict[curr] == 0) || (!(chosen_copy.has(p)))) {
                                // console.log('0', curr, p)
                                //ignore same level for 0.
                            } else if (isSearchFlow && curr == searchTerm) {
                                search_term_parents[p] = layer_dict[p]
                            } else if ((!(child_nodes.has(curr)) &&
                                    layer_dict[p] + 1 == layer_dict[curr])) {
                                if (p == searchTerm) {
                                    console.log(curr, p)
                                }
                                if (p in parent_count) {
                                    parent_count[p]++;
                                } else {
                                    parent_count[p] = 1
                                }
                                if ((isRandomFlow && parent_count[p] > rand_val * 4 + 1) ||
                                    (parent_count[p] > 3)) {
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

                            } else if (child_nodes.has(curr)) {
                                multiparentnodes.push({
                                    id: curr,
                                    parent: p
                                });
                            }
                        })
                    }
                }
                if (isSearchFlow && Object.keys(search_term_parents).length != 0) {
                    var items = Object.keys(search_term_parents).map(function(key) {
                        return [key, search_term_parents[key]];
                    });

                    items.sort(function(first, second) {
                        return second[1] - first[1];
                    });
                    parent_curr = items[0][0]
                    curr = searchTerm

                    if (parent_nodes.has(curr)) {
                        parent_nodes.delete(curr)
                    }
                    if (!temp_nodes.has(parent_curr)) {
                        parent_nodes.add(parent_curr)
                        temp_nodes.add(parent_curr)
                    }
                    tree_nodes.push({
                        id: curr,
                        parent: parent_curr
                    });
                    items = items.slice(1)
                    items.forEach(function(d) {
                        multiparentnodes.push({
                            id: curr,
                            parent: d[0]
                        });
                    });

                } else if (isSearchFlow && Object.keys(search_term_parents).length == 0) {
                    tree_nodes.push({
                        id: searchTerm,
                        parent: 'root'
                    })
                }
                parent_nodes.forEach(function(d) {
                    if (Object.keys(tree_nodes.filter(function(x) {
                            return d == x.id;
                        })).length > 0) {
                        console.log('err:', d);
                    } else {
                        tree_nodes.push({
                            id: d,
                            parent: 'root'
                        });

                    }
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
                try {
                    tree_nodes = stratify(tree_nodes)
                        .sort(function(a, b) {
                            return post_to_size[b.id] - post_to_size[a.id];
                        });

                } catch (e) {
                    console.log(e);
                    $('.center').addClass('hide')
                }
                if (isSearchFlow) {
                    var paths = searchTree(tree_nodes, searchTerm, []);

                }
                var rootData = $.extend(true, {}, tree_nodes);
                if (isRandomFlow) {
                    parent_count = {}
                    rootData.children.sort(function() {
                        return .5 - Math.random();
                    });
                    minLayer = 100;
                    rootData.children.forEach(function(d) {
                        if (layer_dict[d.id] in parent_count) {
                            parent_count[layer_dict[d.id]]++;
                        } else {
                            parent_count[layer_dict[d.id]] = 1
                        }
                        if (layer_dict[d.id] < minLayer) {
                            minLayer = layer_dict[d.id]
                        }
                    });
                    layer_count = 0
                    rootData.children.forEach(function(d) {
                        if (layer_count < 6 &&
                            layer_dict[d.id] == minLayer) {
                            layer_count += 1
                        } else {
                            tree_nodes.children.removeValue('id', d.id);
                        }
                    });
                } else {
                    rootData.children.forEach(function(d) {
                        if (isSearchFlow && paths != undefined &&
                            paths[1].id == d.id) {
                            console.log('search flow ignore : ', d.id);
                        } else if (layer_dict[d.id] == 0) {
                            //console.log('top level ', d.id)
                        } else if (d.height < 6) {
                            tree_nodes.children.removeValue('id', d.id);
                        }
                    });
                }
                return [tree_nodes, multiparentnodes];
            }
            this.initial_samples = ["MemeEconomy", "AskThe_Donald", "bidenbro", "cynicalbritofficial",
                "OverwatchUniversity", "battlefield_one", "2meirl4meirl", "CatTaps",
                "evilbuildings", "fixingmovies", "worldnews", "reddit.com", "politics", "science", "entertainment",
                "business", "programming", "sports", "gaming", "gadgets", "netsec", "ads", "pics", "cogsci", "request", "features",
                "wikipedia", "blogs", "astro", "productivity", "environment", "Hillary", "Christianity",
                "hot", "history", "scifi", "Pets", "philosophy", "China", "virtualization", "firefox",
                "iphone", "food", "hackers", "microsoft", "craigslist", "Transhuman", "insomnia", "humor",
                "howto", "religion", "sex", "florida", "google", "fsm", "Art", "startups", "dailywt"
            ]


            var chosen_nodes = sample_layer(graph, reverse_dict, post_to_size, layer_sample)
            var prep = prep_data(chosen_nodes[0]);


            var treeData = prep[0];

            var pairnodes = prep[1];
            var selectData = treeData
            var autocomplete = []

            var div = d3.select("body").append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);

            autocomplete = extract_select2_data(selectData, [], 0);
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
            var selectedNode = null;
            var draggingNode = null;
            var panSpeed = 200;
            var panBoundary = 20;
            var i = 0;
            var duration = 750;
            var root;
            var viewerWidth = $(document).width();
            var viewerHeight = $(document).height();
            var tree = d3.layout.tree()
                .size([viewerHeight, viewerWidth])
            var diagonal = d3.svg.diagonal()
                .projection(function(d) {
                    return [d.x, d.y];
                });
            var linkRadial = d3.svg.diagonal()
                .projection(function(d) {
                    return [d.x, d.y];
                });

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
            visit(treeData, function(d) {
                totalNodes++;
                maxLabelLength = Math.max(d.id.length, maxLabelLength);
            }, function(d) {
                return d.children && d.children.length > 0 ? d.children : null;
            });

            function zoom() {
                svgGroup.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
            }
            var zoomListener = d3.behavior.zoom().scaleExtent([0.1, 3]).on("zoom", zoom);
            var baseSvg = d3.select("#tree-container").append("svg")
                .attr("width", viewerWidth)
                .attr("height", viewerHeight)
                .attr("class", "overlay")
                .call(zoomListener);

            var svgGroup = baseSvg.append("g");
            svgGroup.append('defs').append('marker')
                .attr('id', 'arrowhead')
                .attr('viewBox', '0 -5 10 10 ')
                .attr('markerUnits', 'userSpaceOnUse')
                .attr('refX', 15)
                .attr('refY', 0)
                .attr('orient', 'auto')
                .attr('markerWidth', 13)
                .attr('markerHeight', 13)
                .append('svg:path')
                .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
                .attr('fill', '#000000')
                .style('stroke-width', '2px')
                .style('stroke', 'none')
            svgGroup.append('defs').append('marker')
                .attr('id', 'reversearrowhead')
                .attr('viewBox', '0 -2 5 5 ')
                .attr('markerUnits', 'userSpaceOnUse')
                .attr('refX', 0)
                .attr('refY', 0)
                .attr('orient', '')
                .attr('markerWidth', 13)
                .attr('markerHeight', 13)
                .append('svg:path')
                .attr('d', 'M 0,-2 L 5 ,0 L 0,2')
                .attr('fill', '#000000')
                .style('stroke-width', '2px')
                .style('stroke', 'none');

            var defs = svgGroup.append("defs");
            defs.append("marker")
                .attr("id", "triangle-start")
                .attr("viewBox", "0 0 10 10")
                .attr('markerUnits', 'userSpaceOnUse')
                .attr("refX", 15)
                .attr("refY", 5)
                .attr("markerWidth", 13)
                .attr("markerHeight", 13)
                .attr("orient", "auto")
                .append("path")
                .attr("d", "M 0 0 L 10 5 L 0 10 z");


            root = treeData;
            root.x0 = viewerHeight / 10;
            root.y0 = 0;
            update(root, true, pairnodes);
            centerNode(root.children[Math.floor(root.children.length / 2)]);
            _root = root

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
                y = y * scale + viewerHeight / 10;
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
                        if (paths[i]._children &&
                            !i == paths.length - 1) {
                            paths[i].children = paths[i]._children;
                            paths[i]._children = null;
                        }
                        update(paths[i], true);
                    }
                }
            }
            // $("#searchBtn").on("click", function(e) {
            //     searchTerm = document.getElementById('search').value
            //     var paths = searchTree(root, searchTerm, []);
            //     if (typeof(paths) !== "undefined") {
            //         openPaths(paths);
            //     } else {
            //         notFound = true
            //         for (i in graph[searchTerm]) {
            //             paths = searchTree(root, i, []);
            //             if (typeof(paths) !== "undefined") {
            //                 last = paths.slice(-1)[0]
            //                 child_path = {
            //                     data: {
            //                         id: searchTerm,
            //                         parent: last.id
            //                     },
            //                     depth: last.depth + 1,
            //                     height: 1,
            //                     id: searchTerm,
            //                     parent: paths.slice(-1),
            //                     class: "found"
            //                 };
            //                 if (paths.slice(-1)[0]._children) {
            //                     paths.slice(-1)[0]._children.push(child_path)
            //                 } else if (paths.slice(-1)[0].children) {
            //                     paths.slice(-1)[0].children.push(child_path)
            //                 } else {
            //                     paths.slice(-1)[0]._children = []
            //                     paths.slice(-1)[0]._children.push(child_path)

            //                 }
            //                 openPaths(paths);
            //                 notFound = false
            //                 break;
            //             }
            //         }
            //         if (notFound) {
            //             alert(searchTerm + " not found!");
            //         }
            //     }
            // })

            $("#searchBtn").on("click", function(e) {
                searchTerm = document.getElementById('search').value
                searchTerm = searchTerm.replace(/\s/g, '');
                if (searchTerm == null ||
                    searchTerm == undefined ||
                    searchTerm.length == 0) {
                    return
                }
                $('#loadAlert').addClass('hide');
                $('.center').removeClass('hide')
                var searchRandom = new Set()
                for (var i = 0; i < 5; i++) {
                    searchRandom.add(random_vals[Math.floor((Math.random() * 100) % random_vals.length)])
                }
                searchRandom.add(searchTerm)
                if (layer_dict[searchTerm] != 0) {
                    layer_sample = 2

                    if (parentGraph[searchTerm]&&
                        graph[searchTerm]) {
                        parents = Object.keys(graph[searchTerm])
                        parents.sort(function() {
                            return .5 - Math.random();
                        });
                        parents.slice(0,5).forEach(function(d) {
                            searchRandom.add(d)
                        });
                        parentGraph[searchTerm].sort(function() {
                            return .5 - Math.random();
                        });
                        parentGraph[searchTerm].slice(0,5).forEach(function(d) {
                            searchRandom.add(d);
                        });
                    }
                } else {
                    layer_sample = 2
                    if (parentGraph[searchTerm]) {
                        parentGraph[searchTerm].slice(0, 10).forEach(function(d) {
                            searchRandom.add(d);
                            if (parentGraph[d] != undefined &&
                                parentGraph[d].length > 0) {
                                //init_random.add(parentGraph[d][0]);
                            }
                        })

                    }
                }
                console.log('init_samples for random :', searchRandom)
                var chosen_nodes = sample_layer(graph, reverse_dict, post_to_size, layer_sample, Array.from(searchRandom))
                var prep = prep_data(chosen_nodes[0], false, true, searchTerm);
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
                centerNode(root.children[Math.floor(root.children.length / 2)]);
                _root = treeData
                var paths = searchTree(root, searchTerm, []);
                if (typeof(paths) !== "undefined") {
                    openPaths(paths);
                } else {
                    alert(searchTerm + " not found!");
                }
                $('.center').addClass('hide')
            })

            function update(source, resize, multipairnodes) {
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
                if (multipairnodes == undefined) {
                    multipairnodes = pairnodes
                } else {
                    pairnodes = multipairnodes
                }
                var multipair = multipairnodes
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
                        if (parent_1[0].depth >= child_1[0].depth) {
                            continue
                        } else {
                            multiParents.push({
                                parent: parent_1[0],
                                child: child_1[0]
                            });
                        }
                    }
                }

                //var newHeight = d3.max(levelWidth) * 25;
                var newWidth = d3.max(levelWidth) * 5 * maxLabelLength;
                var newHeight = 50 * d3.max(levelWidth);
                // 25 pixels per line
                if (resize && viewerHeight < newHeight && viewerWidth < newWidth) {
                    tree.size([newWidth, newHeight]);
                }
                // Compute the new tree layout.
                var nodes = tree.nodes(root).reverse(),
                    links = tree.links(nodes);
                // nodes.forEach(function(d) {
                //     if(d.depth != 0){
                //         d.depth = layer_dict[d.id]+1;
                //     }
                // });
                //Set widths between levels based on maxLabelLength.
                node_ids = new Set();
                nodes.forEach(function(d) {
                    d.y = (d.depth * (maxLabelLength * 8));
                    //maxLabelLength * 10px
                    node_ids.add(d.id)
                });
                nodes.forEach(function(d) {
                    if ((d.children == undefined) &&
                        (d._children == undefined) &&
                        (parentGraph[d.id] != undefined)) {
                        child_ids = new Set();
                        parentGraph[d.id].forEach(function(l) {
                            if (!node_ids.has(l)) {
                                child_ids.add(l)
                            }
                        });
                        d._children = []
                        Array.from(child_ids).slice(0, 5).forEach(function(id) {
                            d._children.push({
                                data: {
                                    id: id,
                                    parent: d.id
                                },
                                depth: d.depth + 1,
                                height: 0,
                                parent: d,
                                id: id
                            })
                        });

                    } else {
                        //console.log(d)
                    }
                })

                d3.selectAll('path.link1').remove()
                var additionalParentLink = svgGroup.selectAll("path.additionalParentLink")
                    .data(multiParents);

                additionalParentLink.enter().insert("path", "g")
                    .attr("class", "link1")
                    .attr("d", function(d) {
                        var oTarget = {
                            x: d.child.x,
                            y: d.child.y
                        };
                        var oSource = {
                            x: d.parent.x,
                            y: d.parent.y
                        };
                        //return [d.x, d.y / 180 * Math.PI];
                        return linkRadial({
                            source: oSource,
                            target: oTarget
                        });
                    })
                    .style('stroke-width', function(d) {
                        if (d.child.id == 'root') {
                            return '1px';
                        }
                        if (graph[d.child.id][d.parent.id] * 20 > 5) {
                            return '4px';
                        }
                        return graph[d.child.id][d.parent.id] * 20;
                    })
                    .attr('marker-end', 'url(#triangle-start)');
                additionalParentLink.on("mouseover", function(d) {
                        div.transition()
                            .duration(200)
                            .style("opacity", .9);
                        div.html(Math.floor(graph[d.child.id][d.parent.id] * 100) + ' Early Adopters' + "<br/>")
                            .style("left", (d3.event.pageX + 10) + "px")
                            .style("top", (d3.event.pageY - 20) + "px")
                            .style("width", 80 + "px")
                            .style("height", 30 + "px");

                    })
                    .on("mouseout", function(d) {
                        div.transition()
                            .duration(200)
                            .style("opacity", 0);
                    });

                node = svgGroup.selectAll("g.node")
                    .data(nodes, function(d) {
                        return d.id || (d.id = ++i);
                    });


                // Enter any new nodes at the parent's previous position.
                var nodeEnter = node.enter().append("g")
                    .attr("class", "node")
                    .on('click', click)
                    .on("mouseover", function(d) {
                        div.transition()
                            .duration(200)
                            .style("opacity", .9);
                        div.html(d.id + "<br/>")
                            .style("left", (d3.event.pageX + 10) + "px")
                            .style("top", (d3.event.pageY - 20) + "px")
                            .style("width", (d.id.length) * 10 + "px")
                            .style("height", 30 + "px");
                    })
                    .on("mouseout", function(d) {
                        div.transition()
                            .duration(500)
                            .style("opacity", 0);
                    });
                nodeEnter.append("circle")
                    .attr('class', 'nodeCircle')
                    .attr("r", 0)
                    .style("fill", function(d) {
                        if (d.class === "found") {
                            return "#ff4136"; //red
                        }
                        return d._children ? "#005796" : "#049ae5";
                    })
                    .style("stroke", function(d) {
                        if (d.id == 'root') {
                            return "#fff";
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
                        return -14;
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
                    .style("fill", "#000000")
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
                    .style("fill", "#000000");
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
                            return post_to_size[d.id];
                        }
                    })
                    .style("fill", function(d) {
                        if (d.id == 'root') {
                            return "#ff4136";
                        }
                        if (d.class === "found") {
                            return "#ff4136"; //red
                        }
                        return d._children ? "#005796" : "#049ae5";
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
                    })
                    .style('stroke-width', function(d) {
                        if (d.source.id == 'root') {
                            return '1px';
                        }
                        if (graph[d.target.id][d.source.id] * 20 > 5) {
                            return '4px';
                        }
                        return graph[d.target.id][d.source.id] * 20;
                    })
                    .attr('marker-end', function(d) {
                        return 'url(#arrowhead)';
                    });
                link.on("mouseover", function(d) {
                        div.transition()
                            .duration(200)
                            .style("opacity", .9);
                        div.html(Math.floor(graph[d.target.id][d.source.id] * 100) + ' Early Adopters' + "<br/>")
                            .style("left", (d3.event.pageX + 10) + "px")
                            .style("top", (d3.event.pageY - 20) + "px")
                            .style("width", 80 + "px")
                            .style("height", 25 + "px");

                    })
                    .on("mouseout", function(d) {
                        div.transition()
                            .duration(200)
                            .style("opacity", 0);
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


            }
            $("#loadBtn").on("click", function(e) {
                document.getElementById('search').value = '';
                $('.center').removeClass('hide')

                if (layer_sample >= 6) {
                    $('#loadAlert').removeClass('hide')
                    $('.center').addClass('hide')

                    return
                }
                layer_sample += 1
                var chosen_nodes = []
                if (Array.from(init_random).length > 0) {
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
                if (viewerWidth < tempWidth &&
                    viewerHeight < tempHeight) {
                    tree.size([tempWidth, tempHeight]);
                } else {
                    tree.size([viewerHeight, viewerWidth]);
                }
                update(root, true, temp_pair_nodes);
                centerNode(root.children[Math.floor(root.children.length / 2)]);
                _root = treeData
                $('.center').addClass('hide')

            })
            $("#randomBtn").on("click", function(e) {
                document.getElementById('search').value = '';
                $('#loadAlert').addClass('hide');
                $('.center').removeClass('hide')


                layer_sample = 4
                for (var i = 0; i < 5; i++) {

                    init_random.add(reverse_dict[0][Math.floor((Math.random() * 100) % reverse_dict[0].length)])
                }
                parent_temp = undefined
                Object.keys(reverse_dict).forEach(function(d) {
                    temp = reverse_dict[d]
                    if (parent_temp == undefined) {
                        parent_temp = temp[Math.floor((Math.random() * 100) % temp.length)]
                        init_random.add(parent_temp);
                    } else {
                        if (parentGraph[parent_temp] && parentGraph[parent_temp].length > 0) {
                            samp = (parentGraph[parent_temp][Math.floor((Math.random() * 100) % parentGraph[parent_temp].length)])
                            init_random.add(samp)
                            parent_temp = samp
                        }
                    }
                })
                var chosen_nodes = sample_layer(graph, reverse_dict, post_to_size, layer_sample, Array.from(init_random), true)
                var prep = prep_data(chosen_nodes[0], true);
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
                if (viewerWidth < tempWidth &&
                    viewerHeight < tempHeight) {
                    tree.size([tempWidth, tempHeight]);
                } else {
                    tree.size([viewerHeight, viewerWidth]);
                }
                update(root, true, temp_pair_nodes);
                centerNode(root.children[Math.floor(root.children.length / 2)]);
                _root = treeData
                $('.center').addClass('hide')

            })
            $('.center').addClass('hide')

        });
    });
});