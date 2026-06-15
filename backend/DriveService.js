function ensureDriveStructure_() {
  var props = getScriptProperties_();
  var keys = appPropertyKeys_();
  var rootFolder = getFolderByPropertyOrName_(keys.driveRootFolderId, 'FinanzasPersonales', null);
  props.setProperty(keys.driveRootFolderId, rootFolder.getId());

  var databaseFolder = getOrCreateChildFolder_(rootFolder, 'BaseDeDatos');
  var goalImagesFolder = getOrCreateChildFolder_(rootFolder, 'ImagenesMetas');
  var wishlistImagesFolder = getOrCreateChildFolder_(rootFolder, 'ImagenesWishlist');
  var backupsFolder = getOrCreateChildFolder_(rootFolder, 'Respaldos');

  props.setProperty(keys.databaseFolderId, databaseFolder.getId());
  props.setProperty(keys.goalImagesFolderId, goalImagesFolder.getId());
  props.setProperty(keys.wishlistImagesFolderId, wishlistImagesFolder.getId());
  props.setProperty(keys.backupsFolderId, backupsFolder.getId());

  return getDriveStructure_();
}

function getDriveStructure_() {
  var props = getScriptProperties_();
  var keys = appPropertyKeys_();
  return {
    rootFolderId: props.getProperty(keys.driveRootFolderId),
    databaseFolderId: props.getProperty(keys.databaseFolderId),
    goalImagesFolderId: props.getProperty(keys.goalImagesFolderId),
    wishlistImagesFolderId: props.getProperty(keys.wishlistImagesFolderId),
    backupsFolderId: props.getProperty(keys.backupsFolderId)
  };
}

function getFolderByPropertyOrName_(propertyKey, folderName, parentFolder) {
  var props = getScriptProperties_();
  var folderId = props.getProperty(propertyKey);
  if (folderId) {
    try {
      return DriveApp.getFolderById(folderId);
    } catch (error) {
      props.deleteProperty(propertyKey);
    }
  }

  if (parentFolder) {
    return getOrCreateChildFolder_(parentFolder, folderName);
  }

  var folders = DriveApp.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(folderName);
}

function getOrCreateChildFolder_(parentFolder, folderName) {
  var folders = parentFolder.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return parentFolder.createFolder(folderName);
}

function moveSpreadsheetToDatabaseFolder_(spreadsheetId) {
  var structure = ensureDriveStructure_();
  if (!structure.databaseFolderId) {
    return;
  }

  try {
    var file = DriveApp.getFileById(spreadsheetId);
    var folder = DriveApp.getFolderById(structure.databaseFolderId);
    file.moveTo(folder);
  } catch (error) {
    // Si Drive no permite mover el archivo por permisos, la planilla sigue utilizable.
  }
}

function uploadPhoto_(payload) {
  var source = payload || {};
  var target = normalizeText_(source.target || source.tipo || source.type).toLowerCase();
  if (target !== 'goal' && target !== 'meta' && target !== 'wishlist') {
    validationError_('El destino de la foto debe ser meta o wishlist.');
  }

  var base64 = requireText_(source.base64 || source.dataUrl || source.file, 'Imagen', 0);
  var fileName = normalizeOptionalText_(source.fileName || source.nombre || source.name, 120) || 'imagen-' + timestampString_() + '.png';
  var mimeType = normalizeOptionalText_(source.mimeType || source.contentType, 80) || 'image/png';
  var cleanBase64 = base64.replace(/^data:[^;]+;base64,/, '');
  var bytes;

  try {
    bytes = Utilities.base64Decode(cleanBase64);
  } catch (error) {
    validationError_('La imagen no tiene un formato base64 valido.');
  }

  ensureDriveStructure_();
  var structure = getDriveStructure_();
  var folderId = target === 'wishlist'
    ? structure.wishlistImagesFolderId
    : structure.goalImagesFolderId;
  var folder = DriveApp.getFolderById(folderId);
  var blob = Utilities.newBlob(bytes, mimeType, fileName);
  var file = folder.createFile(blob);

  return {
    id: file.getId(),
    name: file.getName(),
    mimeType: mimeType,
    size: bytes.length,
    reference: 'drive:' + file.getId()
  };
}

function getPhoto_(payload) {
  var source = payload || {};
  var fileId = requireText_(source.fileId || source.id || source.imageDriveId, 'ID de imagen', 200);
  var file = DriveApp.getFileById(fileId);
  var blob = file.getBlob();
  var mimeType = blob.getContentType();
  var base64 = Utilities.base64Encode(blob.getBytes());

  return {
    id: file.getId(),
    name: file.getName(),
    mimeType: mimeType,
    base64: base64,
    dataUrl: 'data:' + mimeType + ';base64,' + base64
  };
}

function resolveImageUploadForPayload_(payload, target) {
  var source = payload || {};
  var imageDriveId = normalizeOptionalText_(source.imageDriveId, 200);
  var imageRef = normalizeOptionalText_(source.imageRef, 300);

  if (source.imageBase64 || source.photoBase64 || source.fotoBase64) {
    var upload = uploadPhoto_({
      target: target,
      base64: source.imageBase64 || source.photoBase64 || source.fotoBase64,
      fileName: source.imageFileName || source.photoFileName || source.fotoNombre,
      mimeType: source.imageMimeType || source.photoMimeType || source.fotoMimeType
    });
    imageDriveId = upload.id;
    imageRef = upload.reference;
  }

  return {
    imageDriveId: imageDriveId,
    imageRef: imageRef
  };
}
