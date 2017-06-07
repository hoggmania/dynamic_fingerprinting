// Load a text resource from a file over the network

var Sender = function () {
  this.finished = false;
  this.nextID = 0;
  this.getID = function(){
    if (this.finished) {
      throw "Can't  generate ID anymore";
      return -1;
    }
    return this.nextID ++;
  }

  this.getIDs = function(numIDs) {
    var idList = [];
    for (var i = 0;i < numIDs;++ i) {
      idList.push(this.getID());
    }
    return idList;
  }

  // used for sending images back to server
  this.getData = function(gl, canvas, id) {
    var dataurl = canvas.toDataURL('image/png', 1.0);
    $.ajax({
      context:this,
      url : "http://" + ip_address + "/pictures",
      type : 'POST',
      async: false,
      data : {
        imageBase64: dataurl
      },
      success : function(img_id) {
        this.toServer(WebGL, ven, ren, md5(dataurl), id, img_id);
        //parent.postMessage(data,"http://uniquemachine.org");
      },
      error: function (xhr, ajaxOptions, thrownError) {
        //alert(thrownError);
      }
    });
  }
}

// return the canvas with the canvasName
// if doesn't exsit, generate a new one
// this function won't delete the generated canvases
getCanvas = function(canvasName) {
  var canvas = $('#' + canvasName);
  if(!canvas[0]){
    return $("<canvas id='" + canvasName + "' width='256' height='256'></canvas>")[0];
  }
  return canvas = $('#' + canvasName)[0];
}

getGLAA = function(canvas) {
  var gl = null;
  for (var i = 0; i < 4; ++i) {
    gl = canvas.getContext(
        [ "webgl", "experimental-webgl", "moz-webgl", "webkit-3d" ][i], {
          antialias : true,
          preserveDrawingBuffer : true,
          willReadFrequently : false,
          depth: true
        });
    if (gl)
      break;
  }

  if (!gl) {
    alert('Your browser does not support WebGL');
  }
  return gl;
}

getGL = function(canvas) {
  var gl = null;
  for (var i = 0; i < 4; ++i) {
    gl = canvas.getContext(
        [ "webgl", "experimental-webgl", "moz-webgl", "webkit-3d" ][i], {
          antialias : false,
          preserveDrawingBuffer : true,
          willReadFrequently : false,
          depth: true
        });
    if (gl)
      break;
  }

  if (!gl) {
    alert('Your browser does not support WebGL');
  }
  return gl;
}

computeKernelWeight = function(kernel) {
  var weight = kernel.reduce(function(prev, curr) { return prev + curr; });
  return weight <= 0 ? 1 : weight;
}

var loadTextResource = function(url, callback, caller) {
  var request = new XMLHttpRequest();
  request.open('GET', url + '?please-dont-cache=' + Math.random(), true);
  request.onload = function() {
    if (request.status < 200 || request.status > 299) {
      callback('Error: HTTP Status ' + request.status + ' on resource ' + url);
    } else {
      callback(null, request.responseText, caller);
    }
  };
  request.send();
};

var loadImage = function(url, callback, caller) {
  var image = new Image();
  image.onload = function() { callback(null, image, caller); };
  image.src = url;
};

var loadJSONResource = function(url, callback, caller) {
  loadTextResource(url, function(err, result, caller) {
    if (err) {
      callback(err);
    } else {
      try {
        callback(null, JSON.parse(result), caller);
      } catch (e) {
        callback(e);
      }
    }
  }, caller);
};
