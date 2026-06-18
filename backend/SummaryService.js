function getMonthlySummary_(payload) {
  var source = payload || {};
  var config = getConfig_();
  var month = assertMonthString_(source.mes || source.month || config.mesActual || currentMonthString_(), 'Mes');
  var allMovements = readAllMovementRecords_();
  var movements = allMovements.filter(function (record) {
    return movementCalendarMonth_(record) === month;
  });

  var types = movementTypes_();
  var monthlySalary = Number(config.sueldoMensual || 0);
  var totals = {
    gastos: 0,
    comprasWishlist: 0,
    ingresosExtra: 0,
    aportesAhorro: 0,
    aportesMeta: 0
  };
  var categoryTotals = {};

  movements.forEach(function (record) {
    var type = normalizeText_(record.Tipo);
    var amount = Number(record.Monto || 0);
    var category = normalizeText_(record.Categoria) || 'Otros';

    if (type === types.expense) {
      totals.gastos += amount;
      categoryTotals[category] = Number(categoryTotals[category] || 0) + amount;
    }
    if (type === types.wishlistPurchase) {
      totals.comprasWishlist += amount;
      categoryTotals[category] = Number(categoryTotals[category] || 0) + amount;
    }
    if (type === types.income && !isSalaryIncomeRecord_(record)) {
      totals.ingresosExtra += amount;
    }
    if (type === types.futureSaving) {
      totals.aportesAhorro += amount;
    }
    if (type === types.goal) {
      totals.aportesMeta += amount;
    }
  });

  var totalGastado = totals.gastos + totals.comprasWishlist;
  var totalIngresos = monthlySalary + totals.ingresosExtra;
  var totalApartado = totals.aportesAhorro + totals.aportesMeta;
  var disponible = totalIngresos - totalGastado - totalApartado;
  var porcentajeDisponible = totalIngresos > 0
    ? Math.max(0, Math.min(100, Math.round((disponible / totalIngresos) * 10000) / 100))
    : 0;

  var topCategory = topSpendingCategory_(categoryTotals);
  var recent = sortMovementRecords_(allMovements.slice(), true).slice(0, 5).map(movementToApi_);

  return {
    mes: month,
    moneda: config.moneda,
    sueldoMensual: monthlySalary,
    ingresosExtra: totals.ingresosExtra,
    totalIngresos: totalIngresos,
    totalGastado: totalGastado,
    gastosNormales: totals.gastos,
    comprasWishlist: totals.comprasWishlist,
    aportesAhorro: totals.aportesAhorro,
    aportesMeta: totals.aportesMeta,
    totalApartado: totalApartado,
    disponible: disponible,
    porcentajeDisponible: porcentajeDisponible,
    categoriaMayorGasto: topCategory,
    actividadReciente: recent,
    cantidadMovimientos: movements.length,
    ahorrosFuturo: listFutureSavings_({ includeInactive: false }),
    metas: listGoals_({ includeInactive: false }),
    wishlist: listWishlist_({ includeInactive: false, order: 'asc' })
  };
}

function isSalaryIncomeRecord_(record) {
  return normalizeText_((record || {}).Motivo).toLowerCase() === 'sueldo';
}

function movementCalendarMonth_(record) {
  if (isDateValue_(record.Fecha)) {
    return formatDate_(record.Fecha, 'yyyy-MM');
  }
  var textDate = normalizeText_(record.Fecha);
  if (/^\d{4}-\d{2}/.test(textDate)) {
    return textDate.slice(0, 7);
  }
  return normalizeText_(record.Mes);
}

function topSpendingCategory_(categoryTotals) {
  var names = Object.keys(categoryTotals || {});
  if (names.length === 0) {
    return {
      categoria: '',
      monto: 0,
      mensaje: 'Todavia no registraste gastos este mes.'
    };
  }

  names.sort(function (a, b) {
    return Number(categoryTotals[b] || 0) - Number(categoryTotals[a] || 0);
  });

  var category = names[0];
  return {
    categoria: category,
    monto: Number(categoryTotals[category] || 0),
    mensaje: category === 'Wishlist'
      ? 'Compraste eso que tanto querias.'
      : 'Lo que mas gastaste fue en ' + category + '.'
  };
}

function getBootstrapData_() {
  var config = getConfig_();
  return {
    config: config,
    resumen: getMonthlySummary_({ mes: config.mesActual || currentMonthString_() }),
    movimientos: listMovements_({ allMonths: true, order: 'desc' }),
    ahorrosFuturo: listFutureSavings_({ includeInactive: false }),
    metas: listGoals_({ includeInactive: false }),
    wishlist: listWishlist_({ includeInactive: false, order: 'asc' })
  };
}
