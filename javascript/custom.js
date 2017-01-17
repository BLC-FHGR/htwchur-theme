console.log("test ob custom geht")



// get params of the url to get dataset id 
$.urlParam = function(name){
    var results = new RegExp('[\?&]' + name + '=([^&#]*)').exec(window.location.href);
    if (results==null){
       return null;
    }
    else{
       return results[1] || 0;
    }
}

// get json file - set var per param
  var urlcompleted = "/moodle/local/powertla/rest.php/content/survey/analysis/" +$.urlParam('id');



 // Split url to check path
  var pathArray = window.location.pathname.split("/");
    console.log(pathArray);
    var secondLevelPath = pathArray[4];
    console.log(secondLevelPath);
//check analysis.php page is true
if(secondLevelPath == "analysis.php"){

	//Beginning d3 barchart part
  var margin = {top: 20, right: 20, bottom: 70, left: 40},
      width = 600 - margin.left - margin.right,
      height = 300 - margin.top - margin.bottom;



  // set the ranges
  var x = d3.scale.ordinal().rangeRoundBands([0, width], .05);

  var y = d3.scale.linear().range([height, 0]);

  // define the axis
  var xAxis = d3.svg.axis()
      .scale(x)
      .orient("bottom")


  var yAxis = d3.svg.axis()
      .scale(y)
      .orient("left")
      .ticks(10);


  // add the SVG element
  var svg = d3.select(".feedback_info").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", 
            "translate(" + margin.left + "," + margin.top + ")");


  // load the data
  d3.json(urlcompleted, function(error, data) {

      data.forEach(function(d) {
          d.label = d.label;
          d.average_value = +d.average_value;
      });
    
    // scale the range of the data
    x.domain(data.map(function(d) { return d.label; }));
    y.domain([0, d3.max(data, function(d) { return d.average_value; })]);

    // add axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
      .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", "-.55em")
        .attr("transform", "rotate(-45)" );

    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis)
      .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 5)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Skalenwerte");


    // Add bar chart
    svg.selectAll("bar")
        .data(data)
      .enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d) { return x(d.label); })

        .attr("width", x.rangeBand())
        .attr("y", function(d) { return y(d.average_value); })
        .attr("height", function(d) { return height - y(d.average_value); 
        });

  });
}else{
  console.log("not an analysis page");
}

