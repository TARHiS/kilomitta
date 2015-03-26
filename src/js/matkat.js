// vi: et sw=2 fileencoding=utf8
//

var matkat = storage.get("matkat") || [];
matkat = matkat.reverse();

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
            "class": "btn btn-default matka-open pull-right glyphicon glyphicon-folder-open",
            "data-matka": index,
          })
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

function appendValimatka(index, valimatka) {
  $("#open-dialog-valimatkat tbody").append(
    $("<tr/>", {"data-index": index}).append(
      $("<td/>").text(
        index + 1
      )
    ).append(
      $("<td/>").html(
        (valimatka.selite || "")
      )
    ).append(
      $("<td/>").text(
        moment(valimatka.lopetusaika).format("DD.MM.YYYY HH:mm")
      )
    ).append(
      $("<td/>").html(
        valimatka.kmlkm
      )
    ).append(
      $("<button/>", {
        "class": "btn btn-link glyphicon glyphicon-edit"
      })
    )
  );
}

$("#btn-takaisin").click(function(){
  document.location = "index.html";
});

$("#matkat tbody").on("click", "button.matka-open", function (e) {
  var btn = $(e.target);
  var matka = matkat[btn.data("matka")];

  $("#open-dialog")
  $("#open-dialog-selite").text(matka.selite || "");
  $("#open-dialog-tarkoitus").text(matka.tarkoitus || "");
  $("#open-dialog-alkulukema").text(matka.alkulukema || "");
  $("#open-dialog-loppulukema").text(matka.loppulukema || "");

  $("#open-dialog-valimatkat tbody").html("");
  $.each(matka.valimatkat, appendValimatka);

  $("#open-dialog").modal("show");
});

$("#matkat tbody").on("click", "button.matka-edit", function (e) {
  var btn = $(e.target);
  var matka = matkat[btn.data("matka")];

  $("#edit-dialog-save").data("matka", btn.data("matka"));
  $("#edit-dialog-selite").val(matka.selite || "");
  $("#edit-dialog-tarkoitus").val(matka.tarkoitus || "");
  $("#edit-dialog-alkulukema").val(matka.alkulukema || "");
  $("#edit-dialog-loppulukema").val(matka.loppulukema || "");
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


  storage.set("matkat", matkat.reverse());

  matkat = storage.get("matkat").reverse();

  $("#matkat tbody").html("");
  initMatkat();
  $("#edit-dialog").modal("hide");
});

initMatkat();
