// Function that creates a chart using rawData
function createStreamGraph(rawData) {

  localFilteredData = rawData.filter(function (d) {
    return d.book_count != "" && d.year != "" && d.first_genre != "";
  });
  // Clean content
  d3.select("#streamgraph").selectAll("*").remove();

  // Create SVG
  const svg = d3
    .select("#streamgraph")
    .append("svg")
    .attr("width", width + margin.left + margin.right+200)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Load data
  let dataObj = {};
  let allGenres = new Set();

  // Initialize the years with empty genre objects
  localFilteredData.forEach((d) => {
    if (!dataObj[d.year]) {
      dataObj[d.year] = {};
    }
    allGenres.add(d.first_genre);
  });

  // Initialize all year-genre combinations with 0
  for (let year in dataObj) {
    allGenres.forEach((genre) => {
      dataObj[year][genre] = 0;
    });
  }

  // Populate the counts
  localFilteredData.forEach((d) => {
    dataObj[d.year][d.first_genre] += parseInt(d.book_count);
  });

  // Convert to an array for D3
  let dataArray = [];
  for (let [year, genres] of Object.entries(dataObj)) {
    dataArray.push({ year: parseInt(year), ...genres });
  }

  dataArray = dataArray.map((d) => {
    delete d[""];
    return d;
  });
  var keys = ["Fantasy", "Historical Fiction", "Poetry", "Science Fiction", "Adventure", "Horror", "Mystery", "Religion", "Biography", "Self Help", "Science", "Business"]
  var selected_keys = Array.from(allGenres);
  console.log(keys);
  
  // Remove empty string from keys
  keys = keys.filter((key) => key !== "");

  // Add X-axis
  const x = d3
    .scaleLinear()
    .domain(d3.extent(dataArray, (d) => d.year))
    .range([0, width]);
  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x).ticks(5));

  // Add Y-axis
  maxValue = d3.max(dataArray, d => keys.reduce((acc, cur) => acc + (d[cur] || 0), 0));
  const y = d3
    .scaleLinear()
    // .domain([-800, 800])
    .domain([-maxValue / 2, maxValue / 2])
    .range([height, 0]);
  // svg.append("g").call(d3.axisLeft(y));

const colorKeys = [
  '#a6cee3', '#1f78b4', '#b2df8a', '#33a02c',
  '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00',
  '#cab2d6', '#6a3d9a', '#ffff99', '#b15928'
];
console.log(keys.length);

const color = d3.scaleOrdinal()
  .domain(keys)  // 12 keys
  .range(colorKeys);

  // Stack data
  const stackedData = d3.stack().offset(d3.stackOffsetSilhouette).keys(keys)(
    dataArray
  );
  console.log("-> dataArray", dataArray);
  console.log("-> stackedData", stackedData);
  // Show areas
  svg
    .selectAll("mylayers")
    .data(stackedData)
    .join("path")
    .style("fill", (d, i) => color(i))
    .attr("d", function (d) {
      // console.log("Data:", d);
      return d3
        .area()
        .x(function (d) {
          // console.log("x:", d.data.year);
          return x(d.data.year);
        })
        .y0(function (d) {
          // console.log("y0:", d[0]);
          return y(d[0]);
        })
        .y1(function (d) {
          // console.log("y1:", d[1]);
          return y(d[1]);
        })(d);
    });

  // Create legend
  const legend = svg.append("g")
    .attr("transform", `translate(${width + 20},0)`);  // Adjust the position accordingly

  selected_keys.reverse().forEach((key, i) => {
    const legendRow = legend.append("g")
      .attr("transform", `translate(0,${i * 20})`);

    legendRow.append("rect")
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", color(key));

    legendRow.append("text")
      .attr("x", 15)
      .attr("y", 10)
      .attr("text-anchor", "start")
      .style("text-transform", "capitalize")
      .text(key);
  });

}
