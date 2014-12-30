// vi: et sw=2 fileencoding=UTF-8

var storage = $.localStorage;

var default_values = {
  "min-movement": 100, // meter
  "position-enable": true,
  "position-frequency": 60000, // ms
}

function option(name, value) {
  if (value != undefined) {
    storage.set(name, value);
  }

  if (storage.isSet(name)) {
    return storage.get(name);
  }

  return default_values[name];
}

if (!Array.prototype.last) {
  Array.prototype.last = function() {
    return this[this.length - 1];
  };
}

if (!Array.prototype.isEmpty) {
  Array.prototype.isEmpty = function() {
    return this.length == 0;
  };
}

if (!Number.prototype.toRad) {
  Number.prototype.toRad = function() {
    return this * Math.PI / 180;
  };
}
