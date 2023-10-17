// Global variables

var toggleAverageLineChart = 0;

document.getElementById("toggleAverageLineChart").addEventListener("click", () => {
  toggleAverageLineChart = toggleAverageLineChart === 0 ? 1 : 0; // Toggle between 1 and 0
  console.log(`toggleAverageLineChart is now: ${toggleAverageLineChart}`);
  drawLineChart(globalFilteredData);
});

function drawLineChart(data) {
  // Filters empty rows
  localFilteredData = data.filter(function (d) {
    return d.norm_rating != "" && d.norm_num_awards != "" && d.norm_num_ratings != "" && d.pages != "" && d.num_in_series != "";
  });
  // Clear the previous chart if it exists
  d3.select("#linechart").selectAll("*").remove();
  console.log("Data for path creation:", localFilteredData);

  const data_norm_rating = create_data_list("norm_rating");
  const data_norm_num_awards = create_data_list("norm_num_awards");
  const data_norm_num_ratings = create_data_list("norm_num_ratings");

  const data_average = [];
  if (toggleAverageLineChart == 1) {

    for (let i = 0; i < data_norm_rating.length; i++) {

      var norm_rating = data_norm_rating[i][1]
      var norm_num_awards = data_norm_num_awards[i][1]
      var norm_num_ratings = data_norm_num_ratings[i][1]

      data_average.push([data_norm_rating[i][0], (norm_rating + norm_num_awards + norm_num_ratings) / 3]);
    }
  }

  function avg_y(x, attribute) {
    var count = 0;
    var attrSum = 0;
    localFilteredData.forEach((element) => {
      if (element.num_in_series == x) {
        switch (attribute) {
          case "norm_rating":
            attrSum = attrSum + element.norm_rating;
            break;
          case "norm_num_awards":
            attrSum = attrSum + element.norm_num_awards;
            break;
          case "norm_num_ratings":
            attrSum = attrSum + element.norm_num_ratings;
            break;
        }
        count = count + 1;
      }
    });
    var avg_y = attrSum / count;
    return avg_y;
  }

  function create_data_list(attribute) {
    const data_list = [];
    const max_x = d3.max(localFilteredData, (d) => d.num_in_series);
    for (let i = 0; i < max_x; i++) {
      if (avg_y(i, attribute)) {
        data_list.push([i, avg_y(i, attribute)]);
      }
    }
    return data_list;
  }

  // Create x and y scales for the line chart
  const xScale = d3
    .scaleLinear()
    .domain([
      d3.min(localFilteredData, (d) => d.num_in_series),
      d3.max(localFilteredData, (d) => d.num_in_series),
    ])
    .range([0, width]);

  const yScale = d3
    .scaleLinear()
    .domain([0, 1,])
    .range([height, 0]);

  const yScale_norm_rating = d3
    .scaleLinear()
    .domain([1,-1])
    .range([height, 0]);

  const yScale_norm_num_awards = d3
    .scaleLinear()
    .domain([-1,1])
    .range([height, 0]);

  const yScale_norm_num_ratings = d3
    .scaleLinear()
    .domain([-1,1])
    .range([height, 0]);

  // Creating legend
  var keys = ["Rating", "Number of Awards", "Number of Reviews"]

  if (toggleAverageLineChart) {
    keys = ["Rating", "Number of Awards", "Number of Reviews", "Average"]
  }

  var color = d3.scaleOrdinal()
    .domain(keys)
    .range(d3.schemeSet2);

  // Create the SVG container.
  const svg = d3
    .select("#linechart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  var line_norm_rating = d3.line()
    .x(function (d) { return xScale(d[0]); })
    .y(function (d) { return yScale_norm_rating(d[1]); })
    .curve(d3.curveMonotoneX)

  svg.append("path")
    .attr("fill", "none")
    .attr("stroke", color("Rating"))
    .attr("stroke-width", 1.5)
    .attr("d", line_norm_rating(data_norm_rating));

  var line_norm_num_awards = d3.line()
    .x(function (d) { return xScale(d[0]); })
    .y(function (d) { return yScale_norm_num_awards(d[1]); })
    .curve(d3.curveMonotoneX)

  svg.append("path")
    .attr("fill", "none")
    .attr("stroke", color("Number of Awards"))
    .attr("stroke-width", 1.5)
    .attr("d", line_norm_num_awards(data_norm_num_awards));

  var line_norm_num_ratings = d3.line()
    .x(function (d) { return xScale(d[0]); })
    .y(function (d) { return yScale_norm_num_ratings(d[1]); })
    .curve(d3.curveMonotoneX)

  svg.append("path")
    .attr("fill", "none")
    .attr("stroke", color("Number of Reviews"))
    .attr("stroke-width", 1.5)
    .attr("d", line_norm_num_ratings(data_norm_num_ratings));

  if (toggleAverageLineChart) {
    var line_average = d3.line()
      .x(function (d) { return xScale(d[0]); })
      .y(function (d) { return yScale(d[1]); })
      .curve(d3.curveMonotoneX)

    svg.append("path")
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("stroke-width", 1.5)
      .attr("d", line_average(data_average));
  }

  // Creating legend
  svg.selectAll("mydots")
    .data(keys)
    .enter()
    .append("circle")
    .attr("cx", width - 140)
    .attr("cy", function (d, i) { return 0 + i * 25 }) // 100 is where the first dot appears. 25 is the distance between dots
    .attr("r", 5)
    .style("fill", function (d) { return color(d) })

  // Add one text in the legend for each name.
  svg.selectAll("mylabels")
    .data(keys)
    .enter()
    .append("text")
    .attr("x", width - 130)
    .attr("y", function (d, i) { return 0 + i * 25 }) //25 is the distance between dots
    // .style("fill", function (d) { return color(d) })
    .text(function (d) { return d })
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")

  // Create tick marks and labels for the x and y axes
  var xTicks = [];
  var yTicks = [];
  for (let index = 0; index <= 1; index += 0.25) {
    xTicks.push(Math.round(xScale.invert(index * width)));
    yTicks.push(Math.round(yScale.invert(index * height)));
  }

  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(
      d3
        .axisBottom(xScale)
        .tickFormat((d) => d)
        .tickValues(xTicks)
        .tickSizeOuter(0)
    );

  svg
    .append("g")
    .attr("class", "y-axis")
    .attr("transform", `translate(${5},${0})`)
    .call(
      d3
        .axisLeft(yScale)
        .tickFormat((d) => d)
        .tickValues(yTicks)
        .tickSizeOuter(0)
    );

  // Add labels for the x and y axes
  svg
    .append("text")
    .attr("class", "x-axis-label")
    .attr("x", width / 2)
    .attr("y", height + margin.top + 20)
    .style("text-anchor", "middle")
    .text("# in book series");

  svg
    .append("text")
    .attr("class", "y-axis-label")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 30)
    .style("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Success metric");
}
