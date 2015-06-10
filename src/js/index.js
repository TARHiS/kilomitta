// vi: et sw=2 fileencoding=utf8

var gft = null;

var clientId = "219446210629-nnv2on8b1nkupet7h0cpo6e1l35rcq7p.apps.googleusercontent.com";
var apiKey = "AIzaSyCx3TPoZiGdCcipmGUSIA8h_Zb_3p3wxyg";

var scopes = [
  "https://www.googleapis.com/auth/fusiontables",
];
var kilomittaColumns = [
  {"name": "Aloitusaika", "type": "DATETIME",},
  {"name": "Lopetusaika", "type": "DATETIME",},
  {"name": "Selite", "type": "STRING",},
  {"name": "Tarkoitus", "type": "STRING",},
  {"name": "Alkulukema", "type": "NUMBER",},
  {"name": "Loppulukema", "type": "NUMBER",},
  {"name": "Matka", "type": "NUMBER",},
];
var table = null;

if (storage.isSet("FusionTable")) {
  table = storage.get("FusionTable");
}

if (!storage.isSet("matkat")) {
  storage.set("matkat", []);
}

if (storage.isSet("matka")) {
  document.location = "matka.html";
}

$("#btn-matka").click(function() {
  storage.set("matka", {
    aloitusaika: new Date(),
    alkulukema: new Number(-1),
    loppulukema: new Number(0),
    valimatkat: [{
      selite: new String("Aloitus"),
      kmlkm: new Number(-1),
      lopetusaika: new Date(),
    }],
    positions: new Array(),
    virhekerroin: new Number(1),
    kmlkm: new Number(0),
    pituus: new Number(0),
    selite: new String(),
    tarkoitus: new String(),
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
  checkAuth(false);
});

$("#btn-laheta").click(function() {
  FusionTableSend()
});

$("#dialog-login-btn-login").click(function() {
  $("#dialog-login-btn-login").button('loading');
});

$("#dialog-table-select .modal-body").on("click", "button", function(e) {
  var btn = $(e.target);

  if (btn.data("action") == "create") {
    FusionTableCreateNew();
  } else if (btn.data("action") == "open") {
    table = btn.data("table-id");
    storage.set("FusionTable", table);
  }

  $("#dialog-table-select").modal("hide");
});

function loadGoogleApi() {
  gapi.client.setApiKey(apiKey);
  gft = new gFusionTables(gapi, storage);

  $("#btn-login").prop("disabled", false);

  checkAuth(true);
}

function checkAuth(immediate) {
  gapi.auth.authorize({
    client_id: clientId,
    scope: scopes,
    immediate: immediate,
  }, handleAuthResult);
}

function handleAuthResult(authResult) {
  if (authResult && !authResult.error) {
    initFusionTables();
    $("#btn-login").hide();
    $("#btn-laheta").show();
  } else {
    $("#btn-login").show();
    $("#btn-laheta").hide();
    alert("Fail");
  }
}

function initFusionTables() {
  if (!table) {
    $("#dialog-table-select").modal("show");
    FusionTableTableList();
  }
}

function FusionTableCreateNew() {
  gft.tableCreate(
    "Kilomitta", kilomittaColumns,
  function (resp) {
    table = resp.tableId;
    storage.set("FusionTable", table);
  });
}

function isKilomittaCompatible(tableDesc) {
  var loytyi = false;

  $.each(kilomittaColumns, function (undefined, col) {
    loytyi = false;

    $.each(tableDesc.columns, function (undefined, tmp) {
      if (col.name == tmp.name && col.type == tmp.type) {
        loytyi = true;
        return false;
      }
    });

    if (!loytyi) {
      return false
    }
  });

  return loytyi;
}

function FusionTableTableList() {
  gft.tableList(function(resp) {
    $.each(resp.items, function(index, item) {
      if (isKilomittaCompatible(item)) {
        $("#dialog-table-select .modal-body").prepend($("<button/>", {
          class: "btn btn-primary btn-block btn-lg",
          "data-action": "open",
          "data-table-id": item.tableId,
        }).text(item.name));
      }
    });
  });
}

function FusionTableSend() {
  var matkat = storage.get("matkat");

  $.each(matkat, function (index, matka) {
    if (matka.lahetetty) {
    } else {
      matka.lahetetty = new Date();

      gft.tableInsert(
        table, {
          "Aloitusaika": moment(
            matka.aloitusaika).format("YYYY-MM-DDTHH:mm:ss"),
          "Lopetusaika": moment(
            matka.lopetusaika).format("YYYY-MM-DDTHH:mm:ss"),
          "Selite": matka.selite,
          "Tarkoitus": matka.tarkoitus,
          "Alkulukema": matka.alkulukema,
          "Loppulukema": matka.loppulukema,
          "Matka": matka.loppulukema - matka.alkulukema,
        },
      function (resp) {
      });
    }
  });

  storage.set("matkat", matkat);
}

