(function () {
  'use strict';

  var MONTHS = [
    'enero',
    'febrero',
    'marzo',
    'abril',
    'mayo',
    'junio',
    'julio',
    'agosto',
    'septiembre',
    'octubre',
    'noviembre',
    'diciembre'
  ];
  var MONTHS_UPPER = MONTHS.map(function (item) {
    return item.toUpperCase();
  });
  var DAYS_SHORT = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];

  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value === undefined || value === null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function normalizeAmount(value) {
    if (value === undefined || value === null || value === '') {
      return 0;
    }
    if (typeof value === 'number') {
      return Math.round(value);
    }
    return Math.round(Number(String(value).replace(/\./g, '').replace(/,/g, '.').replace(/[^\d.-]/g, '')) || 0);
  }

  function formatMoney(value) {
    var amount = normalizeAmount(value);
    var sign = amount < 0 ? '-' : '';
    var digits = String(Math.abs(amount)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return 'Gs. ' + sign + digits;
  }

  function formatPercent(value) {
    var number = Number(value || 0);
    return number.toLocaleString('es-PY', { maximumFractionDigits: 1 }) + '%';
  }

  function formatMovementDateTime(dateString, timeString) {
    var value = String(dateString || '');
    var match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    var time = String(timeString || '').slice(0, 5);
    if (!match) {
      return [value, time].filter(Boolean).join(' ');
    }

    var year = Number(match[1]);
    var monthIndex = Number(match[2]) - 1;
    var day = Number(match[3]);
    var date = new Date(year, monthIndex, day);
    var dayLabel = DAYS_SHORT[date.getDay()] || '';
    var monthLabel = MONTHS_UPPER[monthIndex] || match[2];
    return [dayLabel + ' ' + String(day).padStart(2, '0') + '/' + monthLabel + '/' + year, time]
      .filter(Boolean)
      .join(' ');
  }

  function todayParts() {
    var now = new Date();
    return {
      day: now.getDate(),
      month: MONTHS[now.getMonth()],
      monthShort: MONTHS[now.getMonth()].slice(0, 3).toUpperCase(),
      year: now.getFullYear()
    };
  }

  function friendlyDate() {
    var parts = todayParts();
    return parts.day + ' de ' + parts.month;
  }

  function friendlyFullDate() {
    var parts = todayParts();
    return parts.day + ' de ' + parts.month + ' de ' + parts.year;
  }

  function compactDate() {
    var parts = todayParts();
    return String(parts.day).padStart(2, '0') + ' ' + parts.monthShort;
  }

  function currentMonth() {
    var now = new Date();
    return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
  }

  function toInputDate(dateString) {
    if (dateString) {
      return dateString;
    }
    var now = new Date();
    return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
  }

  function toInputTime(timeString) {
    if (timeString) {
      return String(timeString).slice(0, 5);
    }
    var now = new Date();
    return String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');
  }

  function formDataToObject(form) {
    var data = {};
    new FormData(form).forEach(function (value, key) {
      data[key] = value;
    });
    return data;
  }

  function splitLines(value) {
    return String(value || '')
      .split(/\r?\n|,/)
      .map(function (item) { return item.trim(); })
      .filter(Boolean);
  }

  function fixedExpensesFromText(value) {
    return String(value || '')
      .split(/\r?\n/)
      .map(function (line) {
        var parts = line.split(':');
        if (parts.length < 2) {
          return null;
        }
        return {
          categoria: parts[0].trim(),
          monto: normalizeAmount(parts.slice(1).join(':'))
        };
      })
      .filter(function (item) {
        return item && item.categoria;
      });
  }

  function fixedExpensesToText(items) {
    return (items || [])
      .map(function (item) {
        return (item.categoria || item.category || '') + ': ' + normalizeAmount(item.monto !== undefined ? item.monto : item.amount);
      })
      .join('\n');
  }

  function fixedExpenseName(item) {
    return String((item || {}).nombre || (item || {}).name || (item || {}).categoria || (item || {}).category || '').trim();
  }

  function fixedExpenseAmount(item) {
    var source = item || {};
    return normalizeAmount(source.monto !== undefined ? source.monto : source.amount);
  }

  function fixedExpensePercent(item, salary) {
    var source = item || {};
    var explicit = source.porcentajeSueldo !== undefined ? source.porcentajeSueldo : source.salaryPercent;
    if (explicit !== undefined && explicit !== null && explicit !== '') {
      return Math.max(0, Number(String(explicit).replace(',', '.')) || 0);
    }
    var sueldo = normalizeAmount(salary);
    if (!sueldo) {
      return 0;
    }
    return Math.round((fixedExpenseAmount(source) / sueldo) * 10000) / 100;
  }

  function normalizeFixedExpenses(items, salary) {
    return (Array.isArray(items) ? items : [])
      .map(function (item) {
        return {
          nombre: fixedExpenseName(item),
          categoria: fixedExpenseName(item),
          monto: fixedExpenseAmount(item),
          porcentajeSueldo: fixedExpensePercent(item, salary)
        };
      })
      .filter(function (item) {
        return item.nombre || item.monto > 0;
      });
  }

  function isFixedExpenseMovement(item) {
    var source = item || {};
    var category = String(source.categoria || source.category || '').toLowerCase();
    var description = String(source.descripcion || source.description || '').toLowerCase();
    return category === 'gasto fijo' || description.indexOf('gasto fijo automatico') === 0;
  }

  function debounce(fn, delay) {
    var timer = 0;
    return function () {
      var args = arguments;
      clearTimeout(timer);
      timer = setTimeout(function () {
        fn.apply(null, args);
      }, delay);
    };
  }

  window.FinanzasUtils = {
    qs: qs,
    qsa: qsa,
    escapeHtml: escapeHtml,
    normalizeAmount: normalizeAmount,
    formatMoney: formatMoney,
    formatPercent: formatPercent,
    formatMovementDateTime: formatMovementDateTime,
    friendlyDate: friendlyDate,
    friendlyFullDate: friendlyFullDate,
    compactDate: compactDate,
    currentMonth: currentMonth,
    toInputDate: toInputDate,
    toInputTime: toInputTime,
    formDataToObject: formDataToObject,
    splitLines: splitLines,
    fixedExpensesFromText: fixedExpensesFromText,
    fixedExpensesToText: fixedExpensesToText,
    fixedExpenseName: fixedExpenseName,
    fixedExpenseAmount: fixedExpenseAmount,
    fixedExpensePercent: fixedExpensePercent,
    normalizeFixedExpenses: normalizeFixedExpenses,
    isFixedExpenseMovement: isFixedExpenseMovement,
    debounce: debounce
  };
}());
