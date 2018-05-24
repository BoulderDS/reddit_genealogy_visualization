function BarabasiAlbert(graph) {
  var links = [],
    nodes = [];
  var created_nodes = [];
  var count = 0;

  function init() {
    count = 0
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', 'sample_graph.json');
    xobj.send(null);
    xobj.onreadystatechange = function() {
      if (xobj.readyState == 4 && xobj.status == "200") {
        community_graph = JSON.parse(xobj.responseText)
        nodes = community_graph['nodes']
        links = community_graph['links']
        ondataLoad(100);
        autocomplete();
      }
    }
  }

  function createnode(index, id) {
    graph.nodes.push({
      index: index,
      id: id,
      degree: 0
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
        createnode(source[0].index, source[0].id)
        created_nodes.push(source[0].id)
      }
      if (!created_nodes.includes(target[0].id)) {
        createnode(target[0].index, target[0].id)
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
    let community_graph = {}
    community_graph['nodes'] = nodes;
    community_graph['links'] = links;
    return community_graph;
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