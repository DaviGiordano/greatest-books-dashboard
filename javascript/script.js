const element = document.getElementById("dashboard");
// const parentElement = element.parentNode;
const parentWidth = element.offsetWidth;
const parentHeight = element.offsetHeight;

const margin = { top: 30, right: 20, bottom: 20, left: 40 },
  width = parentWidth/2 -10 - margin.left - margin.right,
  height = parentHeight/2  - 28 - margin.top - margin.bottom;


var globalFilteredData;
var globalInitialData;

function startDashboard() {
  
  /**
   * Reads the clean_books csv file
   * Transforms the adequate columns to numeric format
   * Filters empty rows
   * Calls drawer functions
   */

  // Reads csv
  d3.csv("data/clean_books_with_country_optimized.csv").then(function (data) {
    // Converts to numeric format
    data.forEach(d => {
      d.pages = +d.pages;
      d.num_in_series = +d.num_in_series;
      d.norm_rating = +d.norm_rating;
      d.norm_num_awards = +d.norm_num_awards;
      d.norm_num_ratings = +d.norm_num_ratings;
      d.book_count = +d.book_count;
      d.year = + d.year;
      d.latitude = + d.latitude;
      d.longitude = + d.longitude;
      d.numRatings = + d.numRatings;
      d.num_awards = + d.num_awards;
      d.rating = + d.rating;
      d.success_rate = + d.success_rate;
    });
    //console.log("-> Initial Data: ",data);

    // Set global variables
    globalInitialData = data.filter(function (d) {
      const bookDate = new Date(d.clean_date);
      return(
        bookDate >= new Date("1900-01-01")
      )
      
    });
    globalFilteredData = globalInitialData;

    // Calls drawer functions
    drawLineChart(globalInitialData);
    createStreamGraph(globalInitialData);
    createParallelCoords(globalInitialData);
    createMapChart(globalInitialData);
    // createAreaChart(data);
    // createAreaChart(data);

  })
}
