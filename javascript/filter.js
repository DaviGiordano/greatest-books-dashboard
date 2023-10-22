// handleFilters function
document.getElementById("filter-box").addEventListener("click", updateFilteredData);

const genreCheckboxes = document.querySelectorAll('.genre-checkbox');
const countrySelect = document.getElementById('countrySelect');

// Select All button
const selectAllGenresButton = document.getElementById('selectAllButton');
selectAllButton.addEventListener('click', selectAllGenres);

// Clear All button
const clearAllGenresButton = document.getElementById('clearAllButton');
clearAllButton.addEventListener('click', clearAllGenres);

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

function selectAllCountries() {
    countryCheckboxes.forEach(function (checkbox) {
        checkbox.checked = true;
    });
}

function clearAllCountries() {
    countryCheckboxes.forEach(function (checkbox) {
        checkbox.checked = false;
    });
}


// Function to get selected genres
function getSelectedGenres() {
    const selectedGenres = [];

    genreCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            selectedGenres.push(checkbox.value);
        }
    });

    return selectedGenres;
}

// Function to get the selected countries from the dropdown
function getSelectedCountries() {
 
    const selectedCountries = Array.from(countrySelect.selectedOptions).map(option => option.value);

    return selectedCountries;
}

function updateFilteredData() {
    /**
     * Reads the values set in the filter components
     * Updates the globalFilteredData variable
     * Calls drawer functiond
     */
    // Get the user's input for minimum and maximum pages
    const minPages = +document.getElementById("fromSlider").value;
    const maxPages = +document.getElementById("toSlider").value;
  

    // Get the user's input for start and end dates
    const startDate = new Date(document.getElementById("startDate").value);
    const endDate = new Date(document.getElementById("endDate").value);

    // Get the selected genres from the dropdown
    const selectedGenres = getSelectedGenres();

    // Get the selected countries from the dropdown
    const selectedCountries = getSelectedCountries();

    // Logs the selected filters
    console.log("updateFilteredData called with minPages:", minPages, "and maxPages:", maxPages);
    console.log("Start Date:", startDate, "End Date:", endDate);
    console.log("Selected Genres:", selectedGenres);
    console.log("Selected Countries:", selectedCountries);

    // Filter the data based on the selected range of pages and dates
    globalFilteredData = globalInitialData.filter(function (d) {
        const bookDate = new Date(d.clean_date);
        return (
            d.pages >= minPages &&
            d.pages <= maxPages &&
            bookDate >= startDate &&
            bookDate <= endDate &&
            // selectedGenres.some(genre => d.genres.includes(genre))// && // Check if the book has at least one selected genre
            selectedGenres.includes(d.first_genre) &&
            selectedCountries.includes(d.country)
        );
    });

    // Calls drawer functions
    drawLineChart(globalFilteredData);
    createStreamGraph(globalFilteredData);
    createParallelCoords(globalFilteredData);
    createMapChart(globalFilteredData);     
}