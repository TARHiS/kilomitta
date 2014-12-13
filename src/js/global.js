// vi: et sw=2 fileencoding=UTF-8

var storage = $.localStorage;

if (!Array.prototype.last) {
  Array.prototype.last = function() {
      return this[this.length - 1];
  };
};

if (!Array.prototype.isEmpty) {
  Array.prototype.isEmpty = function() {
    return this.length == 0;
  };
};

if (!Number.prototype.toRad) {
  Number.prototype.toRad = function() {
    return this * Math.PI / 180;
  };
};
