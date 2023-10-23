// Global variables

const selectMetric = document.getElementById("selectMetric");

 // Get selected metric
 var selectedMetric = "rating"

// Add an event listener to respond to changes in the selected metric
selectMetric.addEventListener("change", function () {
  selectedMetric = selectMetric.value;

  // Call a function to update the linechart with the selected metric
  drawLineChart(globalFilteredData); // You need to implement this function
});


function drawLineChart(data) {
  // Filters empty rows
  localFilteredData = data.filter(function (d) {
    return d.norm_rating != "" && d.norm_num_awards != "" && d.norm_num_ratings != "" && d.pages != "" && d.num_in_series != ""
    && d.rating != "" && d.numRatings != "" && d.num_awards != "";
  });

 //console.log("filtered data", localFilteredData)
  // Clear the previous chart if it exists
  d3.select("#linechart").selectAll("*").remove();
  

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
  var xScale = d3
    .scaleLinear()
    .domain([
      d3.min(localFilteredData, (d) => d.num_in_series),
      d3.max(localFilteredData, (d) => d.num_in_series),
    ])  
    .range([5, width]);

    if(localFilteredData.length == 0){
      xScale = d3
      .scaleLinear()
      .domain([0,1])
      .range([5, width]);
    }

    //yScale changes later depending on the specific attribute values
    var yScale = d3
    .scaleLinear()
    .domain([0, 1])
    .range([height -20, 0]);

  
  var groupedByGenre = d3.group(localFilteredData, (d) => d.first_genre);

  var domain_min = Number.MAX_VALUE; //used for setting yScale min
  var domain_max = Number.MIN_VALUE; //used for setting yScale max

  groupedByGenre.forEach((group, key) => {
  if(key != ""){
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


for (let i = 1; i < data_list.length; i++) {
  const currentValue = data_list[i].value;
  if (currentValue < domain_min) {
    domain_min = currentValue;
  }
  if (currentValue > domain_max) {
    domain_max = currentValue;
  }
}
if(selectedMetric != "average"){
  yScale = d3
  .scaleLinear()
  .domain([0, domain_max*1.2,])
  .range([height-20, 0]);
}
else if(selectedMetric == "average"){
  yScale = d3
.scaleLinear()
.domain([domain_min, domain_max*1.2,])
.range([height -20, 0]);
}

  
//sort so that #1 and so on...
data_list.sort((a, b) => a.num_in_series - b.num_in_series);

const genre = d3.extent(group, (d) => d.first_genre)[0]; //used for displaying genre when hovering


var line = d3.line()
.x(function (d) { return xScale(d.num_in_series); })
.y(function (d) { return yScale(d.value); })
.curve(d3.curveMonotoneX)
svg.append("path")
  .attr("fill", "none")
  .attr("stroke", color(key))
  .attr("stroke-width", 1.8)
  .attr("d", line(data_list))
  .on("mouseover", handleMouseOver)
  .on("mouseout", handleMouseOut)
  .on("click", handleClick);

  svg.append("rect")
  .attr("id", "hover-rect")
  .style("display", "none");

function handleClick(event){
  console.log("clicked line for genre", genre)
  genreCheckboxes.forEach(function (checkbox) {
    if(checkbox.value == genre){
      checkbox.checked = true;
    }
    else{
      checkbox.checked = false;
    }
    updateFilteredData();
});
}


  function handleMouseOver(event) {
    const [x, y] = d3.pointer(event);
    const textWidth = genre.length * 7; // Set the desired text width
    const textHeight = 20; // Set the desired text height

    const rectWidth = textWidth + 6;
    const rectHeight = textHeight + 3;

  d3.select("#hover-rect")
    .attr("width", rectWidth)
    .attr("height", rectHeight)
    .attr("x", x - 20)
    .attr("y", y - 25)
    .attr("rx", 5) // Rounded edges
    .attr("ry", 5)
    .style("fill", color(key))
    .style("display", "block");

  // Calculate the x position to center the text in the rectangle
  const textX = x - 20 + rectWidth / 2 - textWidth / 2;

  svg.append("text")
    .attr("id", "hover-text")
    .attr("x", textX)
    .attr("y", y - 10)
    .attr("font-size", "14px")
    .text(genre);
  }

  function handleMouseOut() {
    d3.select("#hover-rect")
      .style("display", "none");
    d3.select("#hover-text").remove();
  }

  }
  });


  // Create tick marks and labels for the x and y axes
  var xTicks = [];
  var yTicks = [];
  if(selectedMetric != "num_ratings"){
    for (let index = 0; index <= 1; index += 0.05) {
      xTicks.push(Math.round(xScale.invert(index * width)));
      yTicks.push(Math.round(yScale.invert(index * (height -20))));
    }
  }
  if(selectedMetric == "num_ratings"){
    for (let index = 0; index <= 1; index += 0.05) {
      xTicks.push(Math.round(xScale.invert(index * width)));
    }
    for (let index = 0; index <= 1; index += 1) {
      yTicks.push(Math.round(yScale.invert(index * (height-20))));
    }
    
  }
 

  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${height - 20})`)
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
    .attr("y", height + margin.top - 15)
    .style("text-anchor", "middle")
    .text("# in book series");

  var y_axis_text = "";
  switch (selectedMetric){
    case "rating":
      y_axis_text = "Rating"
      break;
    case "num_awards":
      y_axis_text = "Number of Awards"
      break;
    case "num_ratings":
      y_axis_text = "Numer of Ratings"
      break;
    case "average":
      y_axis_text = "Average"
      break;
  }
  
  svg
    .append("text")
    .attr("class", "y-axis-label")
    .attr("x", -height / 2)
    .attr("y", -margin.left + 20)
    .style("text-anchor", "middle")
    .attr("transform", "rotate(-90)")
    .text(y_axis_text);
}


