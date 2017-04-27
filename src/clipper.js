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
      '<div id="dot-1" class="dot lt"></div>' +
      '<div id="dot-2" class="dot tm"></div>' +
      '<div id="dot-3" class="dot rt"></div>' +
      '<div id="dot-4" class="dot rm"></div>' +
      '<div id="dot-5" class="dot rb"></div>' +
      '<div id="dot-6" class="dot bm"></div>' +
      '<div id="dot-7" class="dot bl"></div>' +
      '<div id="dot-8" class="dot lm"></div>';
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