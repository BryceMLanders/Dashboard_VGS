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

 
   //Calculate metrics
  
   var totalGlobalSales = yearDim.group().reduceSum(function (d) {
       return d["Global_Sales"];
   });

   var numByPlatform = platformDim.group()

   var publisherGlobalSales = publisherDim.group().reduceSum(function (d) {
       return d["Global_Sales"];
   });

    var numByName = nameDim.group()
 
 
 
   //Define values (to be used in charts)
   var minyear = yearDim.bottom(1)[0]["Year"];
   var maxyear = yearDim.top(1)[0]["Year"];
 
   //Charts
   var yearChart = dc.barChart("#time-chart");
   var platformChart = dc.pieChart("#platform-chart")
   var publisherChart = dc.barChart("#publisher-chart")
   // var rankChart = dc.pieChart("#rank-chart")
   // var vgNameND = dc.textDisplay("vg-Name-nd")

selectField = dc.selectMenu('#menu-select')
.dimension(nameDim)
.group(numByName);
 
 yearChart
       .width(1200)
       .height(500)
       .margins({top: 10, right: 50, bottom: 30, left: 50})
       .dimension(yearDim)
       .group(totalGlobalSales)
       .transitionDuration(500)
       .x(d3.scale.ordinal())
       .xUnits(dc.units.ordinal)
    //    .x(d3.time.scale().domain([minyear, maxyear]))
       .elasticY(true)
       .xAxisLabel("Year")
       .yAxis().ticks(10);

platformChart
       .height(220)
       .width(300)
       .radius(110)
       .transitionDuration(1500)
       .dimension(platformDim)
       .group(numByPlatform);

publisherChart
        .width(1200)
        .height(500)
        .margins({top: 10, right: 50, bottom: 100, left: 50})
        .dimension(publisherDim)
        .group(publisherGlobalSales)
        .transitionDuration(500)
        .x(d3.scale.ordinal())
        .y(d3.scale.linear().domain([0,800]))
        .xUnits(dc.units.ordinal)
        //    .x(d3.time.scale().domain([minyear, maxyear]))
        .elasticY(true)
        .xAxisLabel("publisher")
        .yAxis().ticks(10);

// rankChart
//        .height(220)
//        .width(300)
//        .radius(110)
//        .transitionDuration(1500)
//        .dimension(rankDim)
//        .slicesCap()
//        .group(numByRank);

 

 
   dc.renderAll();
}