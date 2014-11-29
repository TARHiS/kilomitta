// vi: et sw=2 fileencoding=utf8
//

var matkat = storage.get("matkat").reverse();

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
      $("<td/>").text(matka.loppulukema - matka.alkulukema)
    )
  )
});

$("#btn-takaisin").click(function(){
  document.location = "index.html";
});
