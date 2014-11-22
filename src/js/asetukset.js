// vi: et sw=2 fileencoding=utf8
//


$("#btn-takaisin").click(function(){
  document.location = "index.html";
});

$("#btn-reset").click(function(){
  storage.removeAll();
  document.location = "index.html";
});
