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
