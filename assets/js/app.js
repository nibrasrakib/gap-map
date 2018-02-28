var header = ['Sect0rs', 'A1', 'A2', 'A3', 'A4', 'A5'],
  vertical_header = [
    [{
        'Text': 'Header',
        'Legend': 'AAA'
      },
      {
        2: ['link', 'link', 'Color'],
        3: ['link', 'link', 'link']
      }, {
        1: ['link', 'link', 'link'],
        2: ['link', 'link', 'link']
      }, {
        5: ['link', 'link', 'link'],
        6: ['link', 'link', 'link'],
        7: ['link', 'link', 'link']
      }, {
        5: ['link', 'link', 'link'],
        6: ['link', 'link', 'link'],
        7: ['link', 'link', 'link']
      }, {
        5: ['link', 'link', 'link'],
        6: ['link', 'link', 'link'],
        7: ['link', 'link', 'link']
      }
    ],
    [{
        'Text': 'Header',
        'Legend': 'AAA'
      },
      {
        2: ['link', 'link', 'Color'],
        3: ['link', 'link', 'link']
      }, {
        1: ['link', 'link', 'link'],
        2: ['link', 'link', 'link']
      }, {
        5: ['link', 'link', 'link'],
        6: ['link', 'link', 'link'],
        7: ['link', 'link', 'link']
      }, {
        5: ['link', 'link', 'link'],
        6: ['link', 'link', 'link'],
        7: ['link', 'link', 'link']
      }, {
        5: ['link', 'link', 'link'],
        6: ['link', 'link', 'link'],
        7: ['link', 'link', 'link']
      }
    ]
  ];

$(function() {
  function prepareDATA() {
    d3.csv("link.csv", function(links) {
      var legends = $.map(links, function(d, i) {
        return d["Quality of the Study"];
      });
      legends = $.unique(legends);
      d3.text('gapmap.csv', function(data) {
        data = d3.csvParseRows(data);
        var rows = [];
        for (var j = 0; j < data.length; j++) {
          var temp = [],
            key = data[j][0].replace(/\s+$/, '');
          temp.push({
            'Text': key
          });
          // console.log(data[j]);
          for (var k = 1; k < data[j].length; k++) {
            var split = data[j][k].split(",");
            var o = {
              'Low Quality': [{
                'Attributes': {
                  'fill': 'rgba(200, 55, 55, 0.5)',
                  'stroke': 'rgb(200, 55, 55)'
                }
              }],
              'High Quality': [{
                'Attributes': {
                  'fill': 'rgba(143, 177, 0, 0.5)',
                  'stroke': 'rgb(143, 177, 0)'
                }
              }]
            };
            var circle = [];
            // console.log(split);
            split.forEach(function(el) {
              if (el != "") {
                links.forEach(function(obj) {
                  var quality = obj["Quality of the Study"].replace(/\s+$/, '');
                  // console.log(quality, temp_legend, obj["Sl no"], el);
                  if (obj["Sl no"] == el) {
                    o[quality].push([obj["Sl no"], obj["Title"], obj["Link"], obj["Study Design"], obj["Quality of the Study"]]);
                  }
                });
              }
            });
            temp.push(o);
          }
          rows.push(temp);
        }
        // console.log(rows);
        createTbody(rows);
      });
    });
  };

  function createSVG(data) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    var cx = 15,
      cy = 15;
    d3Svg = d3.select(svg).attrs({
      height: 100,
      width: 100
    });

    for (var k in data) {
      // console.log(data[k]);
      //data[k].length > 1, in 0 position there is circle attributes such as. color
      if (data[k].length > 1) {
        d3Svg
          .datum(data[k])
          .append('circle')
          .attrs(function(d, i) {
            console.log(d[0], i)
            return {
              cx: cx,
              cy: cy,
              r: 10,
              'stroke-width': 3,
              fill: d[0]["Attributes"].fill
            };
          }).on("mouseover", function(d) {
            console.log(d, d3.event.pageX);
            var div = d3.select('.tooltip');
            div.transition()
              .duration(200)
              .style("opacity", .9);
            div //.html(formatTime(d.date) + "<br/>" + d.close)
              .style("left", (d3.event.pageX) + "px")
              .style("top", (d3.event.pageY - 28) + "px");
          }).on("mouseout", function(d) {
            var div = d3.select('.tooltip');
            div.transition()
              .transition(200)
              .style("opacity", 0);
          });
        cx = cx + 30;
        cy = cy;
      }
    }
    return svg;
  };

  function createTbody(rows) {
    var tbody = d3.select('#map_body');
    var horizontal_rows = rows;
    var tr = tbody.selectAll('tr').data(horizontal_rows)
      .enter().append('tr');
    tr.selectAll('td').data(function(d) {
        // console.log(d);
        return d;
      }).enter().append('td')
      .append(function(d, i) {
        if (Object.keys(d)[0] == "Text") {
          var label = document.createElementNS("http://www.w3.org/2000/label", "label");
          var d3Label = d3.select(label);
          d3Label.text(d.Text);
          //console.log(label, d3Label);
          return label;
        } else {
          var svg = createSVG(d);
          return svg;
        }
      });
  };

  prepareDATA();

});
