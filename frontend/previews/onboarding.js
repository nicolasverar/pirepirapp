(function () {
  'use strict';

  var root = document.getElementById('onboarding-root');
  if (!root) {
    return;
  }

  var variant = root.getAttribute('data-variant') || 'terminal';
  var nextButton = document.getElementById('onboarding-next');
  var statusLine = document.querySelector('.status-terminal span');
  var index = 0;
  var typingTimer = 0;

  var steps = [
    {
      code: 'BOOT',
      title: 'HOLA',
      text: 'VAMOS A DEJAR TU PIREPIRAPP LISTA',
      sub: 'PODEMOS SALTAR TODO Y ENTRAR VACIO',
      rows: [
        ['Modo', 'Local'],
        ['Datos', 'Solo en este dispositivo'],
        ['Backup', 'JSON manual']
      ],
      status: 'primer arranque'
    },
    {
      code: 'SUELDO',
      title: 'SUELDO',
      text: 'PRIMERO CARGAMOS TU SUELDO MENSUAL',
      sub: 'ESTE MONTO ORDENA FIJOS AHORROS Y DISPONIBLE',
      rows: [
        ['Sueldo mensual', 'Gs. 3.500.000'],
        ['Mes inicial', 'Julio 2026'],
        ['Cobro', 'Desde ingreso sueldo']
      ],
      status: 'sueldo mensual'
    },
    {
      code: 'FIJOS',
      title: 'FIJOS',
      text: 'DESPUES VAN LOS GASTOS FIJOS',
      sub: 'SON COMPROMISOS QUE SE REPITEN CADA MES',
      rows: [
        ['Alquiler', 'Gs. 1.050.000'],
        ['Internet', 'Gs. 165.000'],
        ['Luz y agua', 'Gs. 230.000']
      ],
      status: 'gastos fijos'
    },
    {
      code: 'METAS',
      title: 'METAS',
      text: 'AHORA DEFINIMOS AHORROS Y METAS',
      sub: 'FUTURO METAS Y COSAS QUE QUIERO QUEDAN SEPARADAS',
      rows: [
        ['Futuro', 'Gs. 350.000'],
        ['Meta notebook', 'Gs. 300.000'],
        ['Cosa que quiero', 'Auriculares']
      ],
      status: 'metas iniciales'
    },
    {
      code: 'PART',
      title: 'PARTICION',
      text: 'LA APP ARMA LA PARTICION DEL SUELDO',
      sub: 'FIJOS AHORROS Y DISPONIBLE QUEDAN VISIBLES',
      rows: [
        ['Gastos fijos', '41%'],
        ['Ahorros metas', '19%'],
        ['Disponible', '40%']
      ],
      status: 'particion sueldo',
      partition: true
    },
    {
      code: 'LISTO',
      title: 'LISTO',
      text: 'TERMINAMOS EL ARRANQUE INICIAL',
      sub: 'ENTRAS AL RESUMEN Y PODES AJUSTAR TODO DESPUES',
      rows: [
        ['Resumen', 'Preparado'],
        ['Backup local', 'Pendiente'],
        ['Estado', 'Listo para entrar']
      ],
      status: 'listo'
    }
  ];

  var GLYPHS = {
    ' ': ['00000', '00000', '00000', '00000', '00000', '00000', '00000'],
    '.': ['00000', '00000', '00000', '00000', '00000', '01100', '01100'],
    ',': ['00000', '00000', '00000', '00000', '01100', '00100', '01000'],
    '/': ['00001', '00010', '00010', '00100', '01000', '01000', '10000'],
    '-': ['00000', '00000', '00000', '11111', '00000', '00000', '00000'],
    '0': ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
    '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
    '2': ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
    '3': ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
    '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
    '5': ['11111', '10000', '10000', '11110', '00001', '00001', '11110'],
    '6': ['01110', '10000', '10000', '11110', '10001', '10001', '01110'],
    '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
    '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
    '9': ['01110', '10001', '10001', '01111', '00001', '00001', '01110'],
    'A': ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
    'B': ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
    'C': ['01111', '10000', '10000', '10000', '10000', '10000', '01111'],
    'D': ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
    'E': ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
    'F': ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
    'G': ['01111', '10000', '10000', '10011', '10001', '10001', '01111'],
    'H': ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
    'I': ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
    'J': ['00111', '00010', '00010', '00010', '10010', '10010', '01100'],
    'K': ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
    'L': ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
    'M': ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
    'N': ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
    'O': ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
    'P': ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
    'Q': ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
    'R': ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
    'S': ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
    'T': ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
    'U': ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
    'V': ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
    'W': ['10001', '10001', '10001', '10101', '10101', '10101', '01010'],
    'X': ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
    'Y': ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
    'Z': ['11111', '00001', '00010', '00100', '01000', '10000', '11111']
  };

  function render() {
    var step = steps[index];
    root.innerHTML = [
      '<section class="onboarding-stage is-' + escapeHtml(variant) + '">',
      renderTopline(step),
      '<section class="onboarding-copy">',
      '<div class="pixel-terminal">',
      pixelText(step.title, 'main', 0),
      pixelText('', 'sub', 1),
      '</div>',
      '</section>',
      '<section class="onboarding-body">',
      variant === 'console' ? renderConsole(step) : renderTerminal(step),
      '</section>',
      renderProgress(),
      '</section>'
    ].join('');
    updateChrome(step);
    typeStep(step);
  }

  function renderTopline(step) {
    return [
      '<div class="onboarding-topline">',
      '<span class="onboarding-chip">' + escapeHtml(step.code) + '</span>',
      '<span class="onboarding-line" aria-hidden="true"></span>',
      '<button class="onboarding-skip-inline" type="button" data-tour-action="skip">SALTAR</button>',
      '</div>'
    ].join('');
  }

  function renderTerminal(step) {
    var rows = step.rows.map(function (row) {
      return '<div class="terminal-row"><span>' + escapeHtml(row[0]) + '</span><b>' + escapeHtml(row[1]) + '</b></div>';
    });
    if (step.partition) {
      rows.push(renderPartitionRail());
    }
    if (index === steps.length - 1) {
      rows.push('<div class="terminal-total"><span>Proximo paso</span><b>Entrar al resumen</b></div>');
    }
    return '<div class="emerge-zone terminal-panel">' + rows.join('') + '</div>';
  }

  function renderConsole(step) {
    var lines = steps.slice(0, index + 1).map(function (item, itemIndex) {
      var live = itemIndex === index ? ' is-live' : '';
      var value = item.rows[0] ? item.rows[0][1] : 'OK';
      return '<div class="console-row' + live + '"><span>' + escapeHtml(item.code + ' ' + item.title) + '</span><b>' + escapeHtml(value) + '</b></div>';
    });
    var summary = '';
    if (index >= 4) {
      summary = [
        '<div class="summary-strip">',
        '<span>FIJOS<b>41%</b></span>',
        '<span>AHORRO<b>19%</b></span>',
        '<span>LIBRE<b>40%</b></span>',
        '</div>'
      ].join('');
    }
    return [
      '<div class="emerge-zone console-layout">',
      '<div class="console-rail">',
      steps.map(function (_, dotIndex) {
        var state = dotIndex < index ? ' is-done' : (dotIndex === index ? ' is-active' : '');
        return '<span class="console-dot' + state + '">' + String(dotIndex + 1).padStart(2, '0') + '</span>';
      }).join(''),
      '</div>',
      '<div class="console-stack">',
      lines.join(''),
      summary,
      '</div>',
      '</div>'
    ].join('');
  }

  function renderPartitionRail() {
    return [
      '<div class="terminal-pill-grid">',
      '<div class="terminal-pill"><span>Fijos</span><b>41%</b></div>',
      '<div class="terminal-pill"><span>Ahorros</span><b>19%</b></div>',
      '<div class="terminal-pill"><span>Libre</span><b>40%</b></div>',
      '</div>',
      '<div class="partition-rail" aria-label="Particion del sueldo">',
      '<i style="--w:41%;--c:#627545"></i>',
      '<i style="--w:19%;--c:#7d8d55"></i>',
      '<i style="--w:40%;--c:#24351f"></i>',
      '</div>'
    ].join('');
  }

  function renderProgress() {
    return [
      '<div class="onboarding-progress">',
      '<div class="progress-slots">',
      steps.map(function (_, slotIndex) {
        var state = slotIndex < index ? ' is-done' : (slotIndex === index ? ' is-active' : '');
        return '<span class="progress-slot' + state + '"></span>';
      }).join(''),
      '</div>',
      '<div class="progress-caption"><span>PASO ' + (index + 1) + '/' + steps.length + '</span><span>' + escapeHtml(steps[index].code) + '</span></div>',
      '</div>'
    ].join('');
  }

  function typeStep(step) {
    var title = step.text;
    var sub = step.sub;
    var current = 0;
    var subCurrent = 0;
    clearTimeout(typingTimer);

    function tickMain() {
      root.querySelector('.pixel-terminal-main').outerHTML = pixelText(title.slice(0, current), 'main', 0);
      current += 1;
      if (current <= title.length) {
        typingTimer = setTimeout(tickMain, 25);
        return;
      }
      tickSub();
    }

    function tickSub() {
      root.querySelector('.pixel-terminal-sub').outerHTML = pixelText(sub.slice(0, subCurrent), 'sub', 1);
      subCurrent += 1;
      if (subCurrent <= sub.length) {
        typingTimer = setTimeout(tickSub, 18);
      }
    }

    tickMain();
  }

  function pixelText(text, kind) {
    var value = normalizePixelText(text);
    var cell = kind === 'main' ? 3.1 : 2.2;
    var gap = kind === 'main' ? 0.8 : 0.65;
    var charGap = kind === 'main' ? 2.1 : 1.6;
    var maxChars = kind === 'main' ? 18 : 27;
    var lines = wrapText(value, maxChars).slice(0, kind === 'main' ? 3 : 2);
    var lineHeight = 7 * (cell + gap) - gap + (kind === 'main' ? 7 : 5);
    var width = Math.max.apply(null, lines.map(function (line) {
      return pixelLineWidth(line, cell, gap, charGap);
    }).concat([1]));
    var height = Math.max(lineHeight, lines.length * lineHeight);
    var active = [];
    var ghost = [];
    lines.forEach(function (line, lineIndex) {
      drawPixelLine(line, 0, lineIndex * lineHeight, cell, gap, charGap, active, ghost);
    });
    return [
      '<svg class="pixel-terminal-' + escapeHtml(kind) + '" viewBox="0 0 ' + width + ' ' + height + '" preserveAspectRatio="xMinYMid meet" role="img" aria-label="' + escapeHtml(value) + '">',
      '<g class="pixel-terminal-ghost">' + ghost.join('') + '</g>',
      '<g class="pixel-terminal-active">' + active.join('') + '</g>',
      '</svg>'
    ].join('');
  }

  function drawPixelLine(line, offsetX, offsetY, cell, gap, charGap, active, ghost) {
    var x = offsetX;
    for (var c = 0; c < line.length; c += 1) {
      var glyph = GLYPHS[line.charAt(c)] || GLYPHS[' '];
      for (var row = 0; row < glyph.length; row += 1) {
        for (var col = 0; col < glyph[row].length; col += 1) {
          var rect = '<rect x="' + round(x + col * (cell + gap)) + '" y="' + round(offsetY + row * (cell + gap)) + '" width="' + cell + '" height="' + cell + '"></rect>';
          if (glyph[row].charAt(col) === '1') {
            active.push(rect);
          } else {
            ghost.push(rect);
          }
        }
      }
      x += glyph[0].length * (cell + gap) + charGap;
    }
  }

  function pixelLineWidth(text, cell, gap, charGap) {
    var width = 0;
    for (var i = 0; i < text.length; i += 1) {
      width += (GLYPHS[text.charAt(i)] || GLYPHS[' '])[0].length * (cell + gap) + charGap;
    }
    return Math.max(1, width - charGap);
  }

  function wrapText(text, maxChars) {
    var words = String(text || '').split(/\s+/);
    var lines = [];
    var line = '';
    words.forEach(function (word) {
      var next = line ? line + ' ' + word : word;
      if (next.length > maxChars && line) {
        lines.push(line);
        line = word;
      } else {
        line = next;
      }
    });
    if (line) {
      lines.push(line);
    }
    return lines.length ? lines : [''];
  }

  function normalizePixelText(value) {
    return String(value || '')
      .toUpperCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^A-Z0-9 .,\-\/]/g, ' ');
  }

  function setStep(nextIndex) {
    index = Math.max(0, Math.min(steps.length - 1, nextIndex));
    render();
  }

  function skip() {
    setStep(steps.length - 1);
  }

  function updateChrome(step) {
    if (statusLine) {
      statusLine.textContent = step.status;
    }
    if (nextButton) {
      nextButton.querySelector('.action-key-label').textContent = index === steps.length - 1 ? 'ENTRAR' : 'SIGUIENTE';
    }
    document.querySelectorAll('[data-tour-action="prev"]').forEach(function (button) {
      button.disabled = index === 0;
    });
  }

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[char];
    });
  }

  function round(value) {
    return String(Math.round(Number(value || 0) * 100) / 100);
  }

  document.addEventListener('click', function (event) {
    var actionButton = event.target.closest ? event.target.closest('[data-tour-action]') : null;
    if (actionButton) {
      var action = actionButton.getAttribute('data-tour-action');
      if (action === 'prev') {
        setStep(index - 1);
      } else if (action === 'skip' || action === 'finish') {
        skip();
      } else if (action === 'restart') {
        setStep(0);
      }
      return;
    }
    if (event.target.closest && event.target.closest('#onboarding-next')) {
      if (index >= steps.length - 1) {
        skip();
      } else {
        setStep(index + 1);
      }
    }
  });

  render();
}());
