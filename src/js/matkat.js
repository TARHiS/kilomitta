// vi: et sw=2 fileencoding=utf8
//

var matkat = storage.get("matkat");

$.each(matkat, function(index, matka) {
  $("#matkat tbody").append(
    $("<tr/>").append(
    ).append(
      $("<td/>").text(moment(matka.aloitusaika).format("DD.MM.YYYY HH:mm"))
    ).append(
      $("<td/>").text(moment(matka.lopetusaika).format("DD.MM.YYYY HH:mm"))
    ).append(
      $("<td/>").text(matka.alkulukema)
    ).append(
      $("<td/>").text(matka.loppulukema)
    ).append(
      $("<td/>").text(matka.loppulukema - matka.alkulukema)
    )
  )
});

$("#btn-takaisin").click(function(){
  document.location = "index.html";
});
