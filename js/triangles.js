// constants
const switchDimensionsTime = 1500;
const transparentTime = 500;
const margin = { top: 25, right: 25, bottom: 25, left: 35 };

// variables
var clientWidth = document.getElementById('chartArea').clientWidth;
var svgWidth = clientWidth - margin.left - margin.right;
var svgHeight = svgWidth - margin.top - margin.bottom;

var cScale = d3.scaleOrdinal(d3.schemePastel2);
var xScale = d3.scaleLinear().range([0, svgWidth]);
var yScale = d3.scaleLinear().range([svgHeight, 0]);

var xAxis = d3.axisBottom(xScale).ticks(10);    // add ".tickSizeInner([-800])" to show grid
var yAxis = d3.axisLeft(yScale).ticks(10);

var svg = d3.select("#chartArea").append("svg")
    .attr("width", svgWidth + margin.left + margin.right)
    .attr("height", svgHeight + margin.top + margin.bottom)
    .attr("class", "svg-style")
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

var prevId = -1;    // triangle selection
var trianglesData;  // triangles data


// functions
function settingXYColorScaleDomain(data) {
    xMax = d3.max(data, function (d) { return d.x + d.base; });     // sum base to make the whole figure visible
    yMax = d3.max(data, function (d) { return d.y + d.height; });   // sum height to make the whole figure visible
    cMin = d3.min(data, function (d) { return d.color; });
    cMax = d3.max(data, function (d) { return d.color; });

    xScale.domain([0, xMax]);
    yScale.domain([0, yMax]);
    cScale.domain([cMin, cMax]);
}

function drawAxes() {
    // draw the x-axis
    svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + svgHeight + ")")
        .call(xAxis);

    // draw the y-axis
    svg.append("g")
        .attr("class", "y axis")
        .call(yAxis);
}

function updateAxes() {
    svg.select(".x.axis").attr("transform", "translate(0," + svgHeight + ")")
    svg.select(".y.axis").transition().duration(switchDimensionsTime).call(yAxis);
    svg.select(".x.axis").transition().duration(switchDimensionsTime).call(xAxis);
}


// draw and update triangles
function drawTriangles(data) {

    var triangles = svg.selectAll(".path").data(data);

    triangles.exit().remove();

    triangles
        .enter()
        .append("path")
        .attr("class", "path")
        .attr("x", function (d) { return xScale(d.x); })
        .attr("y", function (d) { return yScale(d.y); })
        .attr('d', function (d) {
            return trianglePath(xScale(d.x), yScale(d.y), xScale(d.base), yScale(d.height));
        })
        .style("fill", function (d) { return cScale(d.color); })
        .style("stroke", "black")
        .on("click", function (d, i) {

            if (prevId == -1) {
                console.log("First selection: " + data.indexOf(i));
                prevId = data.indexOf(i);
                d3.select(this).transition().duration(transparentTime).style("fill", "transparent");
            }

            else {
                // changing base/height
                currentId = data.indexOf(i);
                console.log("inversion of: " + prevId + ", " + currentId);
                currentBase = data[currentId].base;
                currentHeight = data[currentId].height;
                data[currentId].base = data[prevId].base;
                data[currentId].height = data[prevId].height;
                data[prevId].base = currentBase;
                data[prevId].height = currentHeight;

                // reset
                prevId = -1;

                redraw(data);
            }
        });

    // update
    triangles.transition().duration(switchDimensionsTime)
        .attr("x", function (d) { return xScale(d.x); })
        .attr("y", function (d) { return yScale(d.y); })
        .attr('d', function (d) {
            return trianglePath(xScale(d.x), yScale(d.y), xScale(d.base), yScale(d.height));
        })
        .style("fill", function (d) { return cScale(d.color); })
        .style("stroke", "black");

}

// drawing Triangle path
// Attention to svgHeight, important because of axis inversion
function trianglePath(x, y, base, height) {
    return 'M ' + x + ' ' + y + ' L ' + (x + base / 2) + ' ' + (y - svgHeight + height) + ' L ' + (x + base) + ' ' + y + ' z';
}


function redraw(data) {
    settingXYColorScaleDomain(data);
    updateAxes();
    drawTriangles(data);
}

function resize() {
    // update width
    clientWidth = document.getElementById('chartArea').clientWidth;
    svgWidth = clientWidth - margin.left - margin.right;
    svgHeight = svgWidth - margin.top - margin.bottom;


    xScale = d3.scaleLinear().range([0, svgWidth]);
    yScale = d3.scaleLinear().range([svgHeight, 0]);

    xAxis = d3.axisBottom(xScale).ticks(10);    // add ".tickSizeInner([-800])" to show grid
    yAxis = d3.axisLeft(yScale).ticks(10);

    d3.select("svg")
        .attr("width", svgWidth + margin.left + margin.right)
        .attr("height", svgHeight + margin.top + margin.bottom)

    redraw(trianglesData);
}


d3.json("data/triangles.json")
    .then(function (data) {
        console.log("data:");
        console.log(data);

        trianglesData = data;
        settingXYColorScaleDomain(data);
        drawAxes();
        drawTriangles(data);

    }).catch(function (error) {
        console.log(error)
    });

d3.select(window).on('resize', resize);
