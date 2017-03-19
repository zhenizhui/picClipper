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
    event.stopPropagation();
    this.dragStar(event);
  };

  proto.onmousemove = function (event) {
    event.stopPropagation();
    this.dragMove(event);
  };

  proto.onmouseup = function (event) {
    this.dragEnd(event);
  };

  /**** native event ↑ ****/

  /**** drag event ↓ ****/

  proto.dragStar = function (event) {
    this.isDrag = true;
    this.offset.x = event.clientX - this.el.offsetLeft;
    this.offset.y = event.clientY - this.el.offsetTop;
    //this.offset.x =this.el.offsetLeft;
    //this.offset.y =this.el.offsetTop;
    this.dragStartPos = {x: event.clientX, y: event.clientY};
  };

  proto.dragMove = function (event) {
    if (this.isDrag) {
      var left = event.clientX - this.offset.x;
      var top = event.clientY - this.offset.y;
      if (this.containerEl) {
        var containerBoundingLeft = this.containerEl.getBoundingClientRect().left;
        var containerBoundingTop = this.containerEl.getBoundingClientRect().top;
        var containerBoundingWidth = this.containerEl.getBoundingClientRect().width;
        var containerBoundingHeight = this.containerEl.getBoundingClientRect().height;
        var elBoundingWidth = this.el.getBoundingClientRect().width;
        var elBoundingHeight = this.el.getBoundingClientRect().height;
        var displayEl = document.querySelector('.display');
        var containerLeft = displayEl.style.left == "" ? 0 : parseInt(displayEl.style.left.slice(0, -2));
        var c1 = left + containerLeft >= containerBoundingLeft;
        var c2 = left + elBoundingWidth <= containerBoundingWidth;
        //var c2 = left + elBoundingWidth <= containerBoundingLeft;
        var c3 = top >= containerBoundingTop;
        var c4 = top + elBoundingHeight <= containerBoundingTop + containerBoundingHeight;
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
