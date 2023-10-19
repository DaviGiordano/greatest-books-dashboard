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

    // Redefining pages yAxis
    y['rating'] = d3.scaleLinear()
        .domain([0, 5])
        .range([height, 0]);

    // Build the X scale -> it find the best position for each Y axis
    x = d3.scalePoint()
        .range([0, width])
        .domain(dimensions);

    // path function
    // The path function take a row of the csv as input, and return x and y coordinates of the line to draw for this raw.
    function path(d) {
        // console.log(d);
        // console.log(dimensions.map(function (p) { return [x(p), y[p](d[p])]; }));
        return d3.line()(dimensions.map(function (p) { return [x(p), y[p](d[p])]; }));
    }
    // Draw the lines
    svg
        .selectAll("myPath")
        .data(localFilteredData)
        .join("path")
        .attr("class", function (d) { return "line " + d.first_genre }) // 2 class for each line: 'line' and the group name
        .attr("d", path)
        .style("fill", "none")
        .style("stroke", function (d) { return (color(d.first_genre)) })
        .style("opacity", 0.5)

    // Draw the axis:
    svg.selectAll("myAxis")
        // For each dimension of the dataset I add a 'g' element:
        .data(dimensions).enter()
        .append("g")
        .attr("class", "axis")
        // I translate this element to its right position on the x axis
        .attr("transform", function (d) { return `translate(${x(d)})` })
        // And I build the axis with the call function
        .each(function (d) { d3.select(this).call(d3.axisLeft().ticks(5).scale(y[d])); })
        // Add axis title
        .append("text")
        .style("text-anchor", "middle")
        .attr("y", -9)
        .text(function (d) { return d; })
        .style("fill", "black")
}
