// vi: et sw=2 fileencoding=utf8
//

$("#input-table").val(option("FusionTable"));
$("#input-min-movement").val(option("min-movement"));
$("#input-position-enable").prop("checked", option("position-enable"));
$("#input-position-frequency").val(option("position-frequency"));

$("#btn-takaisin").click(function(){
  option("FusionTable", $("#input-table").val());
  option("min-movement", $("#input-min-movement").val());
  option("position-enable", $("#input-position-enable").prop("checked"));
  option("position-frequency", $("#input-position-frequency").val());

  document.location = "index.html";
});

$("#btn-reset").click(function(){
  storage.removeAll();
  document.location = "index.html";
});
