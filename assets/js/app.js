var defaultTooltipPosition = {
  "opacity": 0,
  'top': "-10px",
  'left': '-1000px'
};

$(function() {
  function getDefaultLegend() {
    var defaultLegend = {
      'Low Grade SR': [{
        'Attributes': {
          'fill': 'rgba(200, 55, 55, 0.9)',
          'stroke': 'rgb(200, 55, 55)',
          'header': '',
          'class': 'poor'
        }
      }],
      'Moderate Grade SR': [{
        'Attributes': {
          'fill': 'rgba(17, 0, 150,0.8)',
          'stroke': 'rgb(143, 177, 0)',
          'header': '',
          'class': 'moderate'
        }
      }],
      'High Grade SR': [{
        'Attributes': {
          'fill': 'rgba(5, 140, 19,0.8)',
          'stroke': 'rgba(5, 140, 19,0)',
          'header': '',
          'class': 'good'
        }
      }],
      'Impact Evaluation': [{
        'Attributes': {
          'fill': 'rgba(163, 163, 163,0.8)',
          'stroke': 'rgba(5, 140, 19,0)',
          'header': '',
          'class': 'impactevaluation'
        }
      }]
    };
    return defaultLegend;
  }


  d3.select("body").on("click", function() {
    var tooltip = d3.select('.tooltip'),
      tooltipActive = tooltip.classed('tooltip-active');
    if (tooltipActive) {
      tooltip.styles(defaultTooltipPosition);
    }
  });

  function getColumnRows(csv, csvCol) {
    var rows = $.map(csv, function(d, i) {
      return d[csvCol];
    });
    return rows;
  }

  function reshapeElements(arr) {

    var result = $.map(arr, function(d, i) {
      var s = d.split(",");

      var t = $.map(s, function(d2, i2) {
        var a = $.trim(d2);
        if (a != "") {
          return a.toUpperCase();
        }
      });
      return t;
    });
    var r = $.unique(result).sort();
    return r;
  };

  function appendSelect(data) {
    var data = data;
    console.log(data);
    data.forEach(function(element) {
      var select = d3.select(element.class).append('select').attrs({
        'class': 'filter-select',
        'data-csv-header': element.id
      });
      select.append('option')
        .text("All").property('value', "all").attrs({
          'class':'option-all'
        });
      var options = select.selectAll("option:not(.option-all)")
        .data(element.data).enter()
        .append('option')
        .text(function(d) {
          return d;
        })
        .property('value', function(d) {
          return d;
        });
    });
  }

  function filter() {
    d3.csv('data/link1.csv', function(l) {
      var country = getColumnRows(l, 'country');
      var regionWHO = getColumnRows(l, 'region_who');
      var regionWB = getColumnRows(l, 'region_wb');

      var year = $.unique(getColumnRows(l, 'year')).sort();
      var uCountry = reshapeElements(country);
      var uregionWHO = reshapeElements(regionWHO);
      var uregionWB = reshapeElements(regionWB);

      var output = [{
        data: year,
        class: '.year',
        id: 'year'
      }, {
        data: uCountry,
        class: '.country',
        id: 'country'
      }, {
        data: uregionWB,
        class: '.region_wb',
        id: 'region_wb'
      }, {
        data: uregionWHO,
        class: '.region_who',
        id: 'region_who'
      }];
      appendSelect(output);
    });
  };

  function getSplitedValue(data, header) {
    var rows = $.map(data, function(d, i) {
      if (header == "year") {
        return d[header];
      } else {
        return $.trim(d[header].split(",")).toUpperCase();
      }
    });
    return rows;
  }

  function prepareDATA(selectValues, select = false) {
    d3.csv("data/link1.csv", function(links) {
      if (select) {
        var whereC = $.map(selectValues, function(d, i) {
          var obj = '';
          if (i == selectValues.length - 1) {
            obj = d.header + ' like "%' + d.value.toString() + '"';
          } else {
            obj = d.header + ' like "%' + d.value.toString() + '"' + ' and ';
          }
          return obj;
        });
        var w = whereC.join("");
        w = (w == "") ? "" : ('where ' + w);
        var a = alasql('select * from ? ' + w, [links]);
        links = a;
        // var a = alasql('select * from ? where year like "%2015" and region_who like "%South-east asia"', [links]);
      } else {
        links = links;
      }

      var legends = $.map(links, function(d, i) {
        return d["qualityofthestudy"];
      });
      legends = $.unique(legends);

      prepareLegend();

      d3.text('data/gapmap.csv', function(data) {
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
            var o = getDefaultLegend();
            var circle = [];
            // console.log(split);
            split.forEach(function(el) {
              if (el != "") {
                links.forEach(function(obj) {
                  var quality = obj["qualityofthestudy"].replace(/\s+$/, '');
                  // console.log(o, obj["Sl no"], el);
                  if (obj["slno"] == el) {
                    o[quality].push([obj["slno"], obj["Title"], obj["Link"], obj["study-design"], obj["qualityofthestudy"]]);
                  }
                  if (o[quality][0]["Attributes"]["header"] == "") {
                    o[quality][0]["Attributes"]["header"] = obj["study-design"];
                  }
                  // if(o[quality]["Attributes"]["header"] != ""){
                  //   o[quality]["Attributes"]["header"] = obj["Study Design"];
                  // }
                });
              }
            });
            // console.log(data[j]);
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
    var cx = 25,
      cy = 25;
    d3Svg = d3.select(svg).attrs({
      height: 150,
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
            var r = (d.length * 100) / 55;
            // if (r>15)
            //   r = 18;
            return {
              cx: function(d, i) {
                cx = Math.floor(Math.random() * (75 - 25 + 1)) + 25;
                console.log(cx);
                return cx;
              },
              cy: function(d, i) {
                // cy = Math.floor(Math.random() * (70 - 15 + 1)) + 25;
                console.log(cy);
                cy = cy+1;
                return cy;
              },
              r: r,
              fill: d[0]["Attributes"]["fill"],
              'class': function(d, i) {
                return d[0]["Attributes"]["class"];
              }
            };
          }).on("mouseenter", function(d) {
            var temp = d.slice(1, d.length);
            var h = $.map(temp, function(d, i) {
              var href = d[2],
                t = d[1],
                h = "<a target='_blank' href='" + href + "'>" + t + "</a><br />";
              return h;
            });
            var tooltip = d3.select('.tooltip'),
              tooltipHeader = d3.select('.tooltip>.tooltip-header'),
              tooltipBody = d3.select('.tooltip>.tooltip-body');
            var circle = d3.select(this);
            //set mouseenter style for circle
            circle.attrs({
              'stroke': circle.attr("fill"),
              'stroke-width': "3"
            });

            tooltip
              .transition()
              .duration(500)
              .style("opacity", .9);
            tooltipHeader.append(function() {
              d3.select(this).selectAll('*').remove();
              var span = document.createElement("span");
              var d_span = d3.select(span);
              d_span.text(d.length - 1);
              d_span
                .styles({
                  "height": "50px",
                  "width": "50px",
                  "background-color": d[0]["Attributes"]["fill"],
                  "display": "inline-block",
                  "position": "absolute",
                  "left": "5px",
                  //"right":"10px",
                  "top": "10px",
                  'font-size': '32px',
                  'font-weight': 'bold',
                  'color': '#f0f0f0'
                });
              return span;
            });
            tooltipHeader.append(function() {
              var h3 = document.createElement("h3");
              var d_h3 = d3.select(h3);
              d_h3.text(d[0]["Attributes"]["header"]);
              d_h3.styles({
                'color': d[0]["Attributes"]["fill"]
              });
              return h3;
            });
            tooltipBody.html(function() {
              return h.join("");
            });

            var $offsetLeft = $(this).offset().left,
              $offsetTop = $(this).offset().top,
              positionCenter = (tooltip.node().getBoundingClientRect().width / 2),
              positionTop = tooltip.node().getBoundingClientRect().height,
              circleRadius = parseInt(circle.attr('r'));
            tooltip.styles({
              "left": ($offsetLeft - positionCenter + circleRadius) + "px",
              "top": ($offsetTop) + "px"
            });
            tooltip.classed("tooltip-active", true);
            tooltip.on("mouseenter", function(d) {}).on("mouseleave", function(d) {
              // console.log("tooltip mouseout");
              tooltip.styles(defaultTooltipPosition);
            });
          })
          .on("mouseleave", function(d) {
            var circle = d3.select(this);
            circle.attrs({
              'stroke': "",
              'stroke-width': "0"
            });
          });
        cx = cx + 30;
        cy = cy + 30;
      }
    }
    return svg;
  };



  function prepareLegend() {
    var data = getDefaultLegend();
    var legends = [];
    for (var k in data) {
      var d = {
        'text': k,
        'color': data[k][0]["Attributes"]["fill"],
        'class': data[k][0]["Attributes"]["class"]
      };
      legends.push(d);
    }
    // var legendHolder = d3.select('#legend-holder').html("");
    // var svg = legendHolder.append("svg").attrs({
    //   'height': 100,
    //   'width': '100%'
    // });
    var svg = d3.select('#legend-holder svg');
    svg.html("");
    var dataL = 0;
    var offset = 200;
    var legend = svg.selectAll('g')
      .data(legends)
      .enter().append('g')
      .attr("data-legend", function(d, i) {
        return d["class"];
      })
      .attr("transform", function(d, i) {
        var legendPos = $('#legend-holder>svg').width() / 8;
        if (i === 0) {
          dataL = legendPos;
          return "translate(" + legendPos + ",0)"
        } else {
          var newdataL = dataL + offset;
          dataL += offset
          return "translate(" + (newdataL) + ",0)"
        }
      })

    legend.append('rect')
      .attr("x", 0)
      .attr("y", 10)
      .attr("width", 10)
      .attr("height", 10)
      .style("fill", function(d, i) {
        return d.color;
      })

    legend.append('text')
      .attr("x", 20)
      .attr("y", 20)
      .text(function(d, i) {
        return d.text;
      })
      .attr("class", "textselected")
      .styles({
        "text-anchor": "start",
        "font-size": 18,
        "cursor": "pointer"
      });
    legend.on('mouseenter', legendMouseEnter);
    legend.on('mouseout', legendMouseout);
    legend.on('click', legendMouseclick);
  };

  function getLegendText(data) {
    var g = d3.select(data).select('text');
    return g;
  };

  function legendMouseEnter() {
    var text = getLegendText(this);
    text.styles({
      "font-weight": 'bold'
    });
  };

  function legendMouseout() {
    var text = getLegendText(this);
    text.styles({
      "font-weight": 'normal'
    });
  };

  function legendMouseclick() {
    var g = d3.select(this);
    var legendGroup = g.attr('data-legend');
    var klass = g.classed('enable');
    if (klass) {
      g.classed('enable', false);
      toggleLegend(legendGroup, 'initial');
    } else {
      g.classed('enable', true);
      toggleLegend(legendGroup, 'hidden');
    }
  };

  function toggleLegend(legendGroup, display) {
    var circles = d3.select('#map_body')
      .selectAll('svg')
      .selectAll('circle')
      .each(function(d) {
        var c = d3.select(this),
          legendCircle = c.attr('class');
        if (legendGroup == legendCircle) {
          c.style('visibility', display);
        }
      });
  };

  function createTbody(rows) {
    var tbody = d3.select('#map_body').html("");
    var horizontal_rows = rows;
    var tr = tbody.selectAll('tr').data(horizontal_rows)
      .enter().append('tr');
    tr.selectAll('td').remove().data(function(d) {
        return d;
      }).enter().append('td')
      .text(function(d) {
        if (Object.keys(d)[0] == "Text") {
          return d.Text;
        }
      })
      .append(function(d, i) {
        if (Object.keys(d)[0] == "Text") {
          var label = document.createElementNS("http://www.w3.org/2000/label", "div");
          // var d3Label = d3.select(label);
          // d3Label.text(d.Text);
          return label;
        } else {
          var svg = createSVG(d);
          return svg;
        }
      });
  };

  prepareDATA();

  filter();

  function convertToCanvas(target, canvasId) {
    var target = $(target).get(0);
    return html2canvas(target).then(function(canvas) {
      var base64image = canvas.toDataURL("image/png");
      var canvas = document.getElementById(canvasId);
      var ctx = canvas.getContext("2d");
      var image = new Image();
      image.onload = function() {
        ctx.drawImage(image, 0, 0);
      };
      image.src = base64image;
      var a = $('#d');
      a.attr('href',base64image);
      a.download = "gapmap.png";
      a[0].click();
    });
  };

  $('#submit-filter').on('click', function() {
    var v = $('.filter-select');
    var opt = $.map(v, function(d, i) {
      var v = $(d).val();
      if (v == "all") {

      } else {
        var res = {
          value: $(d).val(),
          header: $(d).attr('data-csv-header')
        };
        return res;
      }
    });
    prepareDATA(opt, true);
  });

  $('#downloadLink').click(function() {
    convertToCanvas('.container','the_canvas_element_id');
  });
  // $('#d').click(function(e){
  //   convertToCanvas('.container','the_canvas_element_id');
  // })
});
