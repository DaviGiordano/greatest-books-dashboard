function createParallelCoords(rawData) {
    localFilteredData = rawData.filter(function (d) {
        return d.pages != "" && d.numRatings != "" && d.rating != "" && d.num_awards != "" && d.first_genre != "";
    });

    // Clean content
    d3.select("#parallelcoords").selectAll("*").remove();
    // Create SVG
    const svg = d3
        .select("#parallelcoords")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Get the currently filtered genres
    let usedGenres = new Set();
    localFilteredData.forEach(d => {
        usedGenres.add(d.first_genre);
    });

    var allGenres = ["Fantasy", "Historical Fiction", "Poetry", "Science Fiction", "Adventure", "Horror", "Mystery", "Religion", "Biography", "Self Help", "Science", "Business"]
    var selectedGenres = Array.from(allGenres);
    // console.log(allGenres);
    // console.log(selectedGenres);

    const colorKeys = [
        '#a6cee3', '#1f78b4', '#b2df8a', '#33a02c',
        '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00',
        '#cab2d6', '#6a3d9a', '#ffff99', '#b15928'
    ];

    const color = d3.scaleOrdinal()
        .domain(allGenres)  // 12 keys
        .range(colorKeys);

    dimensions = ['pages', 'numRatings', 'rating', 'num_awards']

    const y = {};
    for (const name of dimensions) {
        y[name] = d3.scaleLinear()
            .domain(d3.extent(localFilteredData, d => +d[name]))
            .range([height, 0]);
    }


    // Build the X scale -> it find the best position for each Y axis
    x = d3.scalePoint()
        .range([0, width])
        .domain(dimensions);

    // path function
    // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
    function path(d) {

        return d3.line()(dimensions.map(function (p) { return [x(p), y[p](d[p])]; }));
    }


// Draw the axis:
svg.selectAll("myAxis")
    .data(dimensions).enter()
    .append("g")
    .attr("class", "axis")
    .attr("transform", function (d) { return `translate(${x(d)})` })
    .each(function (d) {
        const axis = d3.select(this).call(d3.axisLeft().ticks(5).scale(y[d]));
    })
    .append("text")
    .style("text-anchor", "middle")
    .attr("y", -9)
    .attr("x", -10)
    .text(function (d) { return d; })
    .style("fill", "black");


    // Calculate the average values for each dimension for each specified genre
    const averageGenreData = {};

    allGenres.forEach(genre => {
        const averageValues = {};
        dimensions.forEach(dimension => {
            averageValues[dimension] = d3.mean(localFilteredData.filter(d => d.first_genre === genre), d => +d[dimension]);
        });
        averageGenreData[genre] = averageValues;
    });
    
    // Calculate the overall minimum and maximum values for each dimension
    const overallMinMaxValues = {};
    dimensions.forEach(dimension => {
    const [min, max] = d3.extent(allGenres.map(genre => averageGenreData[genre][dimension]));
    const offset = 0.1 * (max - min); // 10% offset
    overallMinMaxValues[dimension] = [min - offset, max + offset];
    });

    // Update the y-axis scales based on the overall minimum and maximum values
    for (const name of dimensions) {
    y[name] = d3.scaleLinear()
        .domain(overallMinMaxValues[name])
        .range([height, 0]);
    }

    // Redraw the axes with the updated scales
    svg.selectAll(".axis")
        .each(function (d) {
            const axis = d3.select(this).call(
                d3.axisLeft().ticks(5).scale(y[d])
                    .tickSizeInner(6) // Size of intermediate ticks
                    .tickSizeOuter(0)  // Size of the minimum and maximum ticks (set to 0 to hide)
            );
        });


    svg.append("rect")
    .attr("id", "hover-rect-pc")
    .style("display", "none");

    // Function to handle mouseover
    function handleMouseOver(event,genre) {
        const [x, y] = d3.pointer(event);
        const textWidth = genre.length * 7; // Set the desired text width
        const textHeight = 20; // Set the desired text height
    
        const rectWidth = textWidth + 6;
        const rectHeight = textHeight + 3;
  
      d3.select("#hover-rect-pc")
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
        .attr("id", "hover-text-pc")
        .attr("x", textX)
        .attr("y", y - 10)
        .attr("font-size", "14px")
        .text(genre);
    }

    // Function to handle mouseout
    function handleMouseOut() {
        d3.select("#hover-rect-pc")
        .style("display", "none");
        d3.select("#hover-text-pc").remove();
    }

    // Function to handle click
    function handleClick(genre) {
        console.log("picked ", genre);
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


    // Add lines representing the average values for each genre
    allGenres.forEach(genre => {
        svg.append("path")
            .datum(dimensions.map(dimension => ({ dimension, value: averageGenreData[genre][dimension] })))
            .attr("class", "average-line")
            .attr("d", function (d) {
                return d3.line()(d.map(function (p) { return [x(p.dimension), y[p.dimension](p.value)]; }));
            })
            .style("fill", "none")
            .style("stroke",  color(genre)) // You can choose different colors for each genre
            .style("stroke-width", 2)
            .on("mouseover", () => handleMouseOver(event,genre)) // Show tooltip on hover
            .on("mouseout", handleMouseOut)
            .on("click", () => handleClick(genre)); // Hide tooltip on mouseout;
    });
}
