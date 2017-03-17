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
  function dragable(el, config) {
    this.el = el;
    this.config = config;
    this.isDrag = false;
    this.containerEl = this.config.container;
    this.offset = {x: 0, y: 0};
    this.init();
    this.bindEvent();
  }

  var proto = dragable.prototype = Object.create(EventEmitter.prototype);

  proto.handleEvent = function (event) {
    var method = 'on' + event.type;
    if (this[method]) {
      this[method](event);
    }
  };

  proto.init = function () {
    var positionStyle = this.getStyle('position');
    if (positionStyle === 'static' || positionStyle === 'fixed') {
      this.el.style.position = 'relative';
    }
    if (this.containerEl) {
      this.boundaryX = this.containerEl.getBoundingClientRect().width - this.el.getBoundingClientRect().width;
      this.boundaryY = this.containerEl.getBoundingClientRect().height - this.el.getBoundingClientRect().height;
    }
  };

  /**
   * @description get element's style by style name
   * @param styleName
   * @return {string}
   */
  proto.getStyle = function (styleName, flag) {
    var str = getComputedStyle(this.el).getPropertyValue(styleName);
    return flag ? parseInt(str.slice(0, -2)) : str;
  };

  /**
   * @description bind native event
   */
  proto.bindEvent = function () {
    var eventList = ['mousedown', 'mousemove', 'mouseup'];

    eventList.forEach(function (eventName) {
      this.el.addEventListener(eventName, this);
    }, this);
  };

  /**** native event ↓ ****/

  proto.onmousedown = function (event) {
    this.dragStar(event);
    event.stopPropagation();
  };

  proto.onmousemove = function (event) {
    // console.log('mousemove on el');
    this.dragMove(event);
  };

  proto.onmouseup = function (event) {
    // console.log('mouseup');
    this.dragEnd(event);
  };

  /**** native event ↑ ****/

  /**** drag event ↓ ****/

  proto.dragStar = function (event) {
    this.isDrag = true;
    //var rect = this.el.getBoundingClientRect();
    this.offset.x = event.clientX - this.el.offsetLeft;
    this.offset.y = event.clientY - this.el.offsetTop;
  };

  proto.dragMove = function (event) {
    if (this.isDrag) {
      var left = event.clientX - this.offset.x;
      var top = event.clientY - this.offset.y;
      if (this.containerEl) {
        var containerBoundingLeft = this.containerEl.getBoundingClientRect().left;
        var containerBoundingTop = this.containerEl.getBoundingClientRect().top;
        if (left < this.boundaryX && top < this.boundaryY &&
          left >= containerBoundingLeft && top >= containerBoundingTop) {
          this.el.style.left = left + 'px';
          this.el.style.top = top + 'px';
        }
      } else {
        this.el.style.left = left + 'px';
        this.el.style.top = top + 'px';
      }
    }
  };

  proto.dragEnd = function (event) {
    this.isDrag = false;
  };

  /**** drag event ↑ ****/

  if (typeof define === 'function') {
    define(function () {
      return dragable;
    });
    // CommonJS
  } else if (typeof module !== "undefined" && module !== null) {
    module.exports = dragable;
    // window
  } else {
    window.dragable = dragable;
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

  var proto = Clipper.prototype = Object.create(dragable.prototype);

  proto.init = function () {
    this.initDom();
    this.initPic();
    this.initEvent();
  };

  proto.initDom = function () {
    var _this = this;
    this.displayEl.innerHTML = '<canvas id="pic-canvas"></canvas><div class="clipper-div" id="clipperDiv" ></div>';
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
      '<div id="dot-8" class="dot lm"></div>' +
      '<span class="guide-line-1"></span>' +
      '<span class="guide-line-2"></span>';

    dragDiv.style.display = 'none';
    this.dragDivEl = $('#dragDiv');
    this.clipperDivEl = $('#clipperDiv');
  };

  proto.initPic = function () {
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
  };

  proto.initEvent = function () {
    var _this = this;
    var moveDragDiv = false;
    var drag = false;
    var dragDivObj = {};
    var containerEl = document.querySelector('#clipperDiv');
    this.clipperDivEl.addEventListener('mousedown', mouseDownHandler);
    this.clipperDivEl.addEventListener('mousemove', mouseMoveHandler);
    function mouseDownHandler(e) {
      console.log('clipperDivEl mousedown');
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
    function mouseMoveHandler(e) {
      e.stopPropagation();
      if (drag) {
        //console.log('move: drag = ' + drag + ', moveDragDiv = ' + moveDragDiv);
        _this.dragDivEl.style.width = e.clientX - dragDivObj.startX + 'px';
        _this.dragDivEl.style.height = e.clientY - dragDivObj.startY + 'px';
      }
    }

    this.clipperDivEl.addEventListener('mouseup', function (e) {
      drag = false;
      moveDragDiv = false;
    });
    new dragable(this.dragDivEl, {
      container: containerEl
    });
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