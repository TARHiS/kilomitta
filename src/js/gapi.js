// vi: et sw=2 fileencoding=UTF-8
// gapi-fusiontables.js
//

function gAPI(gapi, storage, base, libname, libversion) {
  var self = this;

  self.responseCache = {};
  self.gapi = gapi;
  self.base = base;
  self.libname = libname;
  self.libversion = libversion;
  self.cacheName = "gAPI." + base + ".responseCache";
  self.reloginNeeded = false;
  self.storage = storage;
  self.callCount = 0;

  if (self.storage.isSet(self.cacheName)) {
    self.responseCache = self.storage.get(self.cacheName);
  }
}

gAPI.prototype.getF = function (base, functionName) {
  var self = this;

  var b = base;
  var functionList = functionName.split(".");

  for (var i = 0; i < functionList.length; i++) {
    b = b[functionList[i]];
  }

  return b;
};

gAPI.prototype.cacheKey = function (obj) {
  return JSON.stringify(obj);
};

gAPI.prototype.cacheClear = function () {
  var self = this;

  self.responseCache = {};

  if (self.storage.isSet(self.cacheName)) {
    self.storage.remove(self.cacheName);
  }
};

gAPI.prototype.call = function (
  functionName,
  params,
  useCache,
  callback
) {
  var self = this;
  var cacheKey = undefined;
  self.callCount = self.callCount + 1;

  console.log("Call (" + self.callCount + "): " + self.base + "." + functionName);
  console.log(params);
  console.log(useCache);
  console.log(callback);

  if (useCache) {
    cacheKey = self.cacheKey(params);
  }

  if (self.responseCache[cacheKey]) {
    console.log("Cached response (" + self.callCount + "): " + self.base + "." + functionName);
    console.log(self.responseCache[cacheKey]);

    if (callback) {
      callback(self.responseCache[cacheKey]);
    }
    return;
  }

  gapi.client.load(self.libname, self.libversion, (function (requestID) {
  return function() {
    var request = self.getF(
      self.gapi,
      self.base + "." + functionName
    )(params);

    request.execute( function (resp) {
        console.log("Reponse (" + requestID + "): " + self.base + "." + functionName);
        console.log(resp);
        if (resp.data && resp.data[0].reason == "authError") {
          self.reloginNeeded = true;
        }

        if (useCache) {
          self.responseCache[cacheKey] = resp;
          self.storage.set(self.cacheName, self.responseCache);
        }

        if (callback) {
          callback(resp);
        }
    });
  }}(self.callCount)));
};


function gFusionTables (gapi, storage) {
  var self = this;

  gAPI.call(self, gapi, storage, "client.fusiontables", "fusiontables", "v2");
}

gFusionTables.prototype = Object.create(gAPI.prototype);

gFusionTables.prototype.sql = function (sql, callback) {
  var self = this;

  self.call("query.sql", {sql: sql}, false, callback);
};

gFusionTables.prototype.sql_c = function (sql, callback) {
  var self = this;

  self.call("query.sql", {sql: sql}, true, callback);
};

gFusionTables.prototype.tableInsert = function (table, values, callback) {
  var self = this;

  var keyvalues = Object.keys(values);
  var sql_keys = "";
  var sql_values = "";

  $.each(keyvalues, function (index, key) {
    var value = values[key];

    sql_keys += key;

    if (typeof value == "string") {
      sql_values += "'" + value + "'";
    } else {
      sql_values += value;
    }

    if (keyvalues.length - 1 != index) {
      sql_keys += ",";
      sql_values += ",";
    }
    sql_keys += " ";
    sql_values += " ";

  });

  var sql = "INSERT INTO " + table + " (" + sql_keys +
            ") VALUES (" + sql_values + ")";

  self.sql(sql, callback);
};

gFusionTables.prototype.tableList = function (callback) {
  var self = this;

  self.call("table.list", {}, false, callback);
};

gFusionTables.prototype.tableCreate = function (name, columns, callback) {
  var self = this;

  self.call("table.insert", {
    name: name,
    columns: columns,
    isExportable: true,
  }, false, callback);
};


function gPlus (gapi, storage) {
  var self = this;

  gAPI.call(
    self,
    gapi,
    storage,
    "client.plus", // gapi base
    "plus", // Libname
    "v1" // libversion
  );
}

gPlus.prototype = Object.create(gAPI.prototype);

