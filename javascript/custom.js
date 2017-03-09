console.log("test ob custom geht")

var svgRoot, graph;

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

function initSVGRoot() {
    $("#feedback_analysis").html('');
    svgRoot = d3.select("#feedback_analysis")
                .append("svg")
                .attr("width", "100%")
                .attr("height", "100%");
}

function loadBoxChart() {
}

function loadBubbleChart() {
    function renderAxis(labels, d3Item) {
        return d3Item.selectAll('text')
                     .data(labels)
                     .enter()
                     .append("text")
                     .text(function axisLabel(labelItem) {
                         return labelItem.text;
                     });
    }

    var baseurl = "/local/powertla/rest.php/content/survey/results/" + $.urlParam('id');

    $.ajax({
        // url: "data.json",
        url: baseurl,
        type: "get",
        cache: false, // ensure updates
        success: function renderChart(data) {
            var i, y, j;
            var realdata = [];
            var graphics = [];
            var maxdomain = 10;
            var rangeto = 0;

            if (typeof data === "string") { // ensure a data array
                data = JSON.parse(data);
            }

            // extract the questions from the returned data
            for (i = 0; i < data.length; i++) {
                switch (data[i].typ) {
                    case 'multichoicerated':
                    case 'multichoice':
                        realdata.push(data[i]);
                        break;
                    default:
                        break;
                }
            }

            // extract the axis labels

            // This ONLY works if all questions have the same values!
            // if we have different questions, then we MUST create multiple graphs
            var xLabels = realdata[0].answerValues.map(function (d, i) {
                return {
                    xVal: i + 1,
                    yVal: 0,
                    text: Array.isArray(d)? d[1] : d
                };
            });

            // the y lables are the questions.
            var yLabels = realdata.map(function (d, i) {
                return {
                    xVal: 0,
                    yVal:i+1,
                    text: d.question
                };
            });

            // analyse the responses
            for (y = 0; y < realdata.length; y++) {
                var radius = [];
                var valueHash = {};
                var tmpRangeTo = parseInt(realdata[y].range_to);

                if(tmpRangeTo > rangeto){
                    rangeto = tmpRangeTo;
                }

                if (realdata[y].answers.length > maxdomain){
                    maxdomain = realdata[y].answers.length;
                }

                for (j = 0; j < realdata[y].answerValues.length; j++){
                    radius.push(0);
                    var radiusRating = realdata[y].answerValues[j][0];
                    valueHash[radiusRating] = j;
                }

                for (i = 0; i < realdata[y].answers.length; i++) {
                    var radiusValue = parseInt(realdata[y].answers[i]);
                    if (radiusValue > 0 || radiusValue === 0) {
                        var radiusIndex = valueHash[radiusValue];
                        console.log("val = " + radiusValue + "; id = " + radiusIndex + "; orig = " + realdata[y].answers[i]);

                        radius[radiusIndex]++;
                    }
                }

                for (i = 0; i < radius.length; i++) {
                    graphics.push({
                        rVal: radius[i],
                        xVal: i + 1,
                        yVal: y + 1
                    });
                }
            }

            // create d3 scale projection functions
            var rscale = d3.scale.linear()
                           .domain([0, maxdomain])
                           .range([0, 30]);

            var xscale = d3.scale.linear()
                           .domain([0, rangeto+1])
                           .range([0, 75 * (rangeto+1)]);

            // reverse the y axis, so 0 is in the upper corner
            var yscale = d3.scale.linear()
                           .domain([realdata.length + 1, 0])
                           .range([realdata.length * 75, 0]);

            // add the y axis labels
            if (!$("#y-axis").length) {
                renderAxis(yLabels,
                           svgRoot.append("g")
                                  .attr('id', "y-axis")
                                  .attr("transform","translate(20," + 10 + ")"))
                    .attr('text-anchor', 'right')
                    .attr('y', function (d, i) {
                        return yscale(d.yVal);
                    })
                .attr('dy', '0.3ex');
            }
            var bbox = d3.select('#y-axis').node().getBBox();
            var yaxisWidth = bbox.width;

            $("#feedback_analysis").height(bbox.height + 50);

            // svgRoot.attr("height", bbox.height + 25);

            // add the x axis
            if (!$("#x-axis").length) {
                renderAxis(xLabels,
                           svgRoot.append("g")
                                 .attr('id', "x-axis")
                                 .attr("transform","translate( " + (yaxisWidth + 10) + ",15)"))
                   .attr('text-anchor', 'middle')
                   .attr('x', function (d, i) {
                       return xscale(d.xVal);
                   });

                   graph = svgRoot.append("g")
                                  .attr("id", "datamatrix")
                                  .attr("transform","translate(" + (yaxisWidth + 10) + "," + 10 + ")");
           }

           graph.selectAll('circle')
                .data(graphics) // attach the graph data
                .enter()
                .append('circle')
                .attr('class', function (d) {
                    return "blue";
                 })
                 .attr('r', function (d) {
                     return rscale(d.rVal);
                 })
                 .attr('cx', function (d) {
                     return xscale(d.xVal);
                 })
                 .attr('cy', function (d) {
                     return yscale(d.yVal);
                 });

            // check live update
            checkLiveUpdate(loadBubbleChart);
        },
        error: function (msg) { checkLiveUpdate(loadBubbleChart); }
    });
}

function loadBarChart() {
    var urlcompleted = "/local/powertla/rest.php/content/survey/analysis/" + $.urlParam('id');

    // Split url to check path

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
                  .ticks(10); // should not be hard coded

    // load the data
    d3.json(urlcompleted, function(error, data) {
        if (data) {
            data.forEach(function(d) {
                d.label = d.label;
                d.average_value = +d.average_value;
            });

            // scale the range of the data
            x.domain(data.map(function(d) { return d.label; }));
            y.domain([0, d3.max(data, function(d) { return d.average_value; })]);

            // add axis
            svgRoot.append("g")
                   .attr("id","x-axis")
                   .attr("class", "x axis")
                   .attr("transform", "translate(0," + height + ")")
                   .call(xAxis)
                   .selectAll("text")
                   .style("text-anchor", "end")
                   .attr("dx", "-.8em")
                   .attr("dy", "-.55em")
                   .attr("transform", "rotate(-45)" );

            svgRoot.append("g")
                   .attr("id","y-axis")
                   .attr("class", "y axis")
                   .call(yAxis)
                   .append("text")
                   .attr("transform", "rotate(-90)")
                   .attr("y", 5)
                   .attr("dy", ".71em")
                   .style("text-anchor", "end")
                   .text("Skalenwerte");


            // Add bar chart
            svgRoot.selectAll("bar")
                   .data(data)
                   .enter()
                   .append("rect")
                   .attr("class", "bar")
                   .attr("x", function(d) {
                       return x(d.label);
                   })
                   .attr("width", x.rangeBand())
                   .attr("y", function(d) {
                       return y(d.average_value);
                   })
                   .attr("height", function(d) {
                       return height - y(d.average_value);
                   });
        }
        checkLiveUpdate(loadBarChart);
    });
}

function checkLiveUpdate(cbFunction) {
    if ($("#fbanalysis_liveupdate").hasClass("btn-warning")) {
        setTimeout(cbFunction, 3000);
    }
}

function toggleLiveUpdate() {
    $("#fbanalysis_liveupdate").toggleClass("btn-warning");
    $("#fbanalysis_liveupdate").toggleClass("btn-outline-warning");

    if ($("#fbanalysis_barchart").hasClass("btn-primary")) {
        checkLiveUpdate(loadBarChart);
    }
    else if ($("#fbanalysis_bubblechart").hasClass("btn-primary")) {
        checkLiveUpdate(loadBubbleChart);
    }
    else if ($("#fbanalysis_boxchart").hasClass("btn-primary")) {
        checkLiveUpdate(loadBoxChart);
    }
}

function clearSelection(tname) {
    if (tname !== "#fbanalysis_boxchart") {
        $("#fbanalysis_boxchart").removeClass("btn-primary");
        $("#fbanalysis_boxchart").addClass("btn-outline-primary");
    }
    if (tname !== "#fbanalysis_barchart") {
        $("#fbanalysis_barchart").removeClass("btn-primary");
        $("#fbanalysis_barchart").addClass("btn-outline-primary");
    }
    if (tname !== "#fbanalysis_bubblechart") {
        $("#fbanalysis_bubblechart").removeClass("btn-primary");
        $("#fbanalysis_bubblechart").addClass("btn-outline-primary");
    }
}

function toggleBoxChart() {
    $("#fbanalysis_boxchart").toggleClass("btn-primary");
    $("#fbanalysis_boxchart").toggleClass("btn-outline-primary");

    clearSelection("#fbanalysis_boxchart");
    initSVGRoot()
    loadBoxChart();
}

function toggleBarChart() {
    $("#fbanalysis_barchart").toggleClass("btn-primary");
    $("#fbanalysis_barchart").toggleClass("btn-outline-primary");
    clearSelection("#fbanalysis_barchart");
    initSVGRoot()
    loadBarChart();
}

function toggleBubbleChart() {
    $("#fbanalysis_bubblechart").toggleClass("btn-primary");
    $("#fbanalysis_bubblechart").toggleClass("btn-outline-primary");
    clearSelection("#fbanalysis_bubblechart");
    initSVGRoot()
    loadBubbleChart();
}

function extendUI() {
    // insert our ui before the feedback_info
    $(".feedback_info:first-child").before('<div id="feedback_analysis">');
    $("#feedback_analysis").before('<div id="feedback_vizbuttons" class="fbbuttons">');
    $("#feedback_vizbuttons")
        .append('<span id="fbanalysis_barchart" class="btn btn-outline-primary">Bar Chart</span>')
        .append('<span id="fbanalysis_bubblechart" class="btn btn-outline-primary">Bubble Chart</span>')
        .append('<span id="fbanalysis_boxchart" class="btn btn-outline-primary">Box Chart</span>')
        .append('<span id="fbanalysis_liveupdate" class="btn btn-outline-warning">Live Update</span>');

    $("#fbanalysis_barchart").click(toggleBarChart);
    $("#fbanalysis_boxchart").click(toggleBoxChart);
    $("#fbanalysis_bubblechart").click(toggleBubbleChart);
    $("#fbanalysis_liveupdate").click(toggleLiveUpdate);
}

function checkFeedbackAnalysis() {
    var pathArray = window.location.pathname.split("/");

    var functionName = pathArray.pop(); // should be last element
    var moduleName   = pathArray.pop(); // should be last element
    // console.log(secondLevelPath);
    //check analysis.php page is true
    if (moduleName === "feedback" && functionName === "analysis.php")  {
        extendUI();
        toggleBarChart();
    }
}

$(document).ready(checkFeedbackAnalysis);
