function BarabasiAlbert(graph) {
    var links = [],
        nodes = [];
    var created_nodes = [];
    var count = 0;
    var community_graph = {};
    var layer_dict = {};
    var reverse_dict = {};
    var initial_samples = ["MemeEconomy", "AskThe_Donald", "bidenbro", "cynicalbritofficial",
        "OverwatchUniversity", "battlefield_one", "2meirl4meirl", "CatTaps",
        "evilbuildings", "fixingmovies"
    ];
    var layer_sample = 10;
    function init() {
        count = 0
        loadData();
    }

    function loadData() {
        mutliPair = d3.csv("../data/data-0.04.csv", function(error, entireTree) {
            for (var i = 0; i < entireTree.length; i++) {
                if (entireTree[i]['id'] in community_graph) {
                    community_graph[entireTree[i]['id']][entireTree[i]['parent']] = parseFloat(entireTree[i]['score'], 10)
                } else {
                    community_graph[entireTree[i]['id']] = {}
                    community_graph[entireTree[i]['id']][entireTree[i]['parent']] = parseFloat(entireTree[i]['score'], 10)
                }
            }
            layers = d3.csv("../data/layer_year.csv", function(error, layerData) {
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
                post_size = d3.csv("../data/size.csv", function(error, post_size) {
                    var post_to_size = {}
                    for (var i = 0; i < post_size.length; i++) {
                        post_to_size[post_size[i]['subreddit']] = parseInt(post_size[i]['size'])
                    }

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
                        community_graph_links = []
                        for (node in chosen) {
                            
                            curr = chosen[node];
                            nodes.add(curr)
                            if (curr != undefined && community_graph[curr] != undefined) {
                                Object.keys(community_graph[curr]).forEach(function(p) {
                                    nodes.add(p)
                                    community_graph_links.push({
                                        source: curr,
                                        target: p,
                                        value: community_graph[curr][p]
                                    })
                                })
                            }
                        }
                        community_graph_nodes = []
                        Array.from(nodes).forEach(function(l) {
                            community_graph_nodes.push({
                                id: l,
                                postSize: post_to_size[l]
                            });
                        });
                        return {
                            nodes: community_graph_nodes,
                            links: community_graph_links
                        }
                    }
                    var chosen_nodes = sample_layer(community_graph, reverse_dict, post_to_size, layer_sample)
                    var comm_graph = prep_data(chosen_nodes[0]);
                    nodes = comm_graph['nodes']
                    links = comm_graph['links']
                    ondataLoad(50);
                    autocomplete();
                });
            });
        });
    }

    function createnode(index, id,postSize) {
        graph.nodes.push({
            index: index,
            id: id,
            degree: 0,
            postSize: postSize
        });
    }

    function addlink(sourceid, targetid, val) {
        graph.links.push({
            source: sourceid,
            target: targetid,
            value: val
        });
    }


    function addNode() {
        if (links.length > 0 && nodes.length > 0) {
            link = links[count];
            var source = nodes.filter(function(item) {
                return item.id === link.source;
            });
            var target = nodes.filter(function(item) {
                return item.id === link.target;
            });
            if (!created_nodes.includes(source[0].id)) {
                createnode(source[0].index, source[0].id,source[0].postSize)
                created_nodes.push(source[0].id)
            }
            if (!created_nodes.includes(target[0].id)) {
                createnode(target[0].index, target[0].id,target[0].postSize)
                created_nodes.push(target[0].id)
            }
            addlink(created_nodes.indexOf(source[0].id), created_nodes.indexOf(target[0].id), link.value)
            count += 1
        }
    }

    function getNodes() {
        return nodes;
    }

    function getLinks() {
        return links;
    }

    function getData() {
        let temp_graph = {}
        temp_graph['nodes'] = nodes;
        temp_graph['links'] = links;
        return temp_graph;
    }
    init();

    // Initialize the graph with two connected nodes.
    return {
        addNode: addNode,
        ondataLoad: function(callback) {
            ondataLoad = callback;
        },
        autocomplete: function(callback) {
            autocomplete = callback;
        },
        getNodes: getNodes,
        getLinks: getLinks,
        getData: getData
    };
}