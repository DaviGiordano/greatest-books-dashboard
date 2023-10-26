var dimensions = ['pages', 'numRatings', 'rating', 'num_awards']

function createParallelCoords(rawData) {

    function swapDimensions(i, j) {
        console.log(i, j);
        if (i >= 0 && i < dimensions.length && j >= 0 && j < dimensions.length) {
            const temp = dimensions[i];
            dimensions[i] = dimensions[j];
            dimensions[j] = temp;
        }
        console.log(dimensions);
        createParallelCoords(localFilteredData)
    }


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




    // Calculate the average values for each dimension for each specified genre
    const averageGenreData = {};
    const genreCounts = {}; // Variable to store the number of items in each genre

    allGenres.forEach(genre => {
        const averageValues = {};
        const itemsInGenre = localFilteredData.filter(d => d.first_genre === genre);
        dimensions.forEach(dimension => {
            averageValues[dimension] = d3.mean(itemsInGenre, d => +d[dimension]);
        });
        // dimensions.forEach(dimension => {
        //     averageValues[dimension] = d3.mean(localFilteredData.filter(d => d.first_genre === genre), d => +d[dimension]);
        // });
        averageGenreData[genre] = averageValues;
        genreCounts[genre] = itemsInGenre.length;  // Save the number of items for this genre

    });
    // console.log(genreCounts['Adventure']);
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
    genreCountsArray = (Object.values(genreCounts))
    const line_width = d3.scaleLinear()
        .domain([d3.min(genreCountsArray), d3.max(genreCountsArray)])
        .range([1, 20])

    // console.log(line_width('Adventure'));
    // Redraw the axes with the updated scales
    svg.selectAll(".axis")
        .each(function (d) {
            const axis = d3.select(this).call(
                d3.axisLeft().ticks(5).scale(y[d])
                    .tickSizeInner(6) // Size of intermediate ticks
                    .tickSizeOuter(0)  // Size of the minimum and maximum ticks (set to 0 to hide)
            );
        });



    // Function to handle mouseover
    function handleMouseOver(event, genre) {
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
            .style("z-index", '1000')
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
            if (checkbox.value == genre) {
                checkbox.checked = true;
            }
            else {
                checkbox.checked = false;
            }
            updateFilteredData();
        });
    }


    // console.log(averageGenreData);
    // Add lines representing the average values for each genre
    allGenres.forEach(genre => {
        svg.append("path")
            .datum(dimensions.map(dimension => ({ dimension, value: averageGenreData[genre][dimension] })))
            .attr("class", "average-line")
            .attr("d", function (d) {
                return d3.line()(d.map(function (p) { return [x(p.dimension), y[p.dimension](p.value)]; }));
            })
            .style("fill", "none")
            .style("stroke", color(genre)) // You can choose different colors for each genre
            .style("stroke-width", line_width(genreCounts[genre]))
            .on("mouseover", () => handleMouseOver(event, genre)) // Show tooltip on hover
            .on("mouseout", handleMouseOut)
            .on("click", () => handleClick(genre)); // Hide tooltip on mouseout;
    });
    // Draw the axis:
    // svg.selectAll("myAxis")
    //     .data(dimensions).enter()
    //     .append("g")
    //     .attr("class", "axis")
    //     .attr("transform", function (d) { return `translate(${x(d)})` })
    //     .each(function (d) {
    //         const axis = d3.select(this).call(d3.axisLeft().ticks(5).scale(y[d]));
    //     })
    //     .append("text")
    //     .style("text-anchor", "middle")
    //     .attr("y", -9)
    //     .attr("x", -10)
    //     .text(function (d) { return d; })
    //     .style("fill", "black")
    svg.selectAll("myAxis")
        .data(dimensions).enter()
        .append("g")
        .attr("class", "axis")
        .attr("transform", function (d) { return `translate(${x(d)})` })
        .each(function (d) {
            const axis = d3.select(this).call(d3.axisLeft().ticks(5).scale(y[d]));
            const padding = 2; // Define your padding value

            axis.selectAll("text")  // Select all tick texts
                .attr("fill", "black")
                .each(function () {
                    const bbox = this.getBBox();  // Get bounding box of text
                    d3.select(this.parentNode)
                        .insert("rect", ":first-child")
                        .attr("x", bbox.x - padding)
                        .attr("y", bbox.y - padding)
                        .attr("width", bbox.width + 2 * padding)
                        .attr("height", bbox.height + 2 * padding)
                        .attr("rx", 5)  // Add border radius
                        .attr("ry", 5)  // Add border radius
                        .attr("fill", "white")
                        .attr("opacity", 1);  // Set opacity
                });
        })
        .append("text")
        .style("text-anchor", "middle")
        .attr("y", -9)
        .attr("x", -10)
        .text(function (d) { return d; })
        .style("fill", "black");

    // Add buttons for swapping axes
    svg.selectAll("swapButton")
        .data(dimensions).enter()
        .append("text")
        .style("text-anchor", "middle")
        .attr("y", height + margin.bottom / 2)
        .attr("x", function (d) { return x(d) - 10; })
        .text("<")
        .style("cursor", "pointer")
        .on("click", function (d, i) {
            swapDimensions(dimensions.indexOf(i), dimensions.indexOf(i) - 1);
        });

    svg.selectAll("swapButton")
        .data(dimensions).enter()
        .append("text")
        .style("text-anchor", "middle")
        .attr("y", height + margin.bottom / 2)
        .attr("x", function (d) { return x(d) + 10; })
        .text(">")
        .style("cursor", "pointer")
        .on("click", function (d, i) {
            swapDimensions(dimensions.indexOf(i), dimensions.indexOf(i) + 1);
        });


    svg.append("rect")
        .attr("id", "hover-rect-pc")
        .style("display", "none");
}
