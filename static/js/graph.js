queue()
   .defer(d3.json, "/videogamessales/sales")
   .await(makeGraphs);

 
function makeGraphs(error, projectsJson) {

    var videogamessales = projectsJson;
 
   //Create a Crossfilter instance
   var ndx = crossfilter(videogamessales);
 
   //Define Dimensions
   var yearDim = ndx.dimension(function (d) {
       return d["Year"];
   });

   var platformDim = ndx.dimension(function (d) {
        return d["Platform"]
   });

   var publisherDim = ndx.dimension(function (d){ 
       return d["Publisher"]
   });

    var nameDim = ndx.dimension(function (d) {
        return d["Name"]
   });

   var genreDim = ndx.dimension(function (d) {
       return d["Genre"]
   })

   var ninsalesbyYear = yearDim.group().reduceSum(function(d) {
       if (d.Publisher === "Nintendo") {
           return +d.Global_Sales;
       } else {
           return 0;
       }

   });

   var sonysalesbyYear = yearDim.group().reduceSum(function(d) {
       if (d.Publisher === "Sony Computer Entertainment") {
           return +d.Global_Sales;
       } else {
           return 0;
       }

   });

   var microsoftsalesbyYear = yearDim.group().reduceSum(function(d) {
       if (d.Publisher === "Microsoft Game Studios") {
           return +d.Global_Sales;
       } else {
           return 0;
       }
   });

   //Calculate metrics
   var totalGlobalSales = yearDim.group().reduceSum(function (d) {
       return d["Global_Sales"];
   });
   var TGS = ndx.groupAll().reduceSum(function (d) {
       return d["Global_Sales"]
   })
   var numByPlatform = platformDim.group()
   var numByGenre = genreDim.group()
   var publisherGlobalSales = publisherDim.group().reduceSum(function (d) {
       return d["Global_Sales"];
   });
    var numByName = nameDim.group()
 
   //Define values (to be used in charts)
   var minyear = yearDim.bottom(1)[0]["Year"];
   var maxyear = yearDim.top(1)[0]["Year"];
 
   //Charts
    var yearChart = dc.barChart("#time-chart");
    var platformChart = dc.pieChart("#platform-chart");
    var publisherChart = dc.barChart("#publisher-chart");
    var genreChart = dc.pieChart("#genre-chart");
    var numbertotalSalesND = dc.numberDisplay("#number-totalsales-nd")

selectField = dc.selectMenu('#menu-select')
        .dimension(nameDim)
        .group(numByName);

    var topsalesChart = dc.compositeChart("#topsales-chart");

numbertotalSalesND 
    .valueAccessor(function (d) {
        return Math.round (d * 1000000);
    })
    .group(TGS)
    .formatNumber(d3.format(","));

var chartWidth = $("#resizeChart").width();
if(chartWidth >= 480){
}

 yearChart
       .width(chartWidth)
       .height(500)
       .margins({top: 10, right: 50, bottom: 30, left: 50})
       .dimension(yearDim)
       .group(totalGlobalSales)
       .transitionDuration(500)
       .x(d3.scale.ordinal())
       .xUnits(dc.units.ordinal)
       .elasticY(true)
       .xAxisLabel("Year")
       .yAxisLabel("Sales (In Millions)")
       .yAxis().ticks(10);

platformChart
       .height(220)
       .width(500)
       .radius(110)
       .transitionDuration(1500)
       .dimension(platformDim)
       .group(numByPlatform)
       .cap(5) 
       .minAngleForLabel(.10) 
       .ordering( function(d) { return -5.0 * +d.value; });

genreChart
       .height(220)
       .width(500)
       .radius(110)
       .transitionDuration(1500)
       .dimension(genreDim)
       .group(numByGenre)
       .cap(5)
       .minAngleForLabel(.30) 
       .ordering( function(d) { return -5.0 * +d.value; });

publisherChart
        .width(chartWidth)
        .height(500)
        .margins({top: 10, right: 50, bottom: 100, left: 50})
        .dimension(publisherDim)
        .group(publisherGlobalSales)
        .transitionDuration(500)
        .x(d3.scale.ordinal())
        .y(d3.scale.linear().domain([0,800]))
        .xUnits(dc.units.ordinal)
        .elasticY(true)
        .xAxisLabel("Publisher")
        .yAxisLabel("Sales (In Millions)")
        .yAxis().ticks(10);

topsalesChart
        .width(990)
        .height(200)
        .x(d3.scale.linear().domain([minyear, maxyear]))
        .legend(dc.legend().x(80).y(20).itemHeight(13).gap(5))
        .renderHorizontalGridLines(true)
        .xAxisLabel("Year")
        .legend(dc.legend().x(80).y(20).itemHeight(13).gap(5))
        .compose([
            dc.lineChart(topsalesChart)
                .dimension(yearDim)
                .colors('green')
                .group(ninsalesbyYear, 'Nintendo'),
            dc.lineChart(topsalesChart)
                .dimension(yearDim)
                .colors('red')
                .group(sonysalesbyYear, 'Sony'),
            dc.lineChart(topsalesChart)
                .dimension(yearDim)
                .colors('blue')
                .group(microsoftsalesbyYear, 'Microsoft')
        ])
        .brushOn(false);


$(window).resize(function() {
        // Recalculate chart size
        chartWidth = $("#pieChart").width();
        if(chartWidth >= 480){
            chartReduce = 200;
        } else {
            chartReduce = chartWidth * 0.3;
        }


publisherChart
        .width(chartReduce)
        .redraw();

yearChart
        .width(chartReduce)
        .redraw();
});
 
   dc.renderAll();
}