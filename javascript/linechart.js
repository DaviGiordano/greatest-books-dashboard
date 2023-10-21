// Global variables

// Get a reference to the select element
const selectMetric = document.getElementById("selectMetric");

// Add an event listener to respond to changes in the selected metric
selectMetric.addEventListener("change", function () {
    selectedMetric = selectMetric.value;

    // Call a function to update the linechart with the selected metric
    drawLineChart(globalFilteredData); // You need to implement this function
});

var selectedMetric = "rating"
var toggleAverageLineChart = 0;

document.getElementById("toggleAverageLineChart").addEventListener("click", () => {
  toggleAverageLineChart = toggleAverageLineChart === 0 ? 1 : 0; // Toggle between 1 and 0
  console.log(`toggleAverageLineChart is now: ${toggleAverageLineChart}`);
  drawLineChart(globalFilteredData);
});

function drawLineChart(data) {
  console.log(selectedMetric)
  // Filters empty rows
  localFilteredData = data.filter(function (d) {
    return d.norm_rating != "" && d.norm_num_awards != "" && d.norm_num_ratings != "" && d.pages != "" && d.num_in_series != ""
    && d.rating != "" && d.numRatings != "" && d.num_awards != "";
  });
  // Clear the previous chart if it exists
  d3.select("#linechart").selectAll("*").remove();
  // console.log("Data for path creation:", localFilteredData);
  

  // Create the SVG container.
  const svg = d3
  .select("#linechart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);


  // Get the currently filtered genres
  let usedGenres = new Set();
  localFilteredData.forEach(d => {
      usedGenres.add(d.first_genre);
  });

  var allGenres = ["Fantasy", "Historical Fiction", "Poetry", "Science Fiction", "Adventure", "Horror", "Mystery", "Religion", "Biography", "Self Help", "Science", "Business"]
 
  const colorKeys = [
      '#a6cee3', '#1f78b4', '#b2df8a', '#33a02c',
      '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00',
      '#cab2d6', '#6a3d9a', '#ffff99', '#b15928'
  ];

  const color = d3.scaleOrdinal()
  .domain(allGenres)  // 12 keys
  .range(colorKeys);

  // Create x and y scales for the line chart
  const xScale = d3
    .scaleLinear()
    .domain([
      d3.min(localFilteredData, (d) => d.num_in_series),
      d3.max(localFilteredData, (d) => d.num_in_series),
    ])
    .range([5, width]);

  var yScale;

  // var domain_min;
  // var domain_max;
  // switch(selectedMetric){
  //   case "rating":
  //   domain_min = d3.min(localFilteredData, (d) => d.rating);
  //   domain_max = d3.max(localFilteredData, (d) => d.rating);
  //   break;
  //   case "num_awards":
  //     domain_min = d3.min(localFilteredData, (d) => d.num_awards);
  //     domain_max = d3.max(localFilteredData, (d) => d.num_awards);
  //     break;
  //   case "num_ratings":
  //     domain_min = d3.min(localFilteredData, (d) => d.numRatings);
  //     domain_max = d3.max(localFilteredData, (d) => d.numRatings);
  //     break;
  //   case "average":
  //     domain_min = -1; //using normalized metric
  //     domain_max = 1;
  //     break;
  // }
  
  // const yScale = d3
  //   .scaleLinear()
  //   .domain([domain_min, domain_max,])
  //   .range([height, 0]);

  
  var groupedByGenre = d3.group(localFilteredData, (d) => d.first_genre)
  
  groupedByGenre.forEach((group, key) => {
   
    // Group the data based on the 'num_in_series' attribute
  var groupedData = d3.group(group, (d) => d.num_in_series);

  // Lists for the different attributes we want to display
  var data_list = []

  // Calculate the aggregate values for each group
  //norm rating
  groupedData.forEach((group, key) => {
    switch (selectedMetric){
      case "rating":
        var mean = d3.mean(group, (d) => d.rating);
        data_list.push({ num_in_series: key, value: mean });
        break;
      case "num_awards":
        var mean = d3.mean(group, (d) => d.num_awards);
        data_list.push({ num_in_series: key, value: mean });
        break;
      case "num_ratings":
        var mean = d3.mean(group, (d) => d.numRatings);
        data_list.push({ num_in_series: key, value: mean });
        break;
      case "average":
        var norm_rating = d3.mean(group, (d) => d.norm_rating);
        var norm_num_awards = d3.mean(group, (d) => d.norm_num_awards);
        var norm_num_ratings = d3.mean(group, (d) => d.norm_num_ratings);
        var mean_metrics = (norm_rating + norm_num_awards + norm_num_ratings) / 3;
        data_list.push({ num_in_series: key, value: mean_metrics });
        break;
        
    }
  });


let domain_min = data_list[0].value;
let domain_max = data_list[0].value;

for (let i = 1; i < data_list.length; i++) {
  const currentValue = data_list[i].value;
  if (currentValue < domain_min) {
    domain_min = currentValue;
  }
  if (currentValue > domain_max) {
    domain_max = currentValue;
  }
}
  yScale = d3
    .scaleLinear()
    .domain([domain_min*0.7, domain_max*1.2,])
    .range([height, 0]);
  
  //sort so that #1 and so on...
  data_list.sort((a, b) => a.num_in_series - b.num_in_series);

  var line = d3.line()
  .x(function (d) { return xScale(d.num_in_series); })
  .y(function (d) { return yScale(d.value); })
  .curve(d3.curveMonotoneX)
svg.append("path")
  .attr("fill", "none")
  .attr("stroke", color(key))
  .attr("stroke-width", 1.3)
  .attr("d", line(data_list));


  });

  


  

  // Creating legend
  var keys = ["Rating", "Number of Awards", "Number of Reviews"]

  if (toggleAverageLineChart) {
    keys = ["Rating", "Number of Awards", "Number of Reviews", "Average"]
  }

 

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
    .attr("y", -margin.left + 15)
    .style("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text("Success metric");
}
