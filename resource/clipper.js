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
(function () {
  function dragable(el, config) {
    // 拖拽元素
    this.el = el;
    // 此刻是否拖动
    this.isDrag = false;
    // 有无父元素，有的话则限制在父元素内部活动
    this.containerEl = config.container;
    // 如果限制在父元素里面的话，纪录限制的范围
    this._max = {};
    //记录鼠标相对拖放对象的横坐标
    this._x = 0;
    //记录鼠标相对拖放对象的纵坐标
    this._y = 0;
    // 纪录marginLeft
    this._marginLeft = 0;
    // 纪录marginTop
    this._marginTop = 0;
    // 初始化
    this.init();
  }

  var proto = dragable.prototype = Object.create(EventEmitter.prototype);

  proto.handleEvent = function (event) {
    var method = 'on' + event.type;
    if (this[method]) {
      this[method](event);
    }
  };

  proto.init = function () {
    var positionStyle = getComputedStyle(this.el).getPropertyValue('margin-left');
    if (positionStyle === 'static' || positionStyle === 'fixed') {
      this.el.style.position = 'relative';
    }
    this.el.addEventListener('mousedown', this);

  };

  /**
   * @description bind native event
   */
  proto.bindEvent = function () {
    var eventList = ['mousemove', 'mouseup'];

    eventList.forEach(function (eventName) {
      document.addEventListener(eventName, this);
    }, this);

    this._boundPointerEvents = eventList;
  };

  proto.unbindEvent = function() {
    if ( !this._boundPointerEvents ) {
      return;
    }
    this._boundPointerEvents.forEach( function( eventName ) {
      document.removeEventListener( eventName, this );
    }, this );

    delete this._boundPointerEvents;
  };
  /**** native event ↓ ****/

  proto.onmousedown = function (event) {
    // 防止冒泡到clipperdiv
    event.stopPropagation();
    console.log('%c drag', 'background: #222; color: #bada55', 'mousedown');
    if (event.target == this.el) {
      this.bindEvent();
      this.dragStar(event);
    } else {
      return;
    }
  };

  proto.onmousemove = function (event) {
    //console.log('%c drag', 'background: #222; color: #bada55', 'mousemove');
    this.dragMove(event);
  };

  proto.onmouseup = function (event) {
    //console.log('%c drag', 'background: #222; color: #bada55', 'mouseup');
    this.dragEnd(event);
  };

  /**** native event ↑ ****/

  /**** drag event ↓ ****/

  proto.dragStar = function (event) {
    this.isDrag = true;
    this._x = event.clientX - this.el.offsetLeft;
    this._y = event.clientY - this.el.offsetTop;
    //this._marginLeft = parseInt(getComputedStyle(this.containerEl).getPropertyValue('margin-left'));
    //this._marginTop = parseInt(getComputedStyle(this.containerEl).getPropertyValue('margin-top'));
  };

  proto.dragMove = function (event) {
    if (this.isDrag) {
      var left = event.clientX - this._x;
      var top = event.clientY - this._y;
      if (this.containerEl) {
        var containerBoundingLeft = this.containerEl.getBoundingClientRect().left;
        var containerBoundingTop = this.containerEl.getBoundingClientRect().top;
        var containerBoundingWidth = this.containerEl.getBoundingClientRect().width;
        var containerBoundingHeight = this.containerEl.getBoundingClientRect().height;
        var elBoundingWidth = this.el.getBoundingClientRect().width;
        var elBoundingHeight = this.el.getBoundingClientRect().height;
        var displayEl = document.querySelector('.display');
        var containerLeft = displayEl.style.left == "" ? 0 : parseInt(displayEl.style.left);
        var c1 = left + containerLeft >= containerBoundingLeft;
        var c2 = left + elBoundingWidth <= containerBoundingWidth;
        //var c2 = left + elBoundingWidth <= containerBoundingLeft;
        var c3 = top >= containerBoundingTop;
        var c4 = top + elBoundingHeight <= containerBoundingTop + containerBoundingHeight;
        console.log('c1= ' + c1+'c2= ' + c2+'c3= ' + c3+'c4= ' + c4);
        var moveCondition = c1 && c2 && c3 && c4;
        if (moveCondition) {
          this.el.style.left = left + 'px';
          this.el.style.top = top + 'px';
        }
      } else {
        this.el.style.left = left + 'px';
        this.el.style.top = top + 'px';
      }
    }
  };

  proto.dragEnd = function () {
    this.isDrag = false;
    this.unbindEvent();
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
    this.fileInputEl = $(config.fileInputEl);
    this.displayEl = $(config.displayEl);
    this.dragDivEl = null;
    this.clipperDivEl = null;
    this.imgObj = null;
  }

  var proto = Clipper.prototype; //= Object.create(dragable.prototype);

  proto.init = function () {
    this.initDom();
    this.initPic();
    this.initEvent();
  };

  proto.initDom = function () {
    var that = this;
    this.displayEl.innerHTML = '<canvas id="pic-canvas"></canvas><div class="clipper-div" id="clipperDiv" ></div>';
    var dragDiv = document.createElement('div');
    dragDiv.id = 'dragDiv';
    const clipperDiv = document.querySelector('.clipper-div');
    clipperDiv.appendChild(dragDiv);
    dragDiv.innerHTML =
      '<div id="dot-5" class="dot rb"></div>';
    /*'<span class="guide-line-1"></span>' +
     '<span class="guide-line-2"></span>';*/

    dragDiv.style.display = 'none';
    this.dragDivEl = $('#dragDiv');
    this.clipperDivEl = $('#clipperDiv');
  };

  proto.initPic = function () {
    var that = this;
    var fileInputEl = this.fileInputEl;
    fileInputEl.addEventListener('change', function () {
      if ((!fileInputEl) && (fileInputEl.type !== 'file')) {
        console.error('you need a input element which type is file!');
        return;
      }
      var fileReader = new FileReader();
      fileReader.onload = function (e) {
        var canvas = document.getElementById("pic-canvas");
        var cxt = canvas.getContext("2d");
        var img = new Image();
        var clipperDiv = $('.clipper-div');
        img.src = e.target.result;
        that.imgObj = img;
        img.onload = function () {
          cxt.canvas.width = img.width;
          cxt.canvas.height = img.height;
          cxt.drawImage(img, 0, 0);
          clipperDiv.style.width = img.width + 'px';
          clipperDiv.style.height = img.height + 'px';
        };

      };
      fileReader.readAsDataURL(this.files[0]);
    });
  };

  proto.initEvent = function () {
    this.initDrawEvent();
    this.initResize();
  };

  proto.initDrawEvent = function () {
    var that = this;
    var drag = false;
    var dragDivObj = {};
    var mouseMoveHandler = null;
    this.clipperDivEl.addEventListener('mousedown', drawDownHandler);
    document.addEventListener('mouseup', drawEndHandler);
    function drawDownHandler(e) {
      var maxWidth = parseInt(that.clipperDivEl.style.width);
      var maxHeight = parseInt(that.clipperDivEl.style.height);
      console.log('clipperDivEl mousedown');
      var dragDiv = $('#dragDiv');
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
      dragDivObj.startX = e.clientX;
      dragDivObj.startY = e.clientY;
      that.dragDivEl.style.left = (dragDivObj.startX - reduceX) + 'px';
      that.dragDivEl.style.top = (dragDivObj.startY - reduceY) + 'px';
      that.dragDivEl.style.background = '#fff';
      document.addEventListener('mousemove', drawMoveHandler);
      function drawMoveHandler(e) {
        console.log('document draw move');
        if (drag) {
          var width = e.clientX - dragDivObj.startX;
          var height = e.clientY - dragDivObj.startY;
          // 拖动的时候，有边界的限制
          width = width + that.dragDivEl.offsetLeft >= maxWidth ? maxWidth - that.dragDivEl.offsetLeft : width;
          height = height + that.dragDivEl.offsetTop >= maxHeight ? maxHeight - that.dragDivEl.offsetTop : height;
          that.dragDivEl.style.width = width + 'px';
          that.dragDivEl.style.height = height + 'px';
        }
      }

      mouseMoveHandler = drawMoveHandler;
    }
    function drawEndHandler(e) {
      drag = false;
      //console.log('remove draw mousemove');
      document.removeEventListener('mousemove', mouseMoveHandler);
    }

    new dragable(this.dragDivEl, {
      container: this.clipperDivEl
    });
  };

  proto.initResize = function () {
    var that = this;
    var startResizePos = {x: 0, y: 0};
    var dot = document.getElementsByClassName('dot');
    var mousemoveFValue = null; //解绑document mousemove
    var mousemdownFValue = null; //解绑element mousedown
    Array.prototype.forEach.call(dot, function (el) {
      el.addEventListener('mousedown', resizeStart);
      document.addEventListener('mouseup', resizeEnd);
    });

    mousemdownFValue = resizeStart;
    // 调整大小开始
    function resizeStart(e) {
      e.stopPropagation();
      var dragDivEl = that.dragDivEl;
      // 调整开始前的宽度
      var startWidth = dragDivEl.offsetWidth;
      // 调整开始前的高度
      var startHeight = dragDivEl.offsetHeight;
      // 拖拽哪个点开始调整
      var whichDot = e.target.classList[1];
      // 拖动最大的宽度
      var maxWidth = parseInt(that.clipperDivEl.style.width);
      // 拖动最大的高度
      var maxHeight = parseInt(that.clipperDivEl.style.height);
      startResizePos.x = e.clientX;
      startResizePos.y = e.clientY;
      //console.log('startResizePos = ' + startResizePos.x + ' / ' + startResizePos.y);
      document.addEventListener('mousemove', resizing);
      function resizing(e) {
        var moveX = e.clientX - startResizePos.x;
        var moveY = e.clientY - startResizePos.y;
        // 拖动之后的宽度
        var width = startWidth + moveX;
        // 拖动之后的高度
        var height = startHeight + moveY;
        var oppositeWidth = startWidth - moveX;
        var oppositeHeight = startHeight - moveY;
        // 调整的时候有个边界的限制
        width = width + that.dragDivEl.offsetLeft > maxWidth ? maxHeight - that.dragDivEl.offsetLeft : width;
        height = height + that.dragDivEl.offsetTop > maxHeight ? maxHeight - that.dragDivEl.offsetTop : height;
        //console.log('width: ' + width + ' ' + 'height: ' + height);
        switch (whichDot) {
          // 左上角
          case 'lt':
            break;
          // 顶边中点
          case 'tm':
            break;
          // 右上角
          case 'rt':
            break;
          // 右边中点
          case 'rm':
            break;
          // 右下角
          case 'rb':
            that.resizeDrawDiv(width, height);
            break;
          // 底边中点
          case 'bm':
            break;
          // 左下角
          case 'bl':
            break;
          // 左边边中点
          case 'lm':
            break;
          default:
            console.log('不是调整的节点');
        }
      }
      mousemoveFValue = resizing;
    }

    // 调整大小结束
    function resizeEnd() {
      //console.log('resize End remove document.mousemove');
      document.removeEventListener('mousemove', mousemoveFValue);
      //mousemoveFValue = null;
      //mousemdownFValue = null;
    }
  };

  proto.resizeDrawDiv = function (w, h) {
    var dragDivEl = $('#dragDiv');
    dragDivEl.style.width = w + 'px';
    dragDivEl.style.height = h + 'px';
  };
  /**
   * @description 将截取好的图片保存为本地文件
   */
  proto.saveToNewImg = function () {
    // 新截图需要的参数
    var newImgParam = {};
    var imgObj = this.imgObj;
    var dragDiv = this.dragDivEl;
    var canvas = document.createElement('canvas');
    var canvasCtx = canvas.getContext('2d');

    newImgParam.x = parseInt(dragDiv.style.left);
    newImgParam.y = parseInt(dragDiv.style.top);
    newImgParam.width = parseInt(dragDiv.style.width);
    newImgParam.height = parseInt(dragDiv.style.height);
    canvas.width = newImgParam.width;
    canvas.height = newImgParam.height;
    canvasCtx.drawImage(imgObj, newImgParam.x, newImgParam.y, newImgParam.width, newImgParam.height, 0, 0, newImgParam.width, newImgParam.height);
    window.open(canvas.toDataURL("image/png"));
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