(function () {
  function read(key, fallback) {
    try {
      var value = localStorage.getItem(key);
      return value === null ? fallback : value;
    } catch (error) {
      return fallback;
    }
  }

  function readJson(key, fallback) {
    var value = read(key, null);
    if (value === null) return fallback;
    try {
      return JSON.parse(value);
    } catch (error) {
      remove(key);
      return fallback;
    }
  }

  function write(key, value) {
    try {
      localStorage.setItem(key, String(value));
      return true;
    } catch (error) {
      return false;
    }
  }

  function writeJson(key, value) {
    try {
      return write(key, JSON.stringify(value));
    } catch (error) {
      return false;
    }
  }

  function remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      return false;
    }
  }

  window.SksirStorage = {
    read: read,
    readJson: readJson,
    write: write,
    writeJson: writeJson,
    remove: remove
  };
}());
