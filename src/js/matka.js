// vi: et sw=2 fileencoding=utf8
//

var showMap = true;
var gMap = null;
var gMark = null;
var updateLocation = null;
var errorLocation = null;
var watchPosition = null;

if (storage.isSet("showMap")) {
  showMap = storage.get("showMap");
}

var matka = storage.get("matka");

$("#span-aloitusaika").text(moment(matka.aloitusaika).format("DD.MM.YYYY HH:mm"));

updateLocation = function(p) {
  if (p == null) {
    return;
  }

  $("#span-sijainti").text(
    "lat: " + p.coords.latitude +
    ", lng: " + p.coords.longitude
  );

  if (!google) {
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

$("#input-kilometri-start").change(function(e) {
  var value = $(e.target).val();

  if (value != 0) {
    matka.alkulukema = value;
    storage.set("matka", matka);
  }
});

$("#input-kilometri-end").change(function(e) {
  var value = $(e.target).val();

  if (value != 0) {
    matka.loppulukema = value;
    storage.set("matka", matka);
  }
});

$("#btn-asetukset").click(function(){
  document.location = "asetukset.html";
});

$("#btn-matka-lopeta").click(function(){
  if ($("#input-kilometri-start").val() == 0) {
    alert("Syötä alkulukema");
    return;
  }

  if ($("#input-kilometri-end").val() == 0) {
    alert("Syötä loppulukema");
    return;
  }

  matka.alkulukema = $("#input-kilometri-start").val();
  matka.loppulukema = $("#input-kilometri-end").val();
  matka.lopetusaika = new Date();

  var matkat = storage.get("matkat");

  console.log(matkat);
  matkat.push(matka);

  storage.set("matkat", matkat);
  storage.remove("matka");
  document.location = "index.html";
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

watchPosition = navigator.geolocation.watchPosition(
  updateLocation,
  errorLocation,
  {frequency: 60000,
   enableHighAccuracy: true}
);


if (google) {
  google.maps.event.addDomListener(window, 'load', googleMapInitialize);
}

