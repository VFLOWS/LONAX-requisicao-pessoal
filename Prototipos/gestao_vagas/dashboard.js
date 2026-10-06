document.querySelectorAll("[data-dashboard-view]").forEach(function (button) {
  button.addEventListener("click", function () {
    var view = button.getAttribute("data-dashboard-view");

    document.querySelectorAll("[data-dashboard-view]").forEach(function (item) {
      item.classList.toggle("sl-tab-active", item === button);
    });

    document.getElementById("dashboardList").classList.toggle("sl-hidden", view !== "list");
    document.getElementById("dashboardKanban").classList.toggle("sl-hidden", view !== "kanban");
  });
});
