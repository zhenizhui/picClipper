(function ()  {

  function EventEmitter() {
    this._events = {};
    this._onceEvents = {};
  }

  var proto = EventEmitter.prototype;

  proto.on = function (eventName, callback) {
    if (!eventName || !callback) {
      return;
    }

    var callbacks = this._events[eventName] = this._events[eventName] || [];

    if (callbacks.indexOf(callback) === -1) {
      callbacks.push(callback);
    }

  };

  proto.once = function (eventName, callback) {
    if (!eventName || !callback) {
      return;
    }

    this.on(eventName, callback);

    var callbacks = this._onceEvents[eventName] = this._onceEvents[eventName] || {};

    callbacks[callback] = true;
  };

  proto.off = function (eventName, callback) {
    if (!eventName || !callback) {
      return;
    }
    var callbacks = this._events[eventName];
    var index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
    }
  };

  proto.emit = function (eventName) {
    var events = this._events[eventName];
    var onceEvents = this._onceEvents[eventName];
    var count = 0;
    while (events[count] && count < events.length) {
      var cb = events[count];
      cb();
      if (onceEvents[events[count]]) {
        this.off(eventName, cb);
        delete onceEvents[events[cb]];
        count = 0;
      } else {
        count++;
      }
    }
  };

  if (typeof define === 'function') {
    define(function () {
      return EventEmitter;
    });
    // CommonJS
  } else if (typeof module !== "undefined" && module !== null) {
    module.exports = EventEmitter;
    // window
  } else {
    window.EventEmitter = EventEmitter;
  }

})();