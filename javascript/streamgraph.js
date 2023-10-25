// Function that creates a chart using rawData
function createStreamGraph(rawData) {

  legendWidth = 0;
  localFilteredData = rawData.filter(function (d) {
    return d.book_count != "" && d.year != "" && d.first_genre != "";
  });
  // Clean content
  d3.select("#streamgraph").selectAll("*").remove();

  // Create SVG
  const svg = d3
    .select("#streamgraph")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom + 28)
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
  //console.log(keys);

  // Remove empty string from keys
  keys = keys.filter((key) => key !== "");

  // Add X-axis
  const x = d3
    .scaleLinear()
    .domain(d3.extent(dataArray, (d) => d.year))
    .range([0, width - legendWidth]);
  svg
    .append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0, ${height})`)
    .call(d3.axisBottom(x).tickFormat(d3.format("")).ticks(10))

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
  //console.log(keys.length);

  const color = d3.scaleOrdinal()
    .domain(keys)  // 12 keys
    .range(colorKeys);

  // Stack data
  const stackedData = d3.stack().offset(d3.stackOffsetSilhouette).keys(keys)(
    dataArray
  );
  //console.log("-> dataArray", dataArray);
  //console.log("-> stackedData", stackedData);
  // Show areas
  svg
    .selectAll("mylayers")
    .data(stackedData)
    .join("path")
    .style("fill", (d, i) => color(i))
    .attr("d", function (d) {
      return d3
        .area()
        .x(function (d) {
          return x(d.data.year);
        })
        .y0(function (d) {
          return y(d[0]);
        })
        .y1(function (d) {
          return y(d[1]);
        })(d);
    })
    .on("mouseover", (d, i) => handleMouseOver(event, i.key))
    .on("mouseout", handleMouseOut)
    .on("click", (d, i) => handleClick(i.key));

  svg.append("rect")
    .attr("id", "hover-rect-stream")
    .style("display", "none");

  function handleClick(genre) {
    console.log(genreCheckboxes);
    // console.log("clicked line for genre", genre)
    genreCheckboxes.forEach(function (checkbox) {
      if (checkbox.value == genre) {
        checkbox.checked = true;
      }
      else {
        checkbox.checked = false;
      }
      updateFilteredData();
    });
  }


  function handleMouseOver(event, genre) {
    const [x, y] = d3.pointer(event);
    const textWidth = genre.length * 7; // Set the desired text width
    const textHeight = 20; // Set the desired text height

    const rectWidth = textWidth + 6;
    const rectHeight = textHeight + 3;

    d3.select("#hover-rect-stream")
      .attr("width", rectWidth)
      .attr("height", rectHeight)
      .attr("x", x - 20)
      .attr("y", y - 25)
      .attr("rx", 5) // Rounded edges
      .attr("ry", 5)
      .style("fill", color(genre))
      .style("display", "block");

    // Calculate the x position to center the text in the rectangle
    const textX = x - 20 + rectWidth / 2 - textWidth / 2;
    svg.append("text")
      .attr("id", "hover-text-stream")
      .attr("x", textX)
      .attr("y", y - 10)
      .attr("font-size", "14px")
      .text(genre);
  }

  function handleMouseOut() {
    d3.select("#hover-rect-stream")
      .style("display", "none");
    d3.select("#hover-text-stream").remove();
  }

}
