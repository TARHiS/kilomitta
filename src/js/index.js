// vi: et sw=2 fileencoding=utf8

if (!storage.isSet("matkat")) {
  storage.set("matkat", []);
}

if (storage.isSet("matka")) {
  document.location = "matka.html";
}

$("#btn-matka").click(function() {
  storage.set("matka", {
    aloitusaika: new Date(),
    alkulukema: new Number(0),
    loppulukema: new Number(0),
    positions: new Array(),
    pituus: new Number(0),
    selite: "",
    tarkoitus: "",
  });
  document.location = "matka.html";
});

$("#btn-matkat").click(function() {
  document.location = "matkat.html";
});

$("#btn-asetukset").click(function() {
  document.location = "asetukset.html";
});

$("#btn-login").click(function() {
  if (storage.isSet("Google.username")) {
  } else {
    $("#dialog-login").modal("show");
  }
});

$("#dialog-login-btn-login").click(function() {
  $("#dialog-login-btn-login").button('loading');
});

