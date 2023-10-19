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
    // .rotate([-180, 0]);

    // // Create data for circles:
    // const markers = [
    //     { long: 9.083, lat: 42.149 }, // corsica
    //     { long: 7.26, lat: 43.71 }, // nice
    //     { long: 2.349, lat: 48.864 }, // Paris
    //     { long: -1.397, lat: 43.664 }, // Hossegor
    //     { long: 3.075, lat: 50.640 }, // Lille
    //     { long: -3.83, lat: 58 }, // Morlaix
    // ];


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
}