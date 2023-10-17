const margin = { top: 20, right: 30, bottom: 50, left: 60 },
  width = 600 - margin.left - margin.right,
  height = 400 - margin.top - margin.bottom;

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
  d3.csv("data/clean_books.csv").then(function (data) {
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
    console.log("-> Initial Data: ",data);

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
    drawLineChart2(globalInitialData);
    // createAreaChart(data);
    // createAreaChart(data);
    // createAreaChart(data);

  })
}
