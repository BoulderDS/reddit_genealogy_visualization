function GraphVis(graph) {
  var margin = {
      top: -100,
      right: -50,
      bottom: -10,
      left: -50
    },
    width = 1200 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;
  var zoom = d3.behavior.zoom()
    .scaleExtent([1, 10])
    .on("zoom", zoomed);

  function zoomed() {
    svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
  }
  force = d3.layout.force()
    .charge(function(d) {
      return -50;
    })
    .linkDistance(20)
    .gravity(0.2)
    .size([width, height]),
    svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.right + ")")
    .call(zoom),
    link = svg.selectAll('.link').data(graph.links),
    node = svg.selectAll('.node').data(graph.nodes),
    onTick = function() {};
  var container = svg.append("g");
  svg.append('defs').append('marker')
    .attr('id', 'arrowhead')
    .attr('viewBox', '-0 -1 4 4 ')
    .attr('refX', 4)
    .attr('refY', 0)
    .attr('orient', 'auto')
    .attr('markerWidth', 2)
    .attr('markerHeight', 2)
    .attr('xoverflow', 'visible')
    .append('svg:path')
    .attr('d', 'M 0,-1 L 2 ,0 L 0,2')
    .attr('fill', '#999')
    .style('stroke', 'none');

  function update() {
    force
      .nodes(graph.nodes)
      .links(graph.links)
      .start();
    link = svg.selectAll('.link').data(graph.links);
    node = svg.selectAll('.node').data(graph.nodes);
    link.enter().append('line')
      .attr('class', 'link')
      .attr('marker-end', 'url(#arrowhead)')
      .attr('stroke-width', function(d){
        return d.value*2;
      });
    link.exit().remove();

    node.enter().append('g');
    node.attr("class", "node").call(force.drag);
    node.append("circle")
      .attr("r", 2)
    node.append("title")
      .text(function(d) {
        return d.id;
      });
    node.append("text")
      .attr("dy", -5)
      .attr("font-size", "8px")
      .text(function(d) {
        return d.id;
      });
    node.exit().remove();
    var label = svg.selectAll('text').data([
      graph.nodes.length + ' nodes',
      graph.links.length + ' links'
    ]);

    label.enter().append('text')
      .attr('x', 100)
      .attr('y', function(d, i) {
        return 150 + i * 20;
      });
    label.text(function(d) {
      return d;
    });
  }
  force.on('tick', function() {
    link.attr('x1', function(d) {
        return d.source.x;
      })
      .attr('y1', function(d) {
        return d.source.y;
      })
      .attr('x2', function(d) {
        return d.target.x;
      })
      .attr('y2', function(d) {
        return d.target.y;
      });
    node.attr('cx', function(d) {
        return d.x;
      })
      .attr('cy', function(d) {
        return d.y;
      });
    node.attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")";
    });
    onTick();
  });

  function destroy() {
    d3.selectAll("svg").remove()
  }


  return {
    update: update,
    destroy: destroy,
    onTick: function(callback) {
      onTick = callback;
    }
  };
}