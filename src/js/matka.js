// vi: et sw=2 fileencoding=utf8
//

var logged = false;
var showMap = true;
var gMap = null;
var gMark = null;
var updateLocation = null;
var errorLocation = null;
var watchPosition = null;

if (storage.isSet("Google.username")) {
  logged = true;
}

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

function store_int(field) {
  return function (e) {
    var value = $(e.target).val();

    if (value != 0) {
      matka[field] = value;
      storage.set("matka", matka);
    }
  }
}
function store_string(field) {
  return function (e) {
    var value = $(e.target).val();

    matka[field] = value;
    storage.set("matka", matka);
  }
}

$("#input-kilometri-start").change(store_int("alkulukema"));
$("#input-kilometri-end").change(store_int("loppulukema"));
$("#input-kilometri-tarkoitus").change(store_string("tarkoitus"));
$("#input-kilometri-selite").change(store_string("selite"));

$("#btn-asetukset").click(function() {
  document.location = "asetukset.html";
});

$("#btn-lopeta-ei-tallennus").click(function(){
  if (confirm("Oletko varma")) {
    storage.remove("matka");
    document.location = "index.html";
  }
});

$("#btn-lopeta").click(function(){
  if (matka.alkulukema == 0) {
    alert("Syötä alkulukema");
    return;
  }

  if (matka.loppulukema == 0) {
    alert("Syötä loppulukema");
    return;
  }

  if (matka.alkulukema > matka.loppulukema) {
    alert("Loppulukema ei voi olla isompi kuin alkulukema!");
    return;
  }

  //matka.selite = $("#input-kilometri-selite").val();
  //matka.tarkoitus = $("#input-kilometri-tarkoitus").val();
  //matka.alkulukema = $("#input-kilometri-start").val();
  //matka.loppulukema = $("#input-kilometri-end").val();
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


if (logged) {
  google.maps.event.addDomListener(window, 'load', googleMapInitialize);
} else {
  $(".google-map").hide();
}

