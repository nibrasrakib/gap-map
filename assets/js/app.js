var defaultTooltipPosition = {
  "opacity": 0,
  'top': "-10px"
};

$(function() {
  d3.select("body").on("click", function() {
    var tooltip = d3.select('.tooltip'),
      tooltipActive = tooltip.classed('tooltip-active');
    if (tooltipActive) {
      tooltip.styles(defaultTooltipPosition);
    }
  });

  function prepareDATA() {
    d3.csv("link1.csv", function(links) {
      var legends = $.map(links, function(d, i) {
        return d["Quality of the Study"];
      });
      legends = $.unique(legends);
      d3.text('gapmap1.csv', function(data) {
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
              'Poor': [{
                'Attributes': {
                  'fill': 'rgba(200, 55, 55, 0.5)',
                  'stroke': 'rgb(200, 55, 55)',
                  'header': ''
                }
              }],
              'Moderate': [{
                'Attributes': {
                  'fill': 'rgba(143, 177, 0, 0.5)',
                  'stroke': 'rgb(143, 177, 0)',
                  'header': ''
                }
              }],
              'Good': [{
                'Attributes': {
                  'fill': 'rgba(5, 140, 19,0.5)',
                  'stroke': 'rgba(5, 140, 19,0)',
                  'header': ''
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
                  if (o[quality][0]["Attributes"]["header"] == "") {
                    o[quality][0]["Attributes"]["header"] = obj["Study Design"];
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
      width: 150
    });

    for (var k in data) {
      // console.log(data[k]);
      //data[k].length > 1, in 0 position there is circle attributes such as. color
      if (data[k].length > 1) {
        d3Svg
          .datum(data[k])
          .append('circle')
          .attrs(function(d, i) {
            var r = (d.length * 100) / 50;
            return {
              cx: cx,
              cy: cy,
              r: r,
              fill: d[0]["Attributes"]["fill"]
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
              .duration(100)
              .style("opacity", .9);
            tooltipHeader.append(function() {
              d3.select(this).selectAll('*').remove();
              var span = document.createElement("span");
              var d_span = d3.select(span);
              d_span
                .styles({
                  "height": "50px",
                  "width": "50px",
                  "background-color": d[0]["Attributes"]["fill"],
                  "display": "inline-block",
                  "position": "absolute",
                  "left": "5px",
                  //"right":"10px",
                  "top": "10px"
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
              "top": ($offsetTop - positionTop - 8) + "px"
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
