// vi: et sw=2 fileencoding=utf8
//

$("#input-min-movement").val(option("min-movement"));
$("#input-position-frequency").val(option("position-frequency"));

$("#btn-takaisin").click(function(){
  option("min-movement", $("#input-min-movement").val());
  option("position-frequency", $("#input-position-frequency").val());

  document.location = "index.html";
});

$("#btn-reset").click(function(){
  storage.removeAll();
  document.location = "index.html";
});
