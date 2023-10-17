function showSidebar(e) {
  e.preventDefault();
  var sidebar = document.querySelector(".sidebar");
  sidebar.classList.remove("hide");
  sidebar.classList.add("show");
}

function hideSidebar(e) {
  e.preventDefault();
  var sidebar = document.querySelector(".sidebar");
  sidebar.classList.remove("show");
  sidebar.classList.add("hide");
}
