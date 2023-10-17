// handleFilters function
document.getElementById("filterButton").addEventListener("click", updateFilteredData);

const genreCheckboxes = document.querySelectorAll('#genreCheckboxList input[type="checkbox"]');

function selectAllGenres() {
    genreCheckboxes.forEach(function (checkbox) {
        checkbox.checked = true;
    });
}

function clearAllGenres() {
    genreCheckboxes.forEach(function (checkbox) {
        checkbox.checked = false;
    });
}


// Function to get the selected genres from the dropdown
function getSelectedGenres() {
    const selectedGenres = Array.from(genreCheckboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);

    return selectedGenres;
}

function updateFilteredData() {
    /**
     * Reads the values set in the filter components
     * Updates the globalFilteredData variable
     * Calls drawer functiond
     */

    // Get the user's input for minimum and maximum pages
    const minPages = +document.getElementById("minPages").value;
    const maxPages = +document.getElementById("maxPages").value;

    // Get the user's input for start and end dates
    const startDate = new Date(document.getElementById("startDate").value);
    const endDate = new Date(document.getElementById("endDate").value);

    // Get the selected genres from the dropdown
    const selectedGenres = getSelectedGenres();

    // Logs the selected filters
    console.log("updateFilteredData called with minPages:", minPages, "and maxPages:", maxPages);
    console.log("Start Date:", startDate, "End Date:", endDate);
    console.log("Selected Genres:", selectedGenres);

    // Filter the data based on the selected range of pages and dates
    globalFilteredData = globalInitialData.filter(function (d) {
        const bookDate = new Date(d.clean_date);
        return (
            d.pages >= minPages &&
            d.pages <= maxPages &&
            bookDate >= startDate &&
            bookDate <= endDate &&
            // selectedGenres.some(genre => d.genres.includes(genre))// && // Check if the book has at least one selected genre
            selectedGenres.includes(d.first_genre)
        );
    });

    // Calls drawer functions
    drawLineChart(globalFilteredData);
    createStreamGraph(globalFilteredData);
}