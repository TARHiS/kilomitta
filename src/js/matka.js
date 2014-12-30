// vi: et sw=2 fileencoding=utf8
//

var logged = false;
var GPS = false;
var showMap = true;
var gMap = null;
var gMark = null;
var updateLocation = null;
var errorLocation = null;
var watchPosition = null;
var tarkoitukset = [];
var selitteet = [];
var matkat = [];
var matka = storage.get("matka");

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

if(GPS) {
  $("#input-GPS-enable").prop('checked', true);
} else {
  $("#input-GPS-enable").prop('checked', false);
}

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

  // Jos etäisyys edellisestä pisteestä on alle
  // kymmenen metriä, ei tallenneta pistettä.
  if(pituus < option("min-movement")) {
    return;
  }

  matka.positions.push(p);
  matka.pituus += pituus; 
  
  if(GPS) {
    $("#input-kilometri-lukema").val(matka.pituus);
  }

  // Määritetään etäisyydelle oikea yksikkö 
  if(matka.pituus < 1000) {
    $("#span-pituus").text(Math.round(matka.pituus) + "m");
  } else {
    $("#span-pituus").text((Math.round(matka.pituus/100)/10) + "km");
  }


  if (!logged) {
    return;
  }

  var latLng = new google.maps.LatLng(
    parseFloat(p.coords.latitude),
    parseFloat(p.coords.longitude)
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

$("#input-kilometri-tarkoitus").autocomplete({
  source: tarkoitukset,
});

$("#btn-asetukset").click(function() {
  document.location = "asetukset.html";
});

$("#input-GPS-enable").click(function() {
  GPS = !GPS;
  $("#input-kilometri-lukema").val(matka.pituus);
  $("#input-kilometri-lukema").prop('disabled',!$("#input-kilometri-lukema").prop('disabled'))
});

$("#btn-lopeta-ei-tallennus").click(function(){
  if (confirm("Oletko varma")) {
    storage.remove("matka");
    document.location = "index.html";
  }
});

$("#btn-valimatka").click(function() {
  var kmlkm = $("#input-kilometri-lukema").val();

  if (kmlkm < 0) {
    alert("Syötä kilometrilukema!");
    return;
  }

  if (!matka.valimatkat.isEmpty() && (matka.valimatkat.last().kmlkm > kmlkm) ) {
    alert("Kilometri ei voi olla pienempi kuin edellinen lukema!");
    return;
  }

  valimatka = {
    selite: $("#input-kilometri-selite").val(),
    tarkoitus: $("#input-kilometri-tarkoitus").val(),
    kmlkm: $("#input-kilometri-lukema").val(),
    lopetusaika: new Date(),
  }

  appendValimatka(matka.valimatkat.length, valimatka);

  matka.valimatkat.push(valimatka);

  storage.set("matka", matka);
});

$("#valimatkat tbody").on("dblclick", "tr", function(e) {
  var tr = $(e.target).closest("tr");

  var valimatka = matka.valimatkat[tr.data("index")];

  $("#edit-dialog-save").data("index", tr.data("index"));
  $("#edit-dialog-selite").val(valimatka.selite);
  $("#edit-dialog-tarkoitus").val(valimatka.tarkoitus);
  $("#edit-dialog-kmlkm").val(valimatka.kmlkm);

  $("#edit-dialog").modal("show");
});

$("#edit-dialog-save").click(function(e){
  var btn = $(e.target);

  var valimatka = matka.valimatkat[btn.data("index")];
  
  valimatka.selite = $("#edit-dialog-selite").val();
  valimatka.tarkoitus = $("#edit-dialog-tarkoitus").val();
  valimatka.kmlkm = $("#edit-dialog-kmlkm").val();

  matka.valimatkat[btn.data("index")] = valimatka;

  $("#valimatkat tbody").html("");
  $.each(matka.valimatkat, appendValimatka);

  $("#edit-dialog").modal("hide");
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
        (valimatka.selite || "") + "<br>" +
        (valimatka.tarkoitus || "")
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

$.each(matka.valimatkat, appendValimatka);
