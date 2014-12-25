// vi: et sw=2 fileencoding=utf8
//

var matkat = storage.get("matkat").reverse();

function initMatkat() {
$.each(matkat, function(index, matka) {
  $("#matkat tbody").append(
    $("<tr/>").append(
      $("<td/>").html(
        (matka.selite || "") + "<br>" +
        (matka.tarkoitus || "")
      )
    ).append(
      $("<td/>").html(
        moment(matka.aloitusaika).format("DD.MM.YYYY HH:mm") + "<br>" +
        moment(matka.lopetusaika).format("DD.MM.YYYY HH:mm")
      )
    ).append(
      $("<td/>").html(
        matka.alkulukema + "<br>" +
        matka.loppulukema
      )
    ).append(
      $("<td/>").append(
        matka.loppulukema - matka.alkulukema
      ).append(
        $("<button/>", {
          "type": "button",
          "class": "btn btn-default matka-edit pull-right glyphicon glyphicon-edit",
          "data-matka": index,
        })
      )
    )
  );
});
}

$("#btn-takaisin").click(function(){
  document.location = "index.html";
});

$("#matkat tbody").on("click", "button.matka-edit", function (e) {
  var btn = $(e.target);
  var matka = matkat[btn.data("matka")];

  $("#edit-dialog-save").data("matka", btn.data("matka"));
  if (matka.selite) {
    $("#edit-dialog-selite").val(matka.selite);
  }
  if (matka.tarkoitus) {
    $("#edit-dialog-tarkoitus").val(matka.tarkoitus);
  }
  if (matka.alkulukema) {
    $("#edit-dialog-alkulukema").val(matka.alkulukema);
  }
  if (matka.loppulukema) {
    $("#edit-dialog-loppulukema").val(matka.loppulukema);
  }
  $("#edit-dialog").modal("show");
});

$("#edit-dialog-save").click(function(e) {
  var btn = $(e.target);
  var matka = matkat[btn.data("matka")];
  matka.selite = $("#edit-dialog-selite").val();
  matka.tarkoitus = $("#edit-dialog-tarkoitus").val();
  matka.alkulukema = $("#edit-dialog-alkulukema").val();
  matka.loppulukema = $("#edit-dialog-loppulukema").val();

  matkat[btn.data("matka")] = matka;

  storage.set("matkat", matkat);

  $("#matkat tbody").html("");
  initMatkat();
  $("#edit-dialog").modal("hide");
});

initMatkat();
