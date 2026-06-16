(function () {
  'use strict';

  var PALETTE = [
    [25, 45, 24],
    [56, 86, 42],
    [105, 135, 76],
    [174, 202, 124]
  ];

  var BAYER = [
    [0, 8, 2, 10],
    [12, 4, 14, 6],
    [3, 11, 1, 9],
    [15, 7, 13, 5]
  ];
  var photoPromises = {};

  function fileToDataUrl(file) {
    return new Promise(function (resolve, reject) {
      if (!file) {
        resolve('');
        return;
      }
      var reader = new FileReader();
      reader.onload = function () { resolve(reader.result); };
      reader.onerror = function () { reject(new Error('No se pudo leer la imagen.')); };
      reader.readAsDataURL(file);
    });
  }

  function loadImage(src) {
    return new Promise(function (resolve, reject) {
      var image = new Image();
      image.onload = function () { resolve(image); };
      image.onerror = function () { reject(new Error('No se pudo cargar la imagen.')); };
      image.src = src;
    });
  }

  function renderDataUrlToCanvas(dataUrl, canvas, options) {
    if (!dataUrl || !canvas) {
      return Promise.resolve();
    }

    var settings = options || {};
    var targetWidth = settings.width || 72;
    var targetHeight = settings.height || 54;

    return loadImage(dataUrl).then(function (image) {
      var source = document.createElement('canvas');
      source.width = targetWidth;
      source.height = targetHeight;
      var sourceContext = source.getContext('2d', { willReadFrequently: true });
      sourceContext.imageSmoothingEnabled = false;
      sourceContext.fillStyle = 'rgb(174,202,124)';
      sourceContext.fillRect(0, 0, targetWidth, targetHeight);

      var scale = Math.max(targetWidth / image.width, targetHeight / image.height);
      var drawWidth = image.width * scale;
      var drawHeight = image.height * scale;
      var drawX = (targetWidth - drawWidth) / 2;
      var drawY = (targetHeight - drawHeight) / 2;
      sourceContext.drawImage(image, drawX, drawY, drawWidth, drawHeight);

      var pixels = sourceContext.getImageData(0, 0, targetWidth, targetHeight);
      for (var index = 0; index < pixels.data.length; index += 4) {
        var pixel = index / 4;
        var x = pixel % targetWidth;
        var y = Math.floor(pixel / targetWidth);
        var r = pixels.data[index];
        var g = pixels.data[index + 1];
        var b = pixels.data[index + 2];
        var gray = (r * 0.299 + g * 0.587 + b * 0.114) / 255;
        var threshold = (BAYER[y % 4][x % 4] - 7.5) / 42;
        var level = Math.max(0, Math.min(3, Math.floor((gray + threshold) * 4)));
        var color = PALETTE[level];
        pixels.data[index] = color[0];
        pixels.data[index + 1] = color[1];
        pixels.data[index + 2] = color[2];
        pixels.data[index + 3] = 255;
      }
      sourceContext.putImageData(pixels, 0, 0);

      canvas.width = settings.outputWidth || targetWidth * 3;
      canvas.height = settings.outputHeight || targetHeight * 3;
      var context = canvas.getContext('2d');
      context.imageSmoothingEnabled = false;
      context.fillStyle = 'rgb(174,202,124)';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(source, 0, 0, canvas.width, canvas.height);
      canvas.classList.add('lcd-photo-ready');
    });
  }

  function hydrate(root) {
    var canvases = window.FinanzasUtils.qsa('canvas[data-image-id]', root || document);
    canvases.forEach(function (canvas) {
      var imageId = canvas.getAttribute('data-image-id');
      if (!imageId || canvas.getAttribute('data-loaded') === 'true') {
        return;
      }
      canvas.setAttribute('data-loaded', 'true');
      getPhotoDataUrl(imageId)
        .then(function (dataUrl) {
          if (!dataUrl) {
            throw new Error('Sin imagen local.');
          }
          return renderDataUrlToCanvas(dataUrl, canvas);
        })
        .catch(function () {
          canvas.classList.add('lcd-photo-error');
        });
    });
  }

  function getPhotoDataUrl(imageId) {
    if (photoPromises[imageId]) {
      return photoPromises[imageId];
    }

    var cache = window.FinanzasLocalCache;
    var cached = cache ? cache.loadPhoto(imageId) : Promise.resolve('');
    photoPromises[imageId] = cached.then(function (dataUrl) {
      if (dataUrl) {
        return dataUrl;
      }
      if (!window.FinanzasApi.hasBackend()) {
        return '';
      }
      return window.FinanzasApi.request('getPhoto', { fileId: imageId })
        .then(function (photo) {
          var freshDataUrl = photo && photo.dataUrl ? photo.dataUrl : '';
          if (cache && freshDataUrl) {
            cache.savePhoto(imageId, freshDataUrl);
          }
          return freshDataUrl;
        });
    });
    return photoPromises[imageId];
  }

  window.FinanzasImages = {
    fileToDataUrl: fileToDataUrl,
    renderDataUrlToCanvas: renderDataUrlToCanvas,
    hydrate: hydrate
  };
}());
