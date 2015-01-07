// vi: et sw=2 fileencoding=utf8
//

var logged = false;
var showMap = true;
var gMap = null;
var gMark = null;
var autoUpdateLukema = true;
var updateLocation = null;
var errorLocation = null;
var watchPosition = null;
var tarkoitukset = [];
var selitteet = [];
var matkat = [];
var matka = storage.get("matka");
var pohjalukema = matka.alkulukema;

if (storage.isSet("matkat")) {
  matkat = storage.get("matkat");
}

$.each(matkat, function (undefined, matka) {
  if (matka.tarkoitus && $.inArray(matka.tarkoitus, tarkoitukset) == -1) {
    tarkoitukset.push(matka.tarkoitus);
  }
  if (matka.selite && $.inArray(matka.selite, selitteet) == -1) {
    selitteet.push(matka.selite);
  }
});

function calcDistance(coords1, coords2) {
  var R = 6371; // km
  var dLat = (coords2.latitude - coords1.latitude).toRad();
  var dLon = (coords2.longitude - coords1.longitude).toRad(); 
  var a = Math.sin(dLat / 2.0) * Math.sin(dLat / 2.0) +
      Math.cos(coords1.latitude.toRad()) * Math.cos(coords2.latitude.toRad()) * 
      Math.sin(dLon / 2.0) * Math.sin(dLon / 2.0); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  var d = R * c;
  return d * 1000;
}

if (storage.isSet("Google.username")) {
  logged = true;
}

if (storage.isSet("showMap")) {
  showMap = storage.get("showMap");
}

$("#input-kilometri-lukema").focus(function(e) {
  autoUpdateLukema = false;
});

$("#input-kilometri-lukema").blur(function(e) {
  // Asetetaan autoUpdateLukema viivellä, jotta #input-kilometri-lukema sisältö ei
  // vaihtuisi heti kun se tulee inaktiiviseksi.
  setTimeout(function() { autoUpdateLukema = true; }, 100);
});

// GPS lukemien päivitysfunktion. Kutsutaan aina kun GPS koordinaatit vaihtuu.
updateLocation = function(p) {
  if (p == null) {
    return;
  }

  $("#span-sijainti").text(
    p.coords.latitude.toFixed(6) +
    "," + p.coords.longitude.toFixed(6) +
    ", acc: " + p.coords.accuracy
  );

  var pituus = 0;
  if (matka.positions.isEmpty()) {
    matka.positions.push(p);
  } else {
    pituus = calcDistance(matka.positions.last().coords, p.coords);
  }

  // Jos etäisyys edellisestä pisteestä on alle asetuksissa
  // säädetyn metrimäärän, ei tallenneta pistettä.
  if(pituus < option("min-movement")) {
    return;
  }

  matka.pituus += pituus;  

  // Määritetään etäisyydelle oikea yksikkö 
  if(matka.pituus < 1000) {
    $("#span-pituus").text(Math.round(matka.pituus) + "m");
  } else {
    $("#span-pituus").text((Math.round(matka.pituus/100)/10) + "km");
  }

  matka.positions.push(p);

  if (autoUpdateLukema) {
    $("#input-kilometri-lukema").val(
      Math.round(pohjalukema + (matka.pituus * matka.virhekerroin)/1000)
    );
  }

  if (!logged) {
    return;
  }

  var latLng = new google.maps.LatLng(
    p.coords.latitude,
    p.coords.longitude
  );

  if (gMark == null) {
    gMark = new google.maps.Circle({
      center: latLng,
      radius: p.coords.accuracy,
    });

    gMark.setMap(gMap);
    gMap.setCenter(latLng);
  } else {
    gMark.setCenter(latLng);
    gMark.setRadius(p.coords.accuracy);
  }
}

errorLocation = function(e) {
  navigator.geolocation.clearWatch(watchPosition);
}

$("#input-kilometri-selite").autocomplete({
  source: selitteet,
});

$("#matka-dialog-selite").autocomplete({
  source: selitteet,
});

$("#matka-dialog-tarkoitus").autocomplete({
  source: tarkoitukset,
});

$("#btn-asetukset").click(function() {
  document.location = "asetukset.html";
});

$("#btn-lopeta-ei-tallennus").click(function(){
  if (confirm("Oletko varma")) {
    storage.remove("matka");
    document.location = "index.html";
  }
});

$("#btn-valimatka").click(function() {
  if (!$("#input-kilometri-lukema").val()) {
    alert("Syötä kilometrilukema!");
    return;
  }

  var kmlkm = parseInt($("#input-kilometri-lukema").val());

  if (!matka.valimatkat.isEmpty()
      && matka.valimatkat.last().kmlkm > kmlkm
      && matka.alkulukema > kmlkm) {
    alert("Kilometri ei voi olla pienempi kuin edellinen lukema!");
    return;
  }

  var valimatka = {
    selite: $("#input-kilometri-selite").val(),
    kmlkm: kmlkm,
    lopetusaika: new Date(),
  }

  appendValimatka(matka.valimatkat.length, valimatka);

  matka.valimatkat.push(valimatka);

  matka.virhekerroin = (kmlkm - matka.alkulukema) / matka.pituus;

  $("#input-kilometri-selite").val("");

  storage.set("matka", matka);  
});

$("#valimatkat tbody").on("dblclick", "tr", function(e) {
  var tr = $(e.target).closest("tr");

  var valimatka = matka.valimatkat[tr.data("index")];

  $("#edit-dialog-save").data("index", tr.data("index"));
  $("#edit-dialog-selite").val(valimatka.selite);
  $("#edit-dialog-kmlkm").val(valimatka.kmlkm);

  $("#edit-dialog").modal("show");
});

$("#edit-dialog-save").click(function(e){
  var btn = $(e.target);

  var valimatka = matka.valimatkat[btn.data("index")];

  valimatka.selite = $("#edit-dialog-selite").val();

  if ($("#edit-dialog-kmlkm").val()) {
    valimatka.kmlkm = parseInt($("#edit-dialog-kmlkm").val());
  }

  matka.valimatkat[btn.data("index")] = valimatka;

  $("#valimatkat tbody").html("");
  $.each(matka.valimatkat, appendValimatka);

  $("#edit-dialog").modal("hide");
});

$("#matka-dialog-save").click(function(e){
  $("#matka-dialog").modal("hide");
});

$("#matka-dialog").on("hide.bs.modal", function (e) {
  matka.selite = $("#matka-dialog-selite").val();
  matka.tarkoitus = $("#matka-dialog-tarkoitus").val();
  matka.alkulukema = parseInt($("#matka-dialog-alkulukema").val());
  matka.loppulukema = parseInt($("#matka-dialog-loppulukema").val());

  pohjalukema = matka.alkulukema;

  if (matka.valimatkat.length > 0) {
    matka.valimatkat[0].kmlkm = matka.alkulukema;
    $("#valimatkat tbody tr:last td:last").text(matka.alkulukema);
  }

  $("#input-kilometri-lukema").val(matka.alkulukema);

  storage.set("matka", matka);

  if ($("#matka-dialog").data("state") == "new") {
    if (!$("#matka-dialog-alkulukema").val()) {
      $("#matka-dialog-alkulukema").closest(".form-group").addClass("has-error");
      return false;
    }

    $("#matka-dialog-h3-uusi").hide();
    $("#matka-dialog-alkulukema").closest(".form-group").removeClass("has-error");
    $("#matka-dialog .modal-footer button.btn-default").show();
  } else if ($("#matka-dialog").data("state") == "end") {
    if (!$("#matka-dialog-alkulukema").val()) {
      $("#matka-dialog-alkulukema").closest(".form-group").addClass("has-error");
      return false;
    }

    $("#matka-dialog-alkulukema").closest(".form-group").removeClass("has-error");

    if (!$("#matka-dialog-loppulukema").val()) {
      $("#matka-dialog-loppulukema").closest(".form-group").addClass("has-error");
      return false;
    }

    $("#matka-dialog-loppulukema").closest(".form-group").removeClass("has-error");
    if (confirm("Haluatko lopettaa?")) {
      var valimatka = {
        selite: "Lopetus",
        kmlkm: matka.loppulukema,
        lopetusaika: new Date(),
      }
      matka.valimatkat.push(valimatka);
      matka.lopetusaika = valimatka.lopetusaika;
      matkat.push(matka);
      storage.set("matkat", matkat);
      storage.remove("matka");
      document.location = "index.html";
    }
  }
});

$("#matka-dialog .modal-footer button.btn-default").click(function(e){
  $("#matka-dialog").data("state", "");
  $("#matka-dialog").modal("hide");
});

$("#btn-matka").click(function(e) {
  $("#matka-dialog-loppulukema").val($("#input-kilometri-lukema").val())
  $("#matka-dialog-h3-paata").show();
  $("#matka-dialog").data("state", "end");
  $("#matka-dialog-save").text("Lopeta");
  $("#matka-dialog").modal("show");
});

$("#btn-kilometri-plus, #btn-kilometri-miinus").click(function (e) {
  var muutos = parseInt($(e.target).closest("button").data("muutos"));

  $("#input-kilometri-lukema").val(
    parseInt($("#input-kilometri-lukema").val()) + muutos
  );
});

$("#btn-keskita").click(function(){
  if (gMark == null) {
    return;
  }

  gMap.setCenter(gMark.getCenter());
  gMap.setZoom(14);
});

$("#btn-map").click(function(){
  showMap = !showMap;

  if (showMap) {
    $(".google-map").show();
    $("#system-menu").addClass("dropup");
  } else {
    $(".google-map").hide();
    $("#system-menu").removeClass("dropup");
  }

  storage.set("showMap", showMap);
});

function appendValimatka(index, valimatka) {
  $("#valimatkat tbody").prepend(
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
    )
  );
}

function googleMapInitialize() {
  if (!showMap) {
    $(".google-map").hide();
    $("#system-menu").removeClass("dropup");
  }

  var paikka = ["61.5", "23.4"];

  if (storage.isSet("viimTunPaikka")) {
    paikka = storage.get("viimTunPaikka").slice(4).split(",");
  }

  var mapOptions = {
    center: new google.maps.LatLng(
      parseFloat(paikka[0]),
      parseFloat(paikka[1])
    ),
    zoom: 14,
  };
  gMap = new google.maps.Map(
    $(".google-map")[0],
    mapOptions
  );

}

if (option("position-enable")) {
  watchPosition = navigator.geolocation.watchPosition(
    updateLocation,
    errorLocation,
    {frequency: option("position-frequency"),
     enableHighAccuracy: true}
  );
}

if (logged) {
  google.maps.event.addDomListener(window, 'load', googleMapInitialize);
} else {
  $(".google-map").hide();
}

$("#matka-dialog .modal-header h3").hide();

if (!matka.valimatkat.isEmpty() && matka.valimatkat[0].kmlkm == -1) {
  $("#matka-dialog-h3-uusi").show();
  $("#matka-dialog").data("state", "new");
  $("#matka-dialog .modal-footer button.btn-default").hide();
  $("#matka-dialog-save").text("Aloita");
  $("#matka-dialog").modal("show");
}

$.each(matka.valimatkat, appendValimatka);

