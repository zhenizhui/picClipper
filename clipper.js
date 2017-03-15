(function () {

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

(function () {

  function $(elStr) {
    return document.querySelector(elStr);
  }

  function Clipper(config) {
    this.el = $(config.el);
    this.displayEl = $(config.displayEl);
    this.dragDivEl = null;
    this.clipperDivEl = null;
  }

  Clipper.prototype = {
    init: function () {
      this.initDom();
      this.initPic();
      this.initEvent();
    },
    initDom: function () {
      var _this = this;
      this.displayEl.innerHTML = '<canvas id="pic-canvas"></canvas><div class="clipper-div" id="clipperDiv"></div>';
      var dragDiv = document.createElement('div');
      dragDiv.id = 'dragDiv';
      const clipperDiv = document.querySelector('.clipper-div');
      clipperDiv.appendChild(dragDiv);
      dragDiv.innerHTML =
        '<div id="dot-1" class="dot lt"></div>' +
        '<div id="dot-2" class="dot tm"></div>' +
        '<div id="dot-3" class="dot rt"></div>' +
        '<div id="dot-4" class="dot rm"></div>' +
        '<div id="dot-5" class="dot rb"></div>' +
        '<div id="dot-6" class="dot bm"></div>' +
        '<div id="dot-7" class="dot bl"></div>' +
        '<div id="dot-8" class="dot lm"></div>' ;
      /*
      * '<span class="guide-line-1"></span>' +
       '<span class="guide-line-2"></span>';
      * */
      dragDiv.style.display = 'none';
      this.dragDivEl = $('#dragDiv');
      this.clipperDivEl = $('#clipperDiv');
    },
    initPic: function () {
      var fileReader = new FileReader();
      this.el.addEventListener('change', function (e) {
        var tgt = e.target || window.event.srcElement,
          files = tgt.files;
        fileReader.onload = function () {
          var canvas = document.getElementById("pic-canvas");
          var cxt = canvas.getContext("2d");
          var img = new Image();
          var clipperDiv = $('.clipper-div');
          img.src = fileReader.result;
          cxt.canvas.width = img.width;
          cxt.canvas.height = img.height;
          cxt.drawImage(img, 0, 0);
          clipperDiv.style.width = img.width + 'px';
          clipperDiv.style.height = img.height + 'px';
        };
        fileReader.readAsDataURL(files[0]);
      });
    },
    initEvent: function () {
      var _this = this;
      var moveDragDiv = false;
      var drag = false;
      var dragDivObj = {};
      this.clipperDivEl.addEventListener('mousedown', mouseDownHandler);
      function mouseDownHandler(e) {
        if (e.target.id === 'dragDiv') {
          console.log('start 拖动dragDiv');
          moveDragDiv = true;
          drag = false;
          dragDivObj.startX = e.clientX;
          dragDivObj.startY = e.clientY;
        } else if (e.target.id === 'clipperDiv'){
          dragDiv.style.display = 'block';
          var reduceX = 0;
          var reduceY = 0;
          var temp = dragDiv.offsetParent;
          while (temp) {
            reduceX += temp.offsetLeft;
            reduceY += temp.offsetTop;
            temp = temp.offsetParent;
          }
          drag = true;
          moveDragDiv = false;
          dragDivObj.startX = e.clientX;
          dragDivObj.startY = e.clientY;
          _this.dragDivEl.style.left = (dragDivObj.startX - reduceX) + 'px';
          _this.dragDivEl.style.top = (dragDivObj.startY - reduceY) + 'px';
          _this.dragDivEl.style.background = '#fff';
        }
      }
      this.clipperDivEl.addEventListener('mousemove', mouseMoveHandler);
      function mouseMoveHandler(e) {
        if (drag) {
          console.log('move: drag = ' + drag + ', moveDragDiv = ' + moveDragDiv);
          _this.dragDivEl.style.width = e.clientX - dragDivObj.startX + 'px';
          _this.dragDivEl.style.height = e.clientY - dragDivObj.startY + 'px';
        }
        // 如果点击的地方是dragDiv 以为着要拖动dragDiv
        if (moveDragDiv) {
          console.log('move: drag = ' + drag + ', moveDragDiv = ' + moveDragDiv);
          // 处理 相加，字符串转数字
          var topNum = dragDiv.style.top.slice(0,-2);
          var leftNum = dragDiv.style.left.slice(0,-2);
          _this.dragDivEl.style.top = Number(topNum) + (e.clientY - Number(topNum)) + 'px';
          _this.dragDivEl.style.left = Number(leftNum) + (e.clientX - Number(leftNum)) + 'px';
        }
      }
      this.clipperDivEl.addEventListener('mouseup', function (e) {
        drag = false;
        moveDragDiv = false;
      });
    }
  };
  if (typeof define === 'function') {
    define(function () {
      return Clipper;
    });
    // CommonJS
  } else if (typeof module !== "undefined" && module !== null) {
    module.exports = Clipper;
    // window
  } else {
    window.Clipper = Clipper;
  }
})();