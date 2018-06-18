def sample_layer_nodes(graph, layer_dict, post_size, layer_sample=5, initial_samples=None):
    chosen = set()
    ancestors = set()
    if initial_samples:
        for s in initial_samples:
            chosen.add(s)
        add_ancestor(ancestors, chosen, graph)
    yset = list(layer_dict.keys())
    yset.sort(reverse=True)
    max_y = max(yset)
    for y in yset:
        if y == max_y:
            candidates = [(post_size[s], s) for s in layer_dict[y]]
        else:
            candidates = [(post_size[s], s) for s in layer_dict[y] if s in ancestors]
        if len(candidates) == 0:
            print(y)
            continue
        candidates.sort(reverse=True)
        candidates = candidates[:50]
        probs = np.array([v[0] for v in candidates])
        probs = probs / np.sum(probs)
        count = sum([1 if s in chosen else 0 for s in layer_dict[y]])
        if layer_sample > count:
            samples = np.random.choice([v[1] for v in candidates],
                                       size=layer_sample - count, replace=False, p=probs)
            chosen |= set(samples)
            add_ancestor(ancestors, samples, graph)
    return chosen, ancestors





def get_sample_graph(graph, layer_dict, post_size, sample=100, size=10, minimal_weight=0):
    ret_nodes = []
    ret_graph = []
    nodes = list(graph.keys())
    if type(sample) == int and sample > 0:
        nodes = random.sample(nodes, sample)
    elif type(sample) == set:
        nodes = sample
    nodes = set(nodes)
    for node in nodes:
        ret_nodes.append(node)
    for node in nodes:
        for n, v in graph[node]:
            if nodes and n not in nodes:
                continue
            if len(v) < float(size) * minimal_weight:
                continue
            ret_graph.append((n, node))
    return ret_graph, ret_nodes

initial_samples = ["MemeEconomy", "AskThe_Donald", "bidenbro", "cynicalbritofficial","OverwatchUniversity", "battlefield_one", "2meirl4meirl", "CatTaps","evilbuildings", "fixingmovies"]
chosen, ancestors = sg.sample_layer_nodes(graph, reverse_layer_dict, post_size, layer_sample=3,initial_samples=initial_samples)
ret_graph, ret_nodes = get_sample_graph(graph, layer_dict, post_size, sample=chosen, size=10, minimal_weight=0.01)

