function GraphVis(graph) {
    color = d3.scale.category10()
    count = 0
    radius = 5
    var margin = {
            top: -100,
            right: -50,
            bottom: -10,
            left: -50
        },
        width = 1200 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;
    var zoom = d3.behavior.zoom()
        .scale(1)
        .scaleExtent([.1, 20])
        .on("zoom", zoomed);

    function zoomed() {
        svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }
    force = d3.layout.force()
        .charge(-300)
        .linkDistance(150)
        .gravity(0.07)
        .size([width, height]),

        svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + 10 + "," + 10 + ")")
        .call(zoom),
        link = svg.selectAll('.link').data(graph.links),
        node = svg.selectAll('.node').data(graph.nodes);
    onTick = function() {};
    var container = svg.append("g");
    svg.append('defs').append('marker')
        .attr('id', 'arrowhead')
        .attr('viewBox', '0 0 10 10 ')
        .attr('refX', 9)
        .attr('refY', 4)
        .attr('orient', 'auto')
        .attr('markerWidth', 5)
        .attr('markerHeight', 5)
        .attr('xoverflow', 'visible')
        .append('svg:path')
        .attr('d', 'M-6,-6 L8,4 L-6,8 L6,6 L-6,-6')
        .attr('fill', '#000000')
        .style('stroke-width', '2px')
        .style('stroke', 'none');

    function update() {
        force
            .nodes(graph.nodes)
            .links(graph.links)
        force.start();
        link = svg.selectAll('.link').data(graph.links);
        node = svg.selectAll('.node').data(graph.nodes);
        link.enter().append('line')
            .attr('class', 'link')
            .attr('stroke', '#000000')
            .attr('marker-end', 'url(#arrowhead)')
            .attr('stroke-width', function(d) {
                if(d.value*20 > 5){
                    return 5;
                }
                return    d.value*20;
            });
        link.exit().remove();

        node.enter().append('g');
        node.attr("class", "node").call(force.drag);
        node.append("circle")
            .attr("r", function(d){
                if(d.postSize > 1){
                    return d.postSize ;
                } else{
                    return 2;
                }
            })
            .style("fill", function(d) {
                return color(d.id)
            });
        node.append("title")
            .text(function(d) {
                return d.id;
            });
        node.append("text")
            .attr("dy", -5)
            .attr("text-anchor", "middle")
            .attr("font-size", "12px")
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
        count += 1
            // if(count == graph.nodes.length){
            //   force.stop()
            //   count=1
            //   console.log('max count')
            // }
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
                return d.x
            })
            .attr('cy', function(d) {
                return d.y;
            });
        node.attr("transform", function(d) {
            return "translate(" + d.x + "," + d.y + ")";
        });
        //onTick();
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