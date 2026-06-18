function appTimezone_() {
  return 'America/Asuncion';
}

function appCurrency_() {
  return 'PYG';
}

function appPropertyKeys_() {
  return {
    spreadsheetId: 'FINANZAS_SPREADSHEET_ID',
    driveRootFolderId: 'FINANZAS_DRIVE_ROOT_FOLDER_ID',
    databaseFolderId: 'FINANZAS_DATABASE_FOLDER_ID',
    goalImagesFolderId: 'FINANZAS_GOAL_IMAGES_FOLDER_ID',
    wishlistImagesFolderId: 'FINANZAS_WISHLIST_IMAGES_FOLDER_ID',
    backupsFolderId: 'FINANZAS_BACKUPS_FOLDER_ID',
    databaseInitialized: 'FINANZAS_DATABASE_INITIALIZED',
    spreadsheetMoved: 'FINANZAS_SPREADSHEET_MOVED_TO_DRIVE',
    monthlyFolderPrefix: 'FINANZAS_MONTHLY_FOLDER_ID_',
    monthlyMovementsPrefix: 'FINANZAS_MONTHLY_MOVEMENTS_SPREADSHEET_ID_',
    lastCalendarMonth: 'FINANZAS_LAST_CALENDAR_MONTH',
    apiToken: 'FINANZAS_API_TOKEN'
  };
}

function appSheetNames_() {
  return {
    config: 'Configuracion',
    movements: 'Movimientos',
    futureSavings: 'AhorrosFuturo',
    goals: 'Metas',
    wishlist: 'Wishlist'
  };
}

function appHeaders_() {
  return {
    Configuracion: ['Clave', 'Valor', 'Descripcion', 'Fecha de modificacion'],
    Movimientos: [
      'ID',
      'Fecha',
      'Hora',
      'Mes',
      'Tipo',
      'Motivo',
      'Categoria',
      'Monto',
      'ID relacionado',
      'Tipo relacionado',
      'Descripcion',
      'Fecha de creacion',
      'Fecha de modificacion'
    ],
    AhorrosFuturo: [
      'ID',
      'Titulo',
      'Descripcion',
      'Monto mensual',
      'Monto acumulado',
      'Estado',
      'Fecha de creacion'
    ],
    Metas: [
      'ID',
      'Titulo',
      'Descripcion',
      'Monto mensual',
      'Monto objetivo',
      'Monto acumulado',
      'Porcentaje',
      'ID de imagen en Drive',
      'URL o referencia de imagen',
      'Estado',
      'Fecha de creacion'
    ],
    Wishlist: [
      'ID',
      'Titulo',
      'Descripcion',
      'Costo aproximado',
      'ID de imagen en Drive',
      'URL o referencia de imagen',
      'Estado',
      'Fecha de creacion',
      'Fecha de conversion a meta'
    ]
  };
}

function appDefaultCategories_() {
  return [
    'Alimentacion',
    'Transporte',
    'Servicios',
    'Salud',
    'Educacion',
    'Hogar',
    'Ocio',
    'Ahorros',
    'Metas',
    'Wishlist',
    'Otros'
  ];
}

function appDefaultFixedExpenses_() {
  return [
    { categoria: 'Alimentacion', monto: 0 },
    { categoria: 'Transporte', monto: 0 }
  ];
}

function movementTypes_() {
  return {
    expense: 'Gasto',
    income: 'Ingreso',
    futureSaving: 'Aporte a ahorro',
    goal: 'Aporte a meta',
    wishlistPurchase: 'Compra de wishlist'
  };
}

function relatedTypes_() {
  return {
    futureSaving: 'ahorro',
    goal: 'meta',
    wishlist: 'wishlist'
  };
}

function activeStatus_() {
  return 'Activo';
}

function inactiveStatus_() {
  return 'Inactivo';
}

function convertedStatus_() {
  return 'Convertido';
}

function purchasedStatus_() {
  return 'Comprado';
}

function nowDate_() {
  return new Date();
}

function formatDate_(date, pattern) {
  return Utilities.formatDate(date, appTimezone_(), pattern);
}

function currentDateString_() {
  return formatDate_(nowDate_(), 'yyyy-MM-dd');
}

function currentTimeString_() {
  return formatDate_(nowDate_(), 'HH:mm:ss');
}

function currentMonthString_() {
  return formatDate_(nowDate_(), 'yyyy-MM');
}

function timestampString_() {
  return formatDate_(nowDate_(), "yyyy-MM-dd'T'HH:mm:ss");
}

function monthFromDateString_(dateString) {
  assertDateString_(dateString, 'Fecha');
  return String(dateString).slice(0, 7);
}

function generateId_(prefix) {
  return String(prefix || 'id') + '-' + Utilities.getUuid();
}

function normalizeText_(value) {
  if (value === null || value === undefined) {
    return '';
  }
  return String(value).trim();
}

function normalizeOptionalText_(value, maxLength) {
  var text = normalizeText_(value);
  if (maxLength && text.length > maxLength) {
    validationError_('El texto supera el limite de ' + maxLength + ' caracteres.');
  }
  return text;
}

function requireText_(value, label, maxLength) {
  var text = normalizeOptionalText_(value, maxLength);
  if (!text) {
    validationError_(label + ' es obligatorio.');
  }
  return text;
}

function normalizeAmount_(value, label, allowZero) {
  var fieldLabel = label || 'Monto';
  if (value === null || value === undefined || value === '') {
    validationError_(fieldLabel + ' es obligatorio.');
  }

  var numericValue = value;
  if (typeof value === 'string') {
    var cleaned = value
      .replace(/\s/g, '')
      .replace(/\./g, '')
      .replace(/,/g, '.')
      .replace(/[^\d.-]/g, '');
    numericValue = Number(cleaned);
  }

  if (typeof numericValue !== 'number' || isNaN(numericValue)) {
    validationError_(fieldLabel + ' debe ser numerico.');
  }

  var amount = Math.round(numericValue);
  if (allowZero) {
    if (amount < 0) {
      validationError_(fieldLabel + ' no puede ser negativo.');
    }
  } else if (amount <= 0) {
    validationError_(fieldLabel + ' debe ser mayor a cero.');
  }

  return amount;
}

function normalizeNullableAmount_(value, label) {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  return normalizeAmount_(value, label, true);
}

function assertDateString_(value, label) {
  if (isDateValue_(value)) {
    return formatDate_(value, 'yyyy-MM-dd');
  }
  var text = normalizeText_(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
    return text.slice(0, 10);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    validationError_((label || 'Fecha') + ' debe tener formato yyyy-MM-dd.');
  }
  return text;
}

function assertTimeString_(value, label) {
  if (isDateValue_(value)) {
    return formatDate_(value, 'HH:mm:ss');
  }
  var text = normalizeText_(value);
  if (!/^\d{2}:\d{2}(:\d{2})?$/.test(text)) {
    validationError_((label || 'Hora') + ' debe tener formato HH:mm:ss.');
  }
  if (/^\d{2}:\d{2}$/.test(text)) {
    text += ':00';
  }
  return text;
}

function assertMonthString_(value, label) {
  if (isDateValue_(value)) {
    return formatDate_(value, 'yyyy-MM');
  }
  var text = normalizeText_(value);
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
    return text.slice(0, 7);
  }
  if (!/^\d{4}-\d{2}$/.test(text)) {
    validationError_((label || 'Mes') + ' debe tener formato yyyy-MM.');
  }
  return text;
}

function isDateValue_(value) {
  return Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime());
}

function normalizeMovementType_(value) {
  var text = normalizeText_(value).toLowerCase();
  var types = movementTypes_();
  var map = {
    gasto: types.expense,
    expense: types.expense,
    ingreso: types.income,
    income: types.income,
    'aporte a ahorro': types.futureSaving,
    aporte_ahorro: types.futureSaving,
    aporte_ahorros: types.futureSaving,
    future_saving: types.futureSaving,
    ahorro: types.futureSaving,
    'aporte a meta': types.goal,
    aporte_meta: types.goal,
    goal: types.goal,
    meta: types.goal,
    'compra de wishlist': types.wishlistPurchase,
    compra_wishlist: types.wishlistPurchase,
    wishlist_purchase: types.wishlistPurchase,
    wishlist: types.wishlistPurchase
  };

  if (!map[text]) {
    validationError_('Tipo de movimiento invalido.');
  }
  return map[text];
}

function normalizeRelatedType_(value) {
  var text = normalizeText_(value).toLowerCase();
  var types = relatedTypes_();
  var map = {
    ahorro: types.futureSaving,
    ahorros: types.futureSaving,
    future_saving: types.futureSaving,
    meta: types.goal,
    metas: types.goal,
    goal: types.goal,
    wishlist: types.wishlist
  };
  return map[text] || text;
}

function normalizeCategory_(value) {
  return normalizeOptionalText_(value, 80) || 'Otros';
}

function isWishlistCategory_(value) {
  var text = normalizeText_(value).toLowerCase();
  return text === 'wishlist' || text === 'cosas que quiero' || text === 'cosa que quiero';
}

function isExpenseLikeMovement_(type) {
  var types = movementTypes_();
  return type === types.expense || type === types.wishlistPurchase;
}

function isIncomeMovement_(type) {
  return type === movementTypes_().income;
}

function isAllocationMovement_(type) {
  var types = movementTypes_();
  return type === types.futureSaving || type === types.goal;
}

function isRelatedMovement_(type) {
  var types = movementTypes_();
  return type === types.futureSaving || type === types.goal || type === types.wishlistPurchase;
}

function validateMovementRecordInput_(payload, existing) {
  var source = payload || {};
  var base = existing || {};
  var type = source.tipo !== undefined || source.type !== undefined
    ? normalizeMovementType_(source.tipo !== undefined ? source.tipo : source.type)
    : normalizeMovementType_(base.Tipo || movementTypes_().expense);
  var fecha = source.fecha !== undefined || source.date !== undefined
    ? assertDateString_(source.fecha !== undefined ? source.fecha : source.date, 'Fecha')
    : normalizeText_(base.Fecha) || currentDateString_();
  var hora = source.hora !== undefined || source.time !== undefined
    ? assertTimeString_(source.hora !== undefined ? source.hora : source.time, 'Hora')
    : normalizeText_(base.Hora) || currentTimeString_();
  var mes = monthFromDateString_(fecha);
  var motivo = source.motivo !== undefined || source.reason !== undefined
    ? requireText_(source.motivo !== undefined ? source.motivo : source.reason, 'Motivo', 120)
    : requireText_(base.Motivo, 'Motivo', 120);
  var categoria = source.categoria !== undefined || source.category !== undefined
    ? normalizeCategory_(source.categoria !== undefined ? source.categoria : source.category)
    : normalizeCategory_(base.Categoria);
  var monto = source.monto !== undefined || source.amount !== undefined
    ? normalizeAmount_(source.monto !== undefined ? source.monto : source.amount, 'Monto', false)
    : normalizeAmount_(base.Monto, 'Monto', false);
  var relatedId = source.idRelacionado !== undefined || source.relatedId !== undefined
    ? normalizeOptionalText_(source.idRelacionado !== undefined ? source.idRelacionado : source.relatedId, 120)
    : normalizeOptionalText_(base['ID relacionado'], 120);
  var relatedType = source.tipoRelacionado !== undefined || source.relatedType !== undefined
    ? normalizeRelatedType_(source.tipoRelacionado !== undefined ? source.tipoRelacionado : source.relatedType)
    : normalizeRelatedType_(base['Tipo relacionado']);
  var descripcion = source.descripcion !== undefined || source.description !== undefined
    ? normalizeOptionalText_(source.descripcion !== undefined ? source.descripcion : source.description, 500)
    : normalizeOptionalText_(base.Descripcion, 500);

  if (isRelatedMovement_(type) && !relatedId) {
    validationError_('El movimiento requiere un ID relacionado.');
  }

  if (type === movementTypes_().expense && isWishlistCategory_(categoria) && !relatedId) {
    validationError_('Selecciona la cosa que queres comprar.');
  }

  if (type === movementTypes_().expense && isWishlistCategory_(categoria) && relatedId) {
    type = movementTypes_().wishlistPurchase;
  }

  if (type === movementTypes_().futureSaving) {
    relatedType = relatedTypes_().futureSaving;
    categoria = 'Ahorros';
  }
  if (type === movementTypes_().goal) {
    relatedType = relatedTypes_().goal;
    categoria = 'Metas';
  }
  if (type === movementTypes_().wishlistPurchase) {
    relatedType = relatedTypes_().wishlist;
    categoria = 'Wishlist';
  }

  return {
    tipo: type,
    fecha: fecha,
    hora: hora,
    mes: mes,
    motivo: motivo,
    categoria: categoria,
    monto: monto,
    idRelacionado: relatedId,
    tipoRelacionado: relatedType,
    descripcion: descripcion
  };
}

function validateFutureSavingInput_(payload, existing) {
  var source = payload || {};
  var base = existing || {};
  var titleValue = source.titulo !== undefined ? source.titulo : source.title;
  var descriptionValue = source.descripcion !== undefined ? source.descripcion : source.description;
  var monthlyValue = source.montoMensual !== undefined ? source.montoMensual : source.monthlyAmount;

  return {
    titulo: titleValue !== undefined ? requireText_(titleValue, 'Titulo', 100) : requireText_(base.Titulo, 'Titulo', 100),
    descripcion: descriptionValue !== undefined ? normalizeOptionalText_(descriptionValue, 500) : normalizeOptionalText_(base.Descripcion, 500),
    montoMensual: monthlyValue !== undefined ? normalizeAmount_(monthlyValue, 'Monto mensual', true) : normalizeAmount_(base['Monto mensual'], 'Monto mensual', true),
    estado: normalizeOptionalText_(source.estado !== undefined ? source.estado : source.status, 40) || normalizeOptionalText_(base.Estado, 40) || activeStatus_()
  };
}

function validateGoalInput_(payload, existing) {
  var source = payload || {};
  var base = existing || {};
  var titleValue = source.titulo !== undefined ? source.titulo : source.title;
  var descriptionValue = source.descripcion !== undefined ? source.descripcion : source.description;
  var monthlyValue = source.montoMensual !== undefined ? source.montoMensual : source.monthlyAmount;
  var targetValue = source.montoObjetivo !== undefined ? source.montoObjetivo : source.targetAmount;
  var accumulatedValue = source.montoAcumulado !== undefined ? source.montoAcumulado : source.accumulatedAmount;

  var target = targetValue !== undefined
    ? normalizeAmount_(targetValue, 'Monto objetivo', false)
    : normalizeAmount_(base['Monto objetivo'], 'Monto objetivo', false);
  var accumulated = accumulatedValue !== undefined
    ? normalizeAmount_(accumulatedValue, 'Monto acumulado', true)
    : normalizeAmount_(base['Monto acumulado'] || 0, 'Monto acumulado', true);

  return {
    titulo: titleValue !== undefined ? requireText_(titleValue, 'Titulo', 100) : requireText_(base.Titulo, 'Titulo', 100),
    descripcion: descriptionValue !== undefined ? normalizeOptionalText_(descriptionValue, 500) : normalizeOptionalText_(base.Descripcion, 500),
    montoMensual: monthlyValue !== undefined ? normalizeAmount_(monthlyValue, 'Monto mensual', true) : normalizeAmount_(base['Monto mensual'], 'Monto mensual', true),
    montoObjetivo: target,
    montoAcumulado: accumulated,
    porcentaje: calculateGoalPercent_(accumulated, target),
    imageDriveId: normalizeOptionalText_(source.imageDriveId !== undefined ? source.imageDriveId : base['ID de imagen en Drive'], 200),
    imageRef: normalizeOptionalText_(source.imageRef !== undefined ? source.imageRef : base['URL o referencia de imagen'], 300),
    estado: normalizeOptionalText_(source.estado !== undefined ? source.estado : source.status, 40) || normalizeOptionalText_(base.Estado, 40) || activeStatus_()
  };
}

function validateWishlistInput_(payload, existing) {
  var source = payload || {};
  var base = existing || {};
  var titleValue = source.titulo !== undefined ? source.titulo : source.title;
  var costValue = source.costoAproximado !== undefined ? source.costoAproximado : source.approxCost;

  return {
    titulo: titleValue !== undefined ? requireText_(titleValue, 'Titulo', 100) : requireText_(base.Titulo, 'Titulo', 100),
    descripcion: '',
    costoAproximado: costValue !== undefined ? normalizeAmount_(costValue, 'Costo aproximado', false) : normalizeAmount_(base['Costo aproximado'], 'Costo aproximado', false),
    imageDriveId: normalizeOptionalText_(source.imageDriveId !== undefined ? source.imageDriveId : base['ID de imagen en Drive'], 200),
    imageRef: normalizeOptionalText_(source.imageRef !== undefined ? source.imageRef : base['URL o referencia de imagen'], 300),
    estado: normalizeOptionalText_(source.estado !== undefined ? source.estado : source.status, 40) || normalizeOptionalText_(base.Estado, 40) || activeStatus_()
  };
}

function sanitizeCategories_(value) {
  var list = value;
  if (typeof value === 'string') {
    list = parseJsonValue_(value);
  }
  if (!Array.isArray(list)) {
    validationError_('Las categorias deben ser una lista.');
  }

  var seen = {};
  var result = [];
  list.forEach(function (item) {
    var text = normalizeOptionalText_(item, 80);
    if (text && !seen[text.toLowerCase()]) {
      seen[text.toLowerCase()] = true;
      result.push(text);
    }
  });

  if (result.length === 0) {
    validationError_('Debe existir al menos una categoria.');
  }
  return result;
}

function sanitizeFixedExpenses_(value) {
  var list = value;
  if (typeof value === 'string') {
    list = parseJsonValue_(value);
  }
  if (!Array.isArray(list)) {
    validationError_('Los gastos fijos deben ser una lista.');
  }

  return list.map(function (item) {
    return {
      categoria: requireText_(item.categoria || item.category, 'Categoria', 80),
      monto: normalizeAmount_(item.monto !== undefined ? item.monto : item.amount, 'Monto de gasto fijo', true)
    };
  });
}

function calculateGoalPercent_(accumulated, target) {
  if (!target || target <= 0) {
    return 0;
  }
  return Math.min(100, Math.round((Number(accumulated || 0) / Number(target)) * 10000) / 100);
}

function clampAmount_(value) {
  var amount = Math.round(Number(value || 0));
  return amount < 0 ? 0 : amount;
}

function parseJsonValue_(value) {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  if (typeof value !== 'string') {
    return value;
  }
  var text = value.trim();
  if (!text) {
    return '';
  }
  if (text[0] !== '{' && text[0] !== '[') {
    return text;
  }
  try {
    return JSON.parse(text);
  } catch (error) {
    return text;
  }
}

function serializeSheetValue_(value) {
  if (Array.isArray(value) || (value && typeof value === 'object' && Object.prototype.toString.call(value) === '[object Object]')) {
    return JSON.stringify(value);
  }
  if (value === null || value === undefined) {
    return '';
  }
  return value;
}

function isBlankRow_(row) {
  return row.every(function (cell) {
    return cell === '' || cell === null || cell === undefined;
  });
}

function validationError_(message) {
  var error = new Error(message);
  error.name = 'ValidationError';
  throw error;
}

function notFoundError_(message) {
  var error = new Error(message);
  error.name = 'NotFoundError';
  throw error;
}

function assertCondition_(condition, message) {
  if (!condition) {
    validationError_(message);
  }
}

function withScriptLock_(callback) {
  var lock = LockService.getScriptLock();
  lock.waitLock(30000);
  try {
    return callback();
  } finally {
    lock.releaseLock();
  }
}
