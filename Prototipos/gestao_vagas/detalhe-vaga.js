document.querySelectorAll("[data-detail-tab]").forEach(function (button) {
  button.addEventListener("click", function () {
    var tab = button.getAttribute("data-detail-tab");

    document.querySelectorAll("[data-detail-tab]").forEach(function (item) {
      item.classList.toggle("sl-tab-active", item === button);
    });

    ["resumo", "candidatos", "dados", "historico", "admissoes"].forEach(function (name) {
      document.getElementById("tab" + name.charAt(0).toUpperCase() + name.slice(1)).classList.toggle("sl-hidden", name !== tab);
    });
  });
});
