
function handleClick(countryId) {
    let selectedCountries = new Set(Array.from(countrySelect.selectedOptions).map(option => option.value));
    console.log(countryId);
    console.log(selectedCountries);
    document.getElementById(countryId).click()
    // if (selectedCountries.has(countryId)) {
    //     selectedCountries.delete(countryId);
    // } else {
    //     selectedCountries.add(countryId);
    // }
    // for (let i = 0; i < countrySelect.options.length; i++) {
    //     const option = countrySelect.options[i];
    //     if (option.value === countryId) {
    //         option.selected = !option.selected;
    //         break;
    //     }
    // }
    // updateFilteredData();
}

function handleClear() {
    countryOptions = document.getElementsByClassName('checked')

    for (let i = 1; i <= countryOptions.length; i++) {
       countryOptions[i].click()
    }
    // updateFilteredData();
}

function updateMap() {


    const minPages = +document.getElementById("fromSlider").value;
    const maxPages = +document.getElementById("toSlider").value;


    // Get the user's input for start and end dates
    const startDate = new Date(document.getElementById("startDate").value);
    const endDate = new Date(document.getElementById("endDate").value);

    // Get the selected genres from the dropdown
    const selectedGenres = [];

    genreCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            selectedGenres.push(checkbox.value);
        }
    });

    let selectedCountries = new Set(Array.from(countrySelect.selectedOptions).map(option => option.value));
    console.log(minPages, maxPages, startDate, endDate, selectedCountries, selectedGenres);
    svg = d3.select("#mapchart")
    console.log();
    svg.selectAll('path')
        .attr("fill", d => selectedCountries.has(d.id) ? "#b8b8b8" : "#606060");

    svg.selectAll('.marker')
        .attr('visibility', d => selectedCountries.has(d.iso) ? 'visible' : 'hidden');

    svg.selectAll('.marker')
        .attr('visibility', d => {
            const bookDate = new Date(d.clean_date);  // assuming d.bookDate is in a recognizable date format
            return (
                d.pages >= minPages &&
                d.pages <= maxPages &&
                bookDate >= startDate &&
                bookDate <= endDate &&
                selectedGenres.includes(d.first_genre) &&
                selectedCountries.has(d.iso)
            ) ? 'visible' : 'hidden';
        });
    console.trace()

}

function createMapChart(rawData) {
    localFilteredData = rawData.filter(function (d) {
        return d.latitude != "" && d.longitude != "" && d.country != "" && d.first_genre != "";
    });

    // Clean content
    d3.select("#mapchart").selectAll("*").remove();

    // Get the currently filtered genres
    let usedGenres = new Set();
    localFilteredData.forEach(d => {
        usedGenres.add(d.first_genre);
    });

    var allGenres = ["Fantasy", "Historical Fiction", "Poetry", "Science Fiction", "Adventure", "Horror", "Mystery", "Religion", "Biography", "Self Help", "Science", "Business"]
    var selectedGenres = Array.from(allGenres);

    // Define color encoding
    const colorKeys = [
        '#a6cee3', '#1f78b4', '#b2df8a', '#33a02c',
        '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00',
        '#cab2d6', '#6a3d9a', '#ffff99', '#b15928'
    ];

    const color = d3.scaleOrdinal()
        .domain(allGenres)  // 12 keys
        .range(colorKeys);


    // Create SVG
    const svg = d3
        .select("#mapchart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)


    var projection = d3.geoMercator()
        .center([0, 5])
        .scale(150)


    d3.json('data/world_data.json').then(function (data) {

        svg.append('g')
            .selectAll("path")
            .data(data.features)
            .join('path')
            .attr("fill", "#b8b8b8")
            .attr("d", d3.geoPath()
                .projection(projection)
            )
            .style("stroke", "black")
            .style("opacity", .3)
            .on("click", (d, i) => handleClick(i.id));

        // Add circles:
        svg
            .selectAll("myCircles")
            .data(localFilteredData)
            .join("circle")
            .attr('class', 'marker') // Assign a class for easy selection
            .attr("cx", d => projection([d.longitude, d.latitude])[0])
            .attr("cy", d => projection([d.longitude, d.latitude])[1])
            .attr("r", 2)
            .style("fill", function (d) { return (color(d.first_genre)) })
            // .attr("stroke", function (d) { return (color(d.first_genre)) })
            // .attr("stroke-width", 3)
            .attr("fill-opacity", .4)
        // updateMap();  // Initially, display all countries and markers


    });

    var zoom = d3.zoom()
        .scaleExtent([0.25, 8])
        .on('zoom', function (event) {
            svg.selectAll('path')
                .attr('transform', event.transform);
            svg.selectAll('.marker')
                .attr('transform', event.transform);
        });


    svg.call(zoom);

    // Append button to bottom-left corner and make it float
    // const button = svg.append("foreignObject")
    //     .attr("x", 0)
    //     .attr("y", 450) // Adjust position based on your chart size
    //     .attr("width", 100)
    //     .attr("height", 50)
    //     .append("xhtml:button")
    //     .style("position", "absolute")
    //     .text("Click Me");

    // // Button click event
    // button.on("click", function () {
    //     alert("Button clicked!");
    // });
}