const EAN13_LEFT_ODD = {
  0: "0001101",
  1: "0011001",
  2: "0010011",
  3: "0111101",
  4: "0100011",
  5: "0110001",
  6: "0101111",
  7: "0111011",
  8: "0110111",
  9: "0001011",
};

const EAN13_LEFT_EVEN = {
  0: "0100111",
  1: "0110011",
  2: "0011011",
  3: "0100001",
  4: "0011101",
  5: "0111001",
  6: "0000101",
  7: "0010001",
  8: "0001001",
  9: "0010111",
};

const EAN13_RIGHT = {
  0: "1110010",
  1: "1100110",
  2: "1101100",
  3: "1000010",
  4: "1011100",
  5: "1001110",
  6: "1010000",
  7: "1000100",
  8: "1001000",
  9: "1110100",
};

const EAN13_PARITY = {
  0: "OOOOOO",
  1: "OOEOEE",
  2: "OOEEOE",
  3: "OOEEEO",
  4: "OEOOEE",
  5: "OEEOOE",
  6: "OEEEOO",
  7: "OEOEOE",
  8: "OEOEEO",
  9: "OEEOEO",
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

export const calculateEan13CheckDigit = (baseValue) => {
  const digits = String(baseValue || "").replace(/\D/g, "");

  if (digits.length !== 12) {
    throw new Error("El codigo base debe tener 12 digitos.");
  }

  const total = digits.split("").reduce((acc, digit, index) => {
    const factor = index % 2 === 0 ? 1 : 3;
    return acc + Number(digit) * factor;
  }, 0);

  return (10 - (total % 10)) % 10;
};

export const isValidEan13 = (value) => {
  const digits = String(value || "").replace(/\D/g, "");

  if (digits.length !== 13) {
    return false;
  }

  return calculateEan13CheckDigit(digits.slice(0, 12)) === Number(digits[12]);
};

export const buildEan13Svg = (
  value,
  {
    moduleWidth = 2,
    barHeight = 74,
    guardHeight = 88,
    fontSize = 14,
    marginX = 14,
    marginY = 12,
  } = {}
) => {
  const digits = String(value || "").replace(/\D/g, "");

  if (!isValidEan13(digits)) {
    return "";
  }

  const firstDigit = digits[0];
  const leftDigits = digits.slice(1, 7).split("");
  const rightDigits = digits.slice(7).split("");
  const parity = EAN13_PARITY[firstDigit];

  let pattern = "101";

  leftDigits.forEach((digit, index) => {
    pattern += parity[index] === "E" ? EAN13_LEFT_EVEN[digit] : EAN13_LEFT_ODD[digit];
  });

  pattern += "01010";

  rightDigits.forEach((digit) => {
    pattern += EAN13_RIGHT[digit];
  });

  pattern += "101";

  const totalModules = pattern.length;
  const width = totalModules * moduleWidth + marginX * 2;
  const height = guardHeight + fontSize + marginY * 2 + 6;
  const guardRanges = new Set([
    ...Array.from({ length: 3 }, (_, index) => index),
    ...Array.from({ length: 5 }, (_, index) => 45 + index),
    ...Array.from({ length: 3 }, (_, index) => 92 + index),
  ]);

  const bars = pattern
    .split("")
    .map((bit, index) => {
      if (bit !== "1") {
        return "";
      }

      const x = marginX + index * moduleWidth;
      const currentHeight = guardRanges.has(index) ? guardHeight : barHeight;

      return `<rect x="${x}" y="${marginY}" width="${moduleWidth}" height="${currentHeight}" fill="#000000" />`;
    })
    .join("");

  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Codigo de barras ${escapeHtml(
      digits
    )}" shape-rendering="crispEdges">
      <rect width="${width}" height="${height}" rx="16" ry="16" fill="#ffffff" />
      ${bars}
      <text
        x="${width / 2}"
        y="${guardHeight + marginY + fontSize + 2}"
        text-anchor="middle"
        font-family="Arial, Helvetica, sans-serif"
        font-size="${fontSize}"
        font-weight="900"
        letter-spacing="1.8"
        fill="#000000"
      >${escapeHtml(digits)}</text>
    </svg>
  `;
};

export const buildBarcodeLabelHtml = ({
  codigo,
  nombre = "Producto",
  descripcion = "",
  subtitle = "Codigo interno generado por el sistema",
}) => {
  const svg = buildEan13Svg(codigo, {
    moduleWidth: 1.22,
    barHeight: 28,
    guardHeight: 34,
    fontSize: 8,
    marginX: 5,
    marginY: 4,
  });
  const productName = String(nombre || "").trim() || "Producto";

  if (!svg) {
    throw new Error("Solo se pueden imprimir etiquetas EAN-13 validas.");
  }

  return `
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(nombre)}</title>
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            padding: 8px;
            background: #f5f7fb;
            font-family: "Segoe UI", Arial, sans-serif;
            color: #000000;
            font-weight: 700;
          }
          .sheet {
            width: 50mm;
            min-height: 28mm;
            margin: 0 auto;
            padding: 3mm 2.5mm;
            border-radius: 8px;
            background: #ffffff;
            border: 1px solid #dbe4ff;
            box-shadow: 0 10px 20px rgba(15, 23, 42, 0.10);
            color: #000000;
          }
          .kicker {
            font-size: 7px;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: #2563eb;
            font-weight: 800;
            margin-bottom: 4px;
            text-align: center;
          }
          .eyebrow {
            font-size: 7px;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: #475569;
            font-weight: 800;
            margin-bottom: 3px;
            text-align: center;
          }
          h1 {
            margin: 0 0 1mm;
            font-size: 15px;
            font-weight: 900;
            text-align: center;
            line-height: 1.14;
            overflow-wrap: anywhere;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          p {
            margin: 0;
            text-align: center;
            color: #000000;
            font-size: 12.5px;
            font-weight: 800;
            line-height: 1.16;
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .svg-wrap {
            margin: 1mm 0 0.5mm;
            padding: 1mm;
            border-radius: 6px;
            background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
            border: 1px solid #e5e7eb;
          }
          .svg-wrap svg {
            display: block;
            width: 100%;
            max-width: 45mm;
            height: auto;
            margin: 0 auto;
            shape-rendering: crispEdges;
          }
          .code {
            margin-top: 0.5mm;
            text-align: center;
            font-size: 11.5px;
            font-weight: 900;
            letter-spacing: 0.04em;
          }
          .meta {
            margin-top: 6px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px;
            font-size: 13.5px;
            color: #000000;
            font-weight: 800;
          }
          .meta strong {
            display: block;
            margin-top: 1px;
            font-size: 15px;
            color: #000000;
          }
          .note {
            margin-top: 6px;
            padding-top: 6px;
            border-top: 1px dashed #cbd5e1;
            font-size: 8px;
            color: #64748b;
            text-align: center;
          }
          @media print {
            @page {
              size: 50mm auto;
              margin: 0;
            }
            body {
              padding: 0;
              background: #ffffff;
              color: #000000;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }
            .sheet {
              box-shadow: none;
              border: none;
              border-radius: 0;
              width: 50mm;
              min-height: 28mm;
              height: auto;
              padding: 2mm 2mm 1.5mm;
              overflow: hidden;
            }
            .eyebrow,
            .kicker,
            .note {
              display: none;
            }
            h1 {
              margin-bottom: 0.7mm;
              font-size: 13.5px;
              font-weight: 900;
              line-height: 1.14;
            }
            p {
              font-size: 11.5px;
              line-height: 1.12;
              color: #000000;
              font-weight: 800;
            }
            .svg-wrap {
              margin: 0.6mm 0 0;
              padding: 0;
              border: none;
              background: #ffffff;
            }
            .svg-wrap svg {
              max-width: 46mm;
              shape-rendering: crispEdges;
            }
            .code {
              margin-top: 0.35mm;
              font-size: 11px;
              font-weight: 900;
            }
            .meta {
              margin-top: 1mm;
              padding-top: 1mm;
              border-top: 1px dashed #cbd5e1;
              gap: 3mm;
              font-size: 11.5px;
              color: #000000;
              font-weight: 800;
              line-height: 1;
            }
            .meta strong {
              margin-top: 0.4mm;
              font-size: 13px;
              line-height: 1;
            }
          }
        </style>
      </head>
      <body>
        <article class="sheet">
          <div class="eyebrow">Nombre del producto</div>
          <div class="kicker">${escapeHtml(subtitle)}</div>
          <h1>${escapeHtml(productName)}</h1>
          ${descripcion ? `<p>${escapeHtml(descripcion)}</p>` : ""}
          <div class="svg-wrap">${svg}</div>
          <div class="code">${escapeHtml(codigo)}</div>
          <div class="meta">
            <div>
              Tipo
              <strong>EAN-13</strong>
            </div>
            <div>
              Origen
              <strong>Interno</strong>
            </div>
          </div>
          <div class="note">Etiqueta generada desde el modulo de productos con el nombre del producto.</div>
        </article>
      </body>
    </html>
  `;
};
