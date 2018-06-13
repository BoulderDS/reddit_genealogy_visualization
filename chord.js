var outerRadius = 600,
    innerRadius = outerRadius - 150;
var importsdata = []
var fill = d3.scale.category20c();
var chord = d3.layout.chord()
    .padding(.01)
    .sortSubgroups(d3.descending)
    .sortChords(d3.descending);
var arc = d3.svg.arc()
    .innerRadius(innerRadius)
    .outerRadius(innerRadius + 20);
var svg = d3.select("body").append("svg")
    .attr("width", outerRadius * 2)
    .attr("height", outerRadius * 2)
    .append("g")
    .attr("transform", "translate(" + outerRadius + "," + outerRadius + ")");
var indexByName = d3.map(),
    nameByIndex = d3.map();
var ischildView = false
d3.json("chord.json", function(error, imports) {
    imports = imports.slice(0, 200)
    console.log(imports.length)
    importsdata = imports
    if (error) throw error;
    var matrix = [],
        n = 0;
    // Returns the Flare package name for the given class name.
    function name(name) {
        return name;
    }
    // Compute a unique index for each package name.
    imports.forEach(function(d) {
        if (!indexByName.has(d = name(d.name))) {
            nameByIndex.set(n, d);
            indexByName.set(d, n++);
        }
    });
    // Construct a square matrix counting package imports.
    imports.forEach(function(d) {
        var source = indexByName.get(name(d.name)),
            row = matrix[source];
        if (!row) {
            row = matrix[source] = [];
            for (var i = -1; ++i < n;) row[i] = 0;
        }
        d.imports.forEach(function(d) {
            row[indexByName.get(name(d))]++;
        });
    });
    chord.matrix(matrix);
    var g = svg.selectAll(".group")
        .data(chord.groups)
        .enter().append("g")
        .attr("class", "group")
        .on("click", fade(.02))
        .on("mouseout", fade(.90));
    g.append("path")
        .style("fill", function(d) {
            return fill(d.index);
        })
        .style("stroke", function(d) {
            return fill(d.index);
        })
        .attr("d", arc);
    g.append("text")
        .each(function(d) {
            d.angle = (d.startAngle + d.endAngle) / 2;
        })
        .attr("dy", ".35em")
        .attr("transform", function(d) {
            return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")" +
                "translate(" + (innerRadius + 26) + ")" +
                (d.angle > Math.PI ? "rotate(180)" : "");
        })
        .style("text-anchor", function(d) {
            return d.angle > Math.PI ? "end" : null;
        })
        .text(function(d) {
            return nameByIndex.get(d.index);
        });
    svg.selectAll(".chord")
        .data(chord.chords)
        .enter().append("path")
        .attr("class", "chord")
        .style("stroke", function(d) {
            return d3.rgb(fill(d.source.index)).darker();
        })
        .style("fill", function(d) {
            return fill(d.source.index);
        })
        .attr("d", d3.svg.chord().radius(innerRadius));
});
d3.select(self.frameElement).style("height", outerRadius * 2 + "px");
// Returns an event handler for fading a given chord group.
function fade(opacity) {
    return function(d, i) {
        console.log(opacity)
        var targets = getImportsByName(nameByIndex.get(i))[0].imports
        svg.selectAll("path.chord")
            .filter(
                function(d) {
                    if (ischildView) {
                        return d.target.index != i;
                    } else {
                        return d.source.index != i;
                    }
                }
            )
            .transition()
            .style("stroke-opacity", opacity)
            .style("fill-opacity", opacity);
        svg.selectAll("text")
            .filter(function(d) {
                if (ischildView) {
                    if (d.index == i) {
                        return false
                    }
                    if (getImportsByName(nameByIndex.get(d.index))[0].imports.includes(nameByIndex.get(i))) {
                        return false
                    } else {
                        return true
                    }
                } else {
                    if (targets.includes(nameByIndex.get(d.index))) {
                        return false
                    }
                    if (d.index != i) {
                        return true
                    }
                }
            })
            .transition()
            .style("opacity", opacity);
        if (opacity == 0.02) {
            svg.selectAll("text")
                .filter(function(d) {
                    if (d.index == i) {
                        return true
                    }
                })
                .transition()
                .style("font-size", '20px');
        } else {
            svg.selectAll("text")
                .filter(function(d) {
                    if (d.index == i) {
                        return true
                    }
                })
                .transition()
                .style("font-size", '8px');
        }
        svg.selectAll(".group")
            .filter(function(d) {
                if (ischildView) {
                    if (d.index == i) {
                        return false
                    }
                    if (getImportsByName(nameByIndex.get(d.index))[0].imports.includes(nameByIndex.get(i))) {
                        return false
                    } else {
                        return true
                    }
                } else {
                    if (targets.includes(nameByIndex.get(d.index))) {
                        return false
                    }
                    if (d.index != i) {
                        return true
                    }

                }
            })
            .transition()
            .style("opacity", opacity);
    };
}

function getImportsByName(val) {
    return importsdata.filter(function(importsdata) {
        return importsdata.name == val
    });
}

function updateView(view) {
    ischildView = view
}