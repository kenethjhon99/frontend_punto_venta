const BUSINESS_INFO = {
  name: "POS System",
  subtitle: "Punto de venta, carwash y mecanica",
  footer: "Documento generado desde el sistema administrativo.",
  addressLines: ["Guatemala"],
  nit: "CF",
};

export const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

export const formatPrintCurrency = (value) =>
  new Intl.NumberFormat("es-GT", {
    style: "currency",
    currency: "GTQ",
    minimumFractionDigits: 2,
  }).format(Number(value || 0));

export const formatPrintDateTime = (value) => {
  if (!value) return "Sin fecha";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat("es-GT", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const buildMetaHtml = (metaRows = []) =>
  metaRows
    .filter((row) => row?.value !== undefined && row?.value !== null && String(row.value) !== "")
    .map(
      (row) => `
        <div class="meta-row">
          <div class="meta-label">${escapeHtml(row.label)}</div>
          <div class="meta-value">${escapeHtml(row.value)}</div>
        </div>
      `
    )
    .join("");

const buildCardsHtml = (cards = []) =>
  cards
    .filter((card) => card?.value !== undefined && card?.value !== null && String(card.value) !== "")
    .map(
      (card) => `
        <div class="summary-card">
          <div class="summary-label">${escapeHtml(card.label)}</div>
          <div class="summary-value">${escapeHtml(card.value)}</div>
        </div>
      `
    )
    .join("");

const normalizeCell = (cell) => {
  if (cell && typeof cell === "object" && "value" in cell) {
    return {
      value: cell.value,
      align: cell.align || "left",
      muted: Boolean(cell.muted),
    };
  }

  return {
    value: cell,
    align: "left",
    muted: false,
  };
};

const buildTableHtml = ({ headers = [], rows = [] }) => {
  if (!rows.length) {
    return '<div class="empty-state">No hay informacion disponible para este documento.</div>';
  }

  const thead = headers
    .map((header) => `<th>${escapeHtml(header)}</th>`)
    .join("");

  const tbody = rows
    .map((row) => {
      const cells = row
        .map((cell) => normalizeCell(cell))
        .map(
          (cell) => `
            <td class="${cell.align === "right" ? "align-right" : ""} ${cell.muted ? "muted-cell" : ""}">
              ${escapeHtml(cell.value)}
            </td>
          `
        )
        .join("");

      return `<tr>${cells}</tr>`;
    })
    .join("");

  return `
    <table class="detail-table">
      <thead>
        <tr>${thead}</tr>
      </thead>
      <tbody>
        ${tbody}
      </tbody>
    </table>
  `;
};

const buildSectionHtml = (title, content) => `
  <section class="section">
    <h2>${escapeHtml(title)}</h2>
    ${content}
  </section>
`;

const buildFormalDocument = ({
  title,
  subtitle,
  accent = "#0f172a",
  badge = "",
  metaRows = [],
  summaryCards = [],
  sections = [],
  footerNote = BUSINESS_INFO.footer,
}) => {
  const summaryHtml = buildCardsHtml(summaryCards);

  return `
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(title)}</title>
        <style>
          :root {
            color-scheme: light;
          }
          * {
            box-sizing: border-box;
          }
          body {
            margin: 0;
            padding: 24px;
            background: #f5f7fb;
            color: #111827;
            font-family: "Segoe UI", Arial, sans-serif;
          }
          .document {
            max-width: 900px;
            margin: 0 auto;
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 24px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(15, 23, 42, 0.12);
          }
          .hero {
            padding: 28px 30px 24px;
            color: #ffffff;
            background: linear-gradient(135deg, ${accent}, #111827);
          }
          .hero-top {
            display: flex;
            justify-content: space-between;
            gap: 16px;
            align-items: flex-start;
          }
          .brand-kicker {
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.12em;
            opacity: 0.8;
            margin-bottom: 10px;
          }
          .hero h1 {
            margin: 0 0 8px;
            font-size: 32px;
            line-height: 1.1;
          }
          .hero p {
            margin: 0;
            color: rgba(255,255,255,0.84);
            font-size: 14px;
          }
          .badge {
            border: 1px solid rgba(255,255,255,0.24);
            background: rgba(255,255,255,0.12);
            color: #ffffff;
            padding: 8px 14px;
            border-radius: 999px;
            font-size: 12px;
            font-weight: 700;
            white-space: nowrap;
          }
          .content {
            padding: 28px 30px 30px;
          }
          .meta-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
            margin-bottom: 22px;
          }
          .meta-row {
            border: 1px solid #e5e7eb;
            border-radius: 16px;
            padding: 12px 14px;
            background: #fbfdff;
          }
          .meta-label {
            color: #6b7280;
            font-size: 12px;
            margin-bottom: 6px;
          }
          .meta-value {
            font-size: 15px;
            font-weight: 700;
          }
          .summary-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 12px;
            margin-bottom: 22px;
          }
          .summary-card {
            border: 1px solid #dbe4ff;
            background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
            border-radius: 18px;
            padding: 14px 16px;
          }
          .summary-label {
            color: #64748b;
            font-size: 12px;
            margin-bottom: 8px;
          }
          .summary-value {
            font-size: 20px;
            font-weight: 800;
          }
          .section {
            margin-bottom: 22px;
          }
          .section h2 {
            margin: 0 0 12px;
            font-size: 16px;
          }
          .detail-table {
            width: 100%;
            border-collapse: collapse;
            overflow: hidden;
            border-radius: 16px;
            border: 1px solid #e5e7eb;
          }
          .detail-table th,
          .detail-table td {
            padding: 11px 12px;
            border-bottom: 1px solid #e5e7eb;
            font-size: 13px;
            vertical-align: top;
          }
          .detail-table th {
            text-align: left;
            background: #f8fafc;
            color: #475569;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.04em;
          }
          .detail-table tr:last-child td {
            border-bottom: none;
          }
          .align-right {
            text-align: right;
          }
          .muted-cell {
            color: #64748b;
          }
          .notes-box {
            border: 1px solid #e5e7eb;
            background: #fbfdff;
            border-radius: 18px;
            padding: 14px 16px;
            line-height: 1.65;
            color: #374151;
            font-size: 13px;
          }
          .empty-state {
            border: 1px dashed #cbd5e1;
            border-radius: 18px;
            padding: 18px;
            color: #64748b;
            font-style: italic;
          }
          .signatures {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 24px;
            margin-top: 28px;
          }
          .sign-line {
            border-top: 1px solid #cbd5e1;
            padding-top: 10px;
            text-align: center;
            color: #64748b;
            font-size: 12px;
          }
          .footer {
            margin-top: 28px;
            padding-top: 16px;
            border-top: 1px dashed #cbd5e1;
            display: flex;
            justify-content: space-between;
            gap: 16px;
            color: #64748b;
            font-size: 12px;
          }
          @media print {
            body {
              padding: 0;
              background: #ffffff;
            }
            .document {
              box-shadow: none;
              border: none;
              border-radius: 0;
              max-width: none;
            }
          }
        </style>
      </head>
      <body>
        <article class="document">
          <header class="hero">
            <div class="hero-top">
              <div>
                <div class="brand-kicker">${escapeHtml(BUSINESS_INFO.name)}</div>
                <h1>${escapeHtml(title)}</h1>
                <p>${escapeHtml(subtitle || BUSINESS_INFO.subtitle)}</p>
              </div>
              ${badge ? `<div class="badge">${escapeHtml(badge)}</div>` : ""}
            </div>
          </header>

          <div class="content">
            ${metaRows.length ? `<div class="meta-grid">${buildMetaHtml(metaRows)}</div>` : ""}
            ${summaryHtml ? `<div class="summary-grid">${summaryHtml}</div>` : ""}
            ${sections.join("")}

            <div class="signatures">
              <div class="sign-line">Entrega / emite</div>
              <div class="sign-line">Recibe / cliente</div>
            </div>

            <footer class="footer">
              <div>${escapeHtml(footerNote)}</div>
              <div>Generado: ${escapeHtml(formatPrintDateTime(new Date()))}</div>
            </footer>
          </div>
        </article>
      </body>
    </html>
  `;
};

export const openPrintWindow = ({ title, width = 1024, height = 900 }) => {
  const printWindow = window.open(
    "",
    "_blank",
    `width=${width},height=${height}`
  );

  if (!printWindow) {
    throw new Error("Tu navegador bloqueo la ventana emergente para imprimir.");
  }

  printWindow.document.open();
  printWindow.document.write(`
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(title)}</title>
        <style>
          body {
            margin: 0;
            min-height: 100vh;
            display: grid;
            place-items: center;
            background: #f8fafc;
            color: #0f172a;
            font-family: "Segoe UI", Arial, sans-serif;
          }
          .loading-box {
            padding: 24px 28px;
            border-radius: 20px;
            border: 1px solid #dbe4ff;
            background: #ffffff;
            box-shadow: 0 16px 30px rgba(15, 23, 42, 0.08);
            text-align: center;
          }
          .loading-box h1 {
            margin: 0 0 8px;
            font-size: 20px;
          }
          .loading-box p {
            margin: 0;
            color: #475569;
          }
        </style>
      </head>
      <body>
        <div class="loading-box">
          <h1>Preparando impresion</h1>
          <p>Generando ${escapeHtml(title)}...</p>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.document.title = title;
  return printWindow;
};

export const openPrintDocument = ({
  title,
  html,
  width = 1024,
  height = 900,
  printWindow = null,
}) => {
  const targetWindow = printWindow || openPrintWindow({ title, width, height });

  if (!targetWindow) {
    throw new Error("Tu navegador bloqueo la ventana emergente para imprimir.");
  }

  targetWindow.document.open();
  targetWindow.document.write(html);
  targetWindow.document.close();
  targetWindow.document.title = title;
  targetWindow.focus();
  targetWindow.print();
};

export const buildVentaTicketHtml = (ventaData) => {
  const venta = ventaData?.venta || {};
  const detalles = Array.isArray(ventaData?.detalles) ? ventaData.detalles : [];
  const creditoEmpleado = ventaData?.credito_empleado || null;
  const esCreditoEmpleado = Boolean(
    creditoEmpleado ||
      venta.id_empleado_credito ||
      String(venta.metodo_pago || "").toUpperCase() === "CREDITO_EMPLEADO"
  );
  const tipoComprobante = String(
    venta.comprobante_nombre || venta.tipo_comprobante || "TICKET"
  ).trim();
  const tipoNormalizado = String(venta.tipo_comprobante || "TICKET")
    .trim()
    .toUpperCase();
  const tituloFiscal =
    tipoNormalizado === "FACTURA"
      ? "FACTURA ELECTRONICA"
      : tipoNormalizado === "CCF"
        ? "CREDITO FISCAL ELECTRONICO"
        : "COMPROBANTE DE VENTA";
  const encabezadoFiscal =
    tipoNormalizado === "TICKET"
      ? "COMPROBANTE INTERNO"
      : "DOCUMENTO TRIBUTARIO ELECTRONICO";
  const clienteNombre = venta.cliente_nombre || "CONSUMIDOR FINAL";
  const clienteNit = venta.cliente_nit || "CF";
  const montoRecibido = Number(venta.monto_recibido || 0);
  const cambioEntregado = Number(venta.cambio_entregado || 0);
  const total = Number(venta.total || 0);
  const numeroComprobante = venta.numero_comprobante || `#${venta.id_venta || "-"}`;
  const businessLines = [
    encabezadoFiscal,
    tituloFiscal,
    BUSINESS_INFO.name,
    BUSINESS_INFO.subtitle,
    ...(Array.isArray(BUSINESS_INFO.addressLines) ? BUSINESS_INFO.addressLines : []),
    BUSINESS_INFO.nit ? `NIT ${BUSINESS_INFO.nit}` : "",
  ].filter(Boolean);

  const itemRows = detalles
    .map((detalle) => {
      const cantidad = Number(detalle.cantidad || 0) - Number(detalle.cantidad_anulada || 0);
      if (cantidad <= 0) return "";

      const descripcion = `${cantidad}.0 ${detalle.producto_nombre || "Producto"}`;
      const subtotal = formatPrintCurrency(cantidad * Number(detalle.precio_unitario || 0));

      return `
        <div class="item-row">
          <div class="item-name">${escapeHtml(descripcion)}</div>
          <div class="item-total">${escapeHtml(subtotal)}</div>
        </div>
      `;
    })
    .filter(Boolean)
    .join("");

  const notas = [
    venta.motivo_anulacion ? `Motivo anulacion: ${venta.motivo_anulacion}` : "",
    venta.usuario_nombre || venta.usuario_username
      ? `Atendido por: ${venta.usuario_nombre || venta.usuario_username}`
      : "",
  ]
    .filter(Boolean)
    .join("<br />");

  const creditoBannerHtml = esCreditoEmpleado
    ? (() => {
        const empleadoNombre =
          creditoEmpleado?.empleado_nombre || "Empleado";
        const empleadoCargo = creditoEmpleado?.empleado_cargo || "";
        const saldo = Number(
          creditoEmpleado?.saldo_pendiente ?? venta.total ?? 0
        );
        const fechaCobroRaw =
          creditoEmpleado?.fecha_cobro_estimada ?? creditoEmpleado?.fecha_cobro;
        let fechaCobroTxt = "-";
        if (fechaCobroRaw) {
          const d = new Date(fechaCobroRaw);
          if (!Number.isNaN(d.getTime())) {
            fechaCobroTxt = d.toLocaleDateString("es-GT", {
              weekday: "short",
              day: "2-digit",
              month: "short",
              year: "numeric",
            });
          }
        }
        return `
          <div class="credito-banner">
            <div class="credito-title">*** CREDITO A EMPLEADO ***</div>
            <div class="credito-line">
              ${escapeHtml(empleadoNombre.toUpperCase())}${
                empleadoCargo ? ` (${escapeHtml(empleadoCargo)})` : ""
              }
            </div>
            <div class="credito-saldo">
              SALDO ${escapeHtml(formatPrintCurrency(saldo))}
            </div>
            <div class="credito-line">
              Proximo cobro: ${escapeHtml(fechaCobroTxt)}
            </div>
            <div class="credito-footer">
              Esta venta NO se cobra hoy. Se descuenta del proximo pago.
            </div>
          </div>
        `;
      })()
    : "";

  return `
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(numeroComprobante)}</title>
        <style>
          * { box-sizing: border-box; }
          html, body { margin: 0; padding: 0; background: #ffffff; color: #111111; }
          body {
            font-family: "Courier New", Courier, monospace;
            font-size: 12px;
            line-height: 1.35;
          }
          .ticket {
            width: 80mm;
            margin: 0 auto;
            padding: 10px 8px 16px;
          }
          .center { text-align: center; }
          .header-line {
            white-space: pre-wrap;
            word-break: break-word;
          }
          .spacer { height: 10px; }
          .rule {
            border-top: 1px dashed #111111;
            margin: 10px 0;
          }
          .item-row,
          .summary-row,
          .meta-line {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            align-items: flex-start;
          }
          .item-row + .item-row { margin-top: 4px; }
          .item-name {
            flex: 1;
            min-width: 0;
            padding-right: 8px;
            word-break: break-word;
          }
          .item-total,
          .summary-value {
            white-space: nowrap;
            text-align: right;
          }
          .summary-row {
            font-size: 13px;
            margin-top: 2px;
          }
          .summary-row.total {
            font-size: 14px;
            font-weight: 700;
          }
          .meta-block {
            margin-top: 10px;
          }
          .meta-line { margin-top: 2px; }
          .muted { color: #222222; }
          .footer-note {
            text-align: center;
            margin-top: 12px;
            white-space: pre-wrap;
          }
          .credito-banner {
            border: 2px solid #111111;
            border-radius: 4px;
            padding: 8px 6px;
            margin-top: 10px;
            text-align: center;
            font-weight: 700;
          }
          .credito-banner .credito-title {
            font-size: 13px;
            letter-spacing: 0.08em;
            margin-bottom: 6px;
          }
          .credito-banner .credito-line {
            font-size: 12px;
            font-weight: 600;
            margin-top: 2px;
          }
          .credito-banner .credito-saldo {
            font-size: 14px;
            margin-top: 6px;
          }
          .credito-banner .credito-footer {
            font-weight: 400;
            font-size: 11px;
            margin-top: 6px;
            font-style: italic;
          }
          @media print {
            @page {
              size: 80mm auto;
              margin: 0;
            }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .ticket { width: 72mm; padding: 8px 6px 10px; }
          }
        </style>
      </head>
      <body>
        <div class="ticket">
          <div class="center">
            ${businessLines
              .map(
                (line) => `<div class="header-line">${escapeHtml(String(line).toUpperCase())}</div>`
              )
              .join("")}
          </div>

          <div class="spacer"></div>

          ${itemRows || '<div class="center">SIN PRODUCTOS</div>'}

          <div class="rule"></div>

          <div class="summary-row total">
            <div>Total</div>
            <div class="summary-value">${escapeHtml(formatPrintCurrency(total))}</div>
          </div>
          ${
            montoRecibido > 0
              ? `
                <div class="summary-row">
                  <div>Pago</div>
                  <div class="summary-value">${escapeHtml(formatPrintCurrency(montoRecibido))}</div>
                </div>
                <div class="summary-row">
                  <div>Cambio</div>
                  <div class="summary-value">${escapeHtml(formatPrintCurrency(cambioEntregado))}</div>
                </div>
              `
              : ""
          }

          ${creditoBannerHtml}

          <div class="rule"></div>

          ${
            esCreditoEmpleado
              ? ""
              : `
                <div class="meta-block">
                  <div>Nombre: ${escapeHtml(clienteNombre.toUpperCase())}</div>
                  <div>Nit: ${escapeHtml(String(clienteNit).toUpperCase())}</div>
                </div>
              `
          }

          <div class="spacer"></div>

          <div class="center muted">
            <div>Fecha ${escapeHtml(formatPrintDateTime(venta.fecha))}</div>
            <div>Serie ${escapeHtml(venta.serie_comprobante || "-")}</div>
            <div>${escapeHtml(tipoComprobante)} No. ${escapeHtml(numeroComprobante)}</div>
          </div>

          ${
            notas
              ? `
                <div class="rule"></div>
                <div class="footer-note">${notas}</div>
              `
              : ""
          }

          <div class="footer-note">
            ${escapeHtml(BUSINESS_INFO.footer)}
          </div>
        </div>
      </body>
    </html>
  `;
};

export const buildReparacionReciboHtml = (reciboData) => {
  const orden = reciboData?.orden || {};
  const productos = Array.isArray(reciboData?.productos) ? reciboData.productos : [];
  const resumen = reciboData?.resumen || {};

  const numero = `ORD-${String(orden.id_reparacion_orden || "0").padStart(5, "0")}`;
  const cliente = orden.nombre_cliente || "CONSUMIDOR FINAL";
  const vehiculo = [
    orden.tipo_vehiculo_nombre,
    orden.placa ? `Placa ${orden.placa}` : "",
    orden.color || "",
  ]
    .filter(Boolean)
    .join(" - ");
  const usuario = orden.usuario_nombre || orden.usuario_username || "Usuario";
  const tecnico = orden.tecnico_nombre || "Sin asignar";
  const descripcion =
    orden.servicio_descripcion ||
    orden.servicio_nombre ||
    orden.diagnostico_inicial ||
    "Servicio de reparacion";

  const totalServicio = Number(resumen.total_servicio || 0);
  const totalProductos = Number(resumen.total_productos || 0);
  const total = Number(resumen.total || 0);
  const montoRecibido = Number(resumen.monto_recibido || 0);
  const vuelto = Number(resumen.vuelto || 0);

  const businessLines = [
    "RECIBO DE SERVICIO",
    "TALLER MECANICO",
    BUSINESS_INFO.name,
    BUSINESS_INFO.subtitle,
    ...(Array.isArray(BUSINESS_INFO.addressLines) ? BUSINESS_INFO.addressLines : []),
    orden.sucursal_nombre ? `Sucursal: ${orden.sucursal_nombre}` : "",
  ].filter(Boolean);

  const serviceRow = `
    <div class="item-row">
      <div class="item-name">1 x ${escapeHtml(orden.servicio_nombre || "Servicio")}</div>
      <div class="item-total">${escapeHtml(formatPrintCurrency(totalServicio))}</div>
    </div>
  `;

  const productRows = productos
    .filter((p) => p.cobra_al_cliente)
    .map((p) => {
      const cantidad = Number(p.cantidad || 0);
      const subtotal = Number(p.subtotal_cobrado || 0);
      const nombre = `${cantidad} x ${p.producto_nombre || "Repuesto"}`;
      return `
        <div class="item-row">
          <div class="item-name">${escapeHtml(nombre)}</div>
          <div class="item-total">${escapeHtml(formatPrintCurrency(subtotal))}</div>
        </div>
      `;
    })
    .join("");

  const metodoPago = String(orden.metodo_pago || "EFECTIVO").toUpperCase();
  const estado = String(orden.estado_trabajo || orden.estado || "-").replaceAll("_", " ");

  return `
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(numero)}</title>
        <style>
          * { box-sizing: border-box; }
          html, body { margin: 0; padding: 0; background: #ffffff; color: #111111; }
          body {
            font-family: "Courier New", Courier, monospace;
            font-size: 12px;
            line-height: 1.35;
          }
          .ticket {
            width: 80mm;
            margin: 0 auto;
            padding: 10px 8px 16px;
          }
          .center { text-align: center; }
          .header-line { white-space: pre-wrap; word-break: break-word; font-weight: 700; }
          .spacer { height: 10px; }
          .rule { border-top: 1px dashed #111111; margin: 10px 0; }
          .item-row, .summary-row {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            align-items: flex-start;
          }
          .item-row + .item-row { margin-top: 4px; }
          .item-name { flex: 1; min-width: 0; padding-right: 8px; word-break: break-word; }
          .item-total, .summary-value { white-space: nowrap; text-align: right; }
          .summary-row { font-size: 13px; margin-top: 2px; }
          .summary-row.total { font-size: 15px; font-weight: 800; }
          .meta-block { margin-top: 6px; }
          .meta-block div { margin-top: 2px; }
          .label { font-weight: 700; }
          .muted { color: #333333; }
          .descripcion {
            font-size: 12px;
            padding: 6px 0;
            white-space: pre-wrap;
            word-break: break-word;
          }
          .footer-note { text-align: center; margin-top: 12px; white-space: pre-wrap; }
          @media print {
            @page { size: 80mm auto; margin: 0; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .ticket { width: 72mm; padding: 8px 6px 10px; }
          }
        </style>
      </head>
      <body>
        <div class="ticket">
          <div class="center">
            ${businessLines
              .map(
                (line) =>
                  `<div class="header-line">${escapeHtml(String(line).toUpperCase())}</div>`
              )
              .join("")}
          </div>

          <div class="spacer"></div>

          <div class="meta-block">
            <div><span class="label">Recibo:</span> ${escapeHtml(numero)}</div>
            <div><span class="label">Fecha:</span> ${escapeHtml(
              formatPrintDateTime(orden.fecha)
            )}</div>
            <div><span class="label">Usuario:</span> ${escapeHtml(usuario)}</div>
            <div><span class="label">Tecnico:</span> ${escapeHtml(tecnico)}</div>
            <div><span class="label">Estado:</span> ${escapeHtml(estado)}</div>
          </div>

          <div class="rule"></div>

          <div class="meta-block">
            <div><span class="label">Cliente:</span> ${escapeHtml(cliente.toUpperCase())}</div>
            ${vehiculo ? `<div><span class="label">Vehiculo:</span> ${escapeHtml(vehiculo)}</div>` : ""}
            ${
              orden.kilometraje
                ? `<div><span class="label">Km:</span> ${escapeHtml(String(orden.kilometraje))}</div>`
                : ""
            }
          </div>

          <div class="rule"></div>

          <div class="label">DESCRIPCION DEL SERVICIO</div>
          <div class="descripcion">${escapeHtml(descripcion)}</div>
          ${
            orden.observaciones
              ? `<div class="muted descripcion">Obs: ${escapeHtml(orden.observaciones)}</div>`
              : ""
          }

          <div class="rule"></div>

          ${serviceRow}
          ${productRows}

          <div class="rule"></div>

          ${
            totalProductos > 0
              ? `
                <div class="summary-row">
                  <div>Servicio</div>
                  <div class="summary-value">${escapeHtml(formatPrintCurrency(totalServicio))}</div>
                </div>
                <div class="summary-row">
                  <div>Repuestos</div>
                  <div class="summary-value">${escapeHtml(formatPrintCurrency(totalProductos))}</div>
                </div>
              `
              : ""
          }

          <div class="summary-row total">
            <div>TOTAL</div>
            <div class="summary-value">${escapeHtml(formatPrintCurrency(total))}</div>
          </div>

          ${
            montoRecibido > 0
              ? `
                <div class="summary-row">
                  <div>Metodo</div>
                  <div class="summary-value">${escapeHtml(metodoPago)}</div>
                </div>
                <div class="summary-row">
                  <div>Pago</div>
                  <div class="summary-value">${escapeHtml(formatPrintCurrency(montoRecibido))}</div>
                </div>
                <div class="summary-row">
                  <div>Vuelto</div>
                  <div class="summary-value">${escapeHtml(formatPrintCurrency(vuelto))}</div>
                </div>
              `
              : ""
          }

          <div class="rule"></div>

          <div class="footer-note">
            Gracias por confiar en nuestro taller.<br/>
            ${escapeHtml(BUSINESS_INFO.footer)}
          </div>
        </div>
      </body>
    </html>
  `;
};

export const buildCompraTicketHtml = (compraData) => {
  const compra = compraData?.compra || {};
  const detalles = Array.isArray(compraData?.detalles) ? compraData.detalles : [];
  const resumen = compraData?.resumen || {};
  const estado = String(compra.estado_real || compra.estado || "COMPLETADA").replaceAll("_", " ");

  return buildFormalDocument({
    title: "Comprobante de compra",
    subtitle: "Ingreso formal de inventario y documento de compra.",
    accent: "#7c3aed",
    badge: `Compra #${compra.id_compra || "-"}`,
    metaRows: [
      { label: "Proveedor", value: compra.proveedor_nombre || "-" },
      { label: "Documento", value: compra.no_documento || "Sin documento" },
      { label: "Metodo de pago", value: compra.metodo_pago || "-" },
      { label: "Fecha", value: formatPrintDateTime(compra.fecha || compra.fecha_compra) },
      {
        label: "Usuario",
        value: compra.usuario_nombre || compra.usuario_username || "Usuario",
      },
      { label: "Estado", value: estado },
    ],
    summaryCards: [
      { label: "Total original", value: formatPrintCurrency(resumen.total_original ?? compra.total) },
      { label: "Total actual", value: formatPrintCurrency(resumen.total_actual ?? compra.total) },
      {
        label: "Unidades activas",
        value: String(resumen.items_actual ?? detalles.reduce((acc, item) => acc + Number(item.cantidad || 0), 0)),
      },
    ],
    sections: [
      buildSectionHtml(
        "Detalle de productos",
        buildTableHtml({
          headers: ["Producto", "Cantidad", "Costo", "Subtotal", "Estado"],
          rows: detalles.map((detalle) => {
            const cantidad = Number(detalle.cantidad || 0) - Number(detalle.cantidad_anulada || 0);
            const subtotal = cantidad * Number(detalle.precio_compra || 0);

            return [
              `${detalle.producto_nombre || "Producto"} (${detalle.codigo_barras || "Sin codigo"})`,
              { value: cantidad, align: "right" },
              {
                value: formatPrintCurrency(detalle.precio_compra),
                align: "right",
              },
              { value: formatPrintCurrency(subtotal), align: "right" },
              detalle.estado || "ACTIVO",
            ];
          }),
        })
      ),
      compra.observaciones
        ? buildSectionHtml(
            "Observaciones",
            `<div class="notes-box">${escapeHtml(compra.observaciones)}</div>`
          )
        : "",
      compra.motivo_anulacion
        ? buildSectionHtml(
            "Motivo de anulacion",
            `<div class="notes-box">${escapeHtml(compra.motivo_anulacion)}</div>`
          )
        : "",
    ],
    footerNote: "Comprobante generado desde el modulo de compras.",
  });
};

const formatPrintDate = (value) => {
  if (!value) return "-";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat("es-GT", { dateStyle: "long" }).format(date);
};

const pad5 = (n) => String(Number(n) || 0).padStart(5, "0");

export const buildOrdenCompraHtml = (compraData, opciones = {}) => {
  const compra = compraData?.compra || {};
  const detalles = Array.isArray(compraData?.detalles) ? compraData.detalles : [];

  const moneda = compra.moneda || "GTQ";
  const diasCredito = Number(compra.dias_credito || 0);
  const terminoPago =
    compra.termino_pago ||
    (diasCredito > 0 ? `CREDITO ${diasCredito} DIAS` : "CONTADO");
  const tasaIva = Number(opciones.tasa_iva ?? 0.12);

  const empresa = {
    nombre: opciones.empresa_nombre || compra.sucursal_nombre || BUSINESS_INFO.name,
    direccion: opciones.empresa_direccion || compra.sucursal_direccion || BUSINESS_INFO.addressLines.join(", "),
    telefono: opciones.empresa_telefono || compra.sucursal_telefono || "",
    correo: opciones.empresa_correo || compra.sucursal_correo || "",
    nit: opciones.empresa_nit || BUSINESS_INFO.nit,
    logoUrl: opciones.empresa_logo || "/icono.png",
  };

  const detallesActivos = detalles.filter(
    (d) => Number(d.cantidad || 0) - Number(d.cantidad_anulada || 0) > 0
  );

  let subtotalSinIva = 0;
  let totalIva = 0;

  const filasProductos = detallesActivos
    .map((d) => {
      const cantidad = Number(d.cantidad || 0) - Number(d.cantidad_anulada || 0);
      const precioConIva = Number(d.precio_compra || 0);
      const precioSinIva = tasaIva > 0 ? precioConIva / (1 + tasaIva) : precioConIva;
      const subtotal = precioSinIva * cantidad;
      const total = precioConIva * cantidad;
      subtotalSinIva += subtotal;
      totalIva += total - subtotal;

      return `
        <tr>
          <td class="col-desc">
            <div class="prod-nombre">${escapeHtml(d.producto_nombre || "Producto")}</div>
            ${d.codigo_barras ? `<div class="prod-codigo">Codigo: ${escapeHtml(d.codigo_barras)}</div>` : ""}
          </td>
          <td class="col-num">${cantidad}</td>
          <td class="col-num">${formatPrintCurrency(precioSinIva)}</td>
          <td class="col-num">${formatPrintCurrency(precioConIva)}</td>
          <td class="col-num">${formatPrintCurrency(subtotal)}</td>
          <td class="col-num">${formatPrintCurrency(total)}</td>
        </tr>`;
    })
    .join("");

  const totalFinal = Number(compra.total ?? subtotalSinIva + totalIva);

  const numeroOrden = `OC-${pad5(compra.id_compra)}`;
  const fechaCompra = compra.fecha || compra.fecha_compra;
  const fechaLimite = compra.fecha_limite_pago || null;
  const fechaEntrega = opciones.fecha_entrega || compra.fecha_entrega || "";

  return `
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>Orden de compra ${escapeHtml(numeroOrden)}</title>
        <style>
          @page {
            size: A4;
            margin: 14mm 14mm 18mm 14mm;
          }
          :root { color-scheme: light; }
          * { box-sizing: border-box; }
          html, body {
            margin: 0;
            padding: 0;
            background: #eef1f6;
            color: #0f172a;
            font-family: "Segoe UI", Arial, sans-serif;
            font-size: 12.5px;
            line-height: 1.5;
          }
          .page {
            background: #fff;
            max-width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            padding: 16mm 14mm;
            box-shadow: 0 8px 28px rgba(15,23,42,0.08);
          }
          .oc-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 20px;
            padding-bottom: 14px;
            border-bottom: 3px double #0f172a;
          }
          .oc-brand {
            display: flex;
            gap: 14px;
            align-items: flex-start;
          }
          .oc-logo {
            width: 66px;
            height: 66px;
            object-fit: contain;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 4px;
            background: #fff;
          }
          .oc-brand-text h1 {
            margin: 0;
            font-size: 20px;
            letter-spacing: 0.02em;
          }
          .oc-brand-text .muted {
            margin: 2px 0 0;
            font-size: 12px;
            color: #475569;
          }
          .oc-title-block {
            text-align: right;
          }
          .oc-title-block .titulo {
            font-size: 22px;
            font-weight: 800;
            letter-spacing: 0.12em;
            color: #0f172a;
          }
          .oc-title-block .numero {
            margin-top: 4px;
            display: inline-block;
            padding: 6px 12px;
            border: 1.5px solid #0f172a;
            border-radius: 6px;
            font-weight: 700;
            font-size: 14px;
          }
          .oc-title-block .fecha {
            margin-top: 6px;
            font-size: 12px;
            color: #475569;
          }
          .parties {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            margin-top: 16px;
          }
          .party-card {
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 12px 14px;
          }
          .party-card h3 {
            margin: 0 0 8px;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #475569;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 6px;
          }
          .party-card .nombre {
            font-weight: 800;
            font-size: 14px;
            color: #0f172a;
          }
          .party-card dl {
            margin: 8px 0 0;
            display: grid;
            grid-template-columns: 90px 1fr;
            gap: 4px 10px;
            font-size: 12px;
          }
          .party-card dt { color: #64748b; }
          .party-card dd { margin: 0; color: #0f172a; }
          .info-general {
            margin-top: 16px;
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 10px;
          }
          .info-cell {
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 8px 10px;
            background: #f8fafc;
          }
          .info-cell .label {
            font-size: 10.5px;
            color: #64748b;
            text-transform: uppercase;
            letter-spacing: 0.06em;
          }
          .info-cell .value {
            font-size: 13px;
            font-weight: 700;
            margin-top: 2px;
            color: #0f172a;
          }
          .info-cell.is-credito {
            background: #fef3c7;
            border-color: #f59e0b;
          }
          .productos {
            margin-top: 18px;
          }
          .productos table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #0f172a;
          }
          .productos thead th {
            background: #0f172a;
            color: #fff;
            padding: 9px 8px;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            text-align: center;
          }
          .productos tbody td {
            padding: 8px 8px;
            border-bottom: 1px solid #e2e8f0;
            font-size: 12px;
            vertical-align: top;
          }
          .productos tbody tr:last-child td {
            border-bottom: none;
          }
          .col-desc { width: 36%; }
          .col-num {
            text-align: right;
            font-variant-numeric: tabular-nums;
            white-space: nowrap;
          }
          .productos thead th.col-num { text-align: right; }
          .prod-nombre { font-weight: 600; }
          .prod-codigo { font-size: 10.5px; color: #64748b; margin-top: 2px; }
          .fila-vacia td {
            height: 22px;
            border-bottom: 1px solid #e2e8f0;
          }
          .totales {
            margin-top: 10px;
            display: grid;
            grid-template-columns: 1fr 280px;
            gap: 16px;
          }
          .obs-box {
            border: 1px solid #cbd5e1;
            border-radius: 6px;
            padding: 10px 12px;
          }
          .obs-box h4 {
            margin: 0 0 6px;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #475569;
          }
          .obs-box p {
            margin: 0;
            font-size: 12px;
            white-space: pre-wrap;
          }
          .totales-tabla {
            width: 100%;
            border-collapse: collapse;
          }
          .totales-tabla td {
            padding: 6px 10px;
            font-size: 12.5px;
          }
          .totales-tabla td.label {
            color: #475569;
            text-align: right;
          }
          .totales-tabla td.value {
            text-align: right;
            font-variant-numeric: tabular-nums;
            font-weight: 600;
          }
          .totales-tabla tr.total-final td {
            border-top: 2px solid #0f172a;
            border-bottom: 2px solid #0f172a;
            background: #0f172a;
            color: #fff;
            font-size: 14px;
            font-weight: 800;
            padding: 10px;
          }
          .firmas {
            margin-top: 40px;
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 28px;
          }
          .firma-box {
            text-align: center;
            padding-top: 40px;
            border-top: 1px solid #0f172a;
            font-size: 11.5px;
          }
          .firma-box .cargo {
            color: #64748b;
            font-size: 10.5px;
            margin-top: 2px;
          }
          .pie {
            margin-top: 28px;
            padding-top: 10px;
            border-top: 1px dashed #94a3b8;
            font-size: 10.5px;
            color: #64748b;
            text-align: center;
          }
          @media print {
            body { background: #fff; }
            .page { box-shadow: none; margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="page">
          <header class="oc-header">
            <div class="oc-brand">
              <img class="oc-logo" src="${escapeHtml(empresa.logoUrl)}" alt="logo" onerror="this.style.display='none'" />
              <div class="oc-brand-text">
                <h1>${escapeHtml(empresa.nombre)}</h1>
                ${empresa.direccion ? `<p class="muted">${escapeHtml(empresa.direccion)}</p>` : ""}
                ${empresa.telefono ? `<p class="muted">Tel: ${escapeHtml(empresa.telefono)}</p>` : ""}
                ${empresa.correo ? `<p class="muted">${escapeHtml(empresa.correo)}</p>` : ""}
                ${empresa.nit ? `<p class="muted">NIT: ${escapeHtml(empresa.nit)}</p>` : ""}
              </div>
            </div>
            <div class="oc-title-block">
              <div class="titulo">ORDEN DE COMPRA</div>
              <div class="numero">No. ${escapeHtml(numeroOrden)}</div>
              <div class="fecha">Emitida: ${escapeHtml(formatPrintDate(fechaCompra))}</div>
            </div>
          </header>

          <section class="parties">
            <div class="party-card">
              <h3>Proveedor</h3>
              <div class="nombre">${escapeHtml(compra.proveedor_nombre || "-")}</div>
              <dl>
                ${compra.proveedor_nit ? `<dt>NIT</dt><dd>${escapeHtml(compra.proveedor_nit)}</dd>` : ""}
                ${compra.proveedor_direccion ? `<dt>Direccion</dt><dd>${escapeHtml(compra.proveedor_direccion)}</dd>` : ""}
                ${compra.proveedor_telefono_empresa ? `<dt>Telefono</dt><dd>${escapeHtml(compra.proveedor_telefono_empresa)}</dd>` : ""}
                ${compra.proveedor_nombre_viajero ? `<dt>Viajero</dt><dd>${escapeHtml(compra.proveedor_nombre_viajero)}</dd>` : ""}
                ${compra.proveedor_telefono_viajero ? `<dt>Tel. viajero</dt><dd>${escapeHtml(compra.proveedor_telefono_viajero)}</dd>` : ""}
                ${compra.proveedor_correo ? `<dt>Correo</dt><dd>${escapeHtml(compra.proveedor_correo)}</dd>` : ""}
              </dl>
            </div>

            <div class="party-card">
              <h3>Datos del comprador</h3>
              <div class="nombre">${escapeHtml(empresa.nombre)}</div>
              <dl>
                ${empresa.nit ? `<dt>NIT</dt><dd>${escapeHtml(empresa.nit)}</dd>` : ""}
                ${empresa.direccion ? `<dt>Direccion</dt><dd>${escapeHtml(empresa.direccion)}</dd>` : ""}
                ${empresa.telefono ? `<dt>Telefono</dt><dd>${escapeHtml(empresa.telefono)}</dd>` : ""}
                ${empresa.correo ? `<dt>Correo</dt><dd>${escapeHtml(empresa.correo)}</dd>` : ""}
                <dt>Recibe</dt><dd>${escapeHtml(compra.usuario_nombre || compra.usuario_username || "-")}</dd>
              </dl>
            </div>
          </section>

          <section class="info-general">
            <div class="info-cell">
              <div class="label">Fecha</div>
              <div class="value">${escapeHtml(formatPrintDate(fechaCompra))}</div>
            </div>
            <div class="info-cell">
              <div class="label">Moneda</div>
              <div class="value">${escapeHtml(moneda)}</div>
            </div>
            <div class="info-cell ${diasCredito > 0 ? "is-credito" : ""}">
              <div class="label">Termino de pago</div>
              <div class="value">${escapeHtml(terminoPago)}</div>
            </div>
            <div class="info-cell ${diasCredito > 0 ? "is-credito" : ""}">
              <div class="label">Dias de credito</div>
              <div class="value">${diasCredito > 0 ? `Credito ${diasCredito} dias` : "Contado"}</div>
            </div>
            <div class="info-cell">
              <div class="label">Fecha limite de pago</div>
              <div class="value">${escapeHtml(fechaLimite ? formatPrintDate(fechaLimite) : "-")}</div>
            </div>
            <div class="info-cell">
              <div class="label">Fecha de entrega</div>
              <div class="value">${escapeHtml(fechaEntrega ? formatPrintDate(fechaEntrega) : "Inmediata")}</div>
            </div>
            <div class="info-cell">
              <div class="label">Documento</div>
              <div class="value">${escapeHtml(compra.no_documento || "-")}</div>
            </div>
            <div class="info-cell">
              <div class="label">Tipo documento</div>
              <div class="value">${escapeHtml(compra.tipo_documento || "FACTURA")}</div>
            </div>
          </section>

          <section class="productos">
            <table>
              <thead>
                <tr>
                  <th class="col-desc">Descripcion del bien o producto</th>
                  <th class="col-num">Cant.</th>
                  <th class="col-num">Precio sin IVA</th>
                  <th class="col-num">Precio con IVA</th>
                  <th class="col-num">Subtotal</th>
                  <th class="col-num">Total</th>
                </tr>
              </thead>
              <tbody>
                ${filasProductos || `<tr class="fila-vacia"><td colspan="6" style="text-align:center;color:#64748b;">Sin productos</td></tr>`}
              </tbody>
            </table>
          </section>

          <section class="totales">
            <div class="obs-box">
              <h4>Observaciones y condiciones</h4>
              <p>${escapeHtml(compra.observaciones || "Sin observaciones adicionales.")}</p>
              ${diasCredito > 0
                ? `<p style="margin-top:8px;"><strong>Condicion de pago:</strong> Credito ${diasCredito} dias. Fecha limite: ${escapeHtml(formatPrintDate(fechaLimite))}.</p>`
                : `<p style="margin-top:8px;"><strong>Condicion de pago:</strong> Contado.</p>`}
            </div>

            <table class="totales-tabla">
              <tbody>
                <tr>
                  <td class="label">Subtotal (sin IVA)</td>
                  <td class="value">${formatPrintCurrency(subtotalSinIva)}</td>
                </tr>
                <tr>
                  <td class="label">IVA (${Math.round(tasaIva * 100)}%)</td>
                  <td class="value">${formatPrintCurrency(totalIva)}</td>
                </tr>
                <tr class="total-final">
                  <td class="label" style="color:#fff;">TOTAL ${escapeHtml(moneda)}</td>
                  <td class="value">${formatPrintCurrency(totalFinal)}</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section class="firmas">
            <div class="firma-box">
              Elaborado por
              <div class="cargo">${escapeHtml(compra.usuario_nombre || compra.usuario_username || "Usuario")}</div>
              <div class="cargo">Compras</div>
            </div>
            <div class="firma-box">
              Autorizado por
              <div class="cargo">Nombre y firma</div>
              <div class="cargo">Gerencia / Administracion</div>
            </div>
            <div class="firma-box">
              Recibido proveedor
              <div class="cargo">${escapeHtml(compra.proveedor_nombre_viajero || compra.proveedor_nombre || "Proveedor")}</div>
              <div class="cargo">Sello y firma</div>
            </div>
          </section>

          <div class="pie">
            Documento generado electronicamente &bull; ${escapeHtml(empresa.nombre)} &bull; ${escapeHtml(numeroOrden)}
          </div>
        </div>
      </body>
    </html>
  `;
};

export const buildAutolavadoTicketHtml = (orden) =>
  buildFormalDocument({
    title: "Orden de autolavado",
    subtitle: "Ticket formal de recepcion y servicio de lavado.",
    accent: "#1d4ed8",
    badge: `Orden #${orden?.id_autolavado_orden || "-"}`,
    metaRows: [
      { label: "Vehiculo", value: orden?.tipo_vehiculo_nombre || "-" },
      { label: "Servicio", value: orden?.servicio_nombre || "-" },
      { label: "Cliente", value: orden?.nombre_cliente || "Consumidor final" },
      { label: "Placa", value: orden?.placa || "Sin placa" },
      { label: "Color", value: orden?.color || "Sin color" },
      { label: "Metodo de pago", value: orden?.metodo_pago || "-" },
      { label: "Estado", value: String(orden?.estado_trabajo || "RECIBIDO").replaceAll("_", " ") },
      { label: "Tecnico asignado", value: orden?.tecnico_nombre || orden?.tecnico_username || "Sin asignar" },
      { label: "Fecha", value: formatPrintDateTime(orden?.fecha) },
    ],
    summaryCards: [
      { label: "Monto cobrado", value: formatPrintCurrency(orden?.monto_cobrado) },
      { label: "Duracion estimada", value: `${Number(orden?.duracion_minutos || 0)} min` },
      { label: "Recibido por", value: orden?.usuario_nombre || orden?.username || "Usuario" },
    ],
    sections: [
      buildSectionHtml(
        "Datos del servicio",
        `<div class="notes-box">
          <div><strong>Observaciones:</strong> ${escapeHtml(orden?.observaciones || "Sin observaciones")}</div>
        </div>`
      ),
    ],
    footerNote: "Ticket generado desde el modulo de autolavado.",
  });

export const buildReparacionTicketHtml = (orden) =>
  buildFormalDocument({
    title: "Orden de reparacion",
    subtitle: "Ticket formal de recepcion y control de trabajo mecanico.",
    accent: "#b45309",
    badge: `Orden #${orden?.id_reparacion_orden || "-"}`,
    metaRows: [
      { label: "Vehiculo", value: orden?.tipo_vehiculo_nombre || "-" },
      { label: "Servicio", value: orden?.servicio_nombre || "-" },
      { label: "Cliente", value: orden?.nombre_cliente || "Consumidor final" },
      { label: "Placa", value: orden?.placa || "Sin placa" },
      { label: "Color", value: orden?.color || "Sin color" },
      { label: "Kilometraje", value: orden?.kilometraje || "No registrado" },
      { label: "Estado trabajo", value: String(orden?.estado_trabajo || "RECIBIDO").replaceAll("_", " ") },
      { label: "Estado cobro", value: orden?.estado || "PENDIENTE" },
      { label: "Tecnico asignado", value: orden?.tecnico_nombre || orden?.tecnico_username || "Sin asignar" },
      { label: "Metodo de pago", value: orden?.metodo_pago || "Pendiente" },
      { label: "Fecha", value: formatPrintDateTime(orden?.fecha) },
    ],
    summaryCards: [
      { label: "Mano de obra", value: formatPrintCurrency(orden?.precio_base || orden?.servicio_precio_base) },
      { label: "Repuestos cobrados", value: formatPrintCurrency(orden?.productos_total_cobrado || 0) },
      { label: "Total orden", value: formatPrintCurrency(orden?.monto_cobrado || 0) },
    ],
    sections: [
      buildSectionHtml(
        "Diagnostico y observaciones",
        `<div class="notes-box">
          <div><strong>Diagnostico inicial:</strong> ${escapeHtml(orden?.diagnostico_inicial || "Sin diagnostico")}</div>
          <div style="margin-top:10px;"><strong>Observaciones:</strong> ${escapeHtml(orden?.observaciones || "Sin observaciones")}</div>
        </div>`
      ),
      buildSectionHtml(
        "Productos usados",
        buildTableHtml({
          headers: ["Producto", "Cantidad", "Precio", "Cobro", "Subtotal"],
          rows: (orden?.productos_usados || []).map((producto) => [
            `${producto.producto_nombre || "Producto"} (${producto.codigo_barras || "Sin codigo"})`,
            { value: producto.cantidad || 0, align: "right" },
            {
              value: formatPrintCurrency(producto.precio_unitario),
              align: "right",
            },
            producto.cobra_al_cliente ? "Cobrado" : "Uso interno",
            {
              value: formatPrintCurrency(
                producto.cobra_al_cliente ? producto.subtotal_cobrado : 0
              ),
              align: "right",
            },
          ]),
        })
      ),
    ],
    footerNote: "Ticket generado desde el modulo de reparacion.",
  });

export const buildCajaCorteHtml = ({ sesion, resumen, movimientos = [] }) =>
    buildFormalDocument({
    title: "Corte de caja",
    subtitle: "Resumen formal de apertura, movimientos y cierre de caja.",
    accent: "#0f172a",
    badge: `Sesion #${sesion?.id_caja_sesion || "-"}`,
    metaRows: [
      { label: "Usuario", value: sesion?.nombre || sesion?.username || "Usuario" },
      { label: "Estado", value: sesion?.estado || "-" },
      { label: "Fecha apertura", value: formatPrintDateTime(sesion?.fecha_apertura) },
      {
        label: "Fecha cierre",
        value: sesion?.fecha_cierre ? formatPrintDateTime(sesion.fecha_cierre) : "Pendiente",
      },
      {
        label: "Observaciones apertura",
        value: sesion?.observaciones_apertura || "Sin observaciones",
      },
      {
        label: "Observaciones cierre",
        value: sesion?.observaciones_cierre || "Sin observaciones",
      },
    ],
    summaryCards: [
      { label: "Apertura", value: formatPrintCurrency(resumen?.monto_apertura) },
      { label: "Ventas efectivo", value: formatPrintCurrency(resumen?.total_efectivo) },
      {
        label: "Servicios efectivo",
        value: formatPrintCurrency(resumen?.total_servicios_efectivo || 0),
      },
      {
        label: "Reparaciones efectivo",
        value: formatPrintCurrency(resumen?.total_reparaciones_efectivo || 0),
      },
      { label: "Ingresos manuales", value: formatPrintCurrency(resumen?.ingresos_manuales) },
      { label: "Egresos manuales", value: formatPrintCurrency(resumen?.egresos_manuales) },
      { label: "Cierre calculado", value: formatPrintCurrency(resumen?.cierre_calculado) },
      {
        label: "Cierre reportado",
        value: formatPrintCurrency(resumen?.monto_cierre_reportado || 0),
      },
      { label: "Diferencia", value: formatPrintCurrency(resumen?.diferencia || 0) },
      {
        label: "No cobrados",
        value: String(
          Number(resumen?.ventas_no_cobradas || 0) +
            Number(resumen?.servicios_no_cobrados || 0) +
            Number(resumen?.reparaciones_no_cobradas || 0)
        ),
      },
      {
        label: "Admins validaron",
        value:
          (resumen?.no_cobrados_validados_admins || [])
            .map((item) => item.nombre || item.username)
            .filter(Boolean)
            .join(", ") || "Sin validaciones",
      },
    ],
      sections: [
        buildSectionHtml(
          "Registros no cobrados",
          buildTableHtml({
            headers: ["Modulo", "Cantidad"],
            rows: [
              ["Ventas", { value: Number(resumen?.ventas_no_cobradas || 0), align: "right" }],
              ["Autolavado", { value: Number(resumen?.servicios_no_cobrados || 0), align: "right" }],
              ["Reparacion", { value: Number(resumen?.reparaciones_no_cobradas || 0), align: "right" }],
              [
                "Pendientes al generar el reporte",
                { value: Number(resumen?.no_cobrados_pendientes_count || 0), align: "right" },
              ],
            ],
          }) +
            (Number(resumen?.no_cobrados_pendientes_count || 0) === 0 &&
            Number(
              Number(resumen?.ventas_no_cobradas || 0) +
                Number(resumen?.servicios_no_cobrados || 0) +
                Number(resumen?.reparaciones_no_cobradas || 0)
            ) > 0
              ? `<div class="notes-box">Los registros no cobrados de esta sesion ya fueron validados con autorizacion administrativa para permitir el cierre.</div>`
              : "")
        ),
        buildSectionHtml(
          "Validacion administrativa de no cobrados",
          (resumen?.no_cobrados_validados_count || 0) > 0
            ? buildTableHtml({
                headers: ["Modulo", "Referencia", "Admin", "Fecha", "Nota"],
                rows: (resumen?.no_cobrados_validados || []).map((item) => [
                  item.modulo || "-",
                  item.documento || item.referencia || "-",
                  item.admin_nombre || item.admin_username || "Sin dato",
                  formatPrintDateTime(item.fecha_validacion),
                  item.nota_validacion || "Sin nota",
                ]),
              })
            : '<div class="notes-box">No hubo validaciones administrativas de no cobro en esta sesion.</div>'
        ),
        buildSectionHtml(
          "Conciliacion por metodo de pago",
          buildTableHtml({
            headers: ["Concepto", "Monto"],
            rows: [
              ["Efectivo segun sistema", { value: formatPrintCurrency(resumen?.conciliacion?.efectivo_sistema), align: "right" }],
              ["Tarjeta", { value: formatPrintCurrency(resumen?.conciliacion?.total_tarjeta), align: "right" }],
              ["Transferencia", { value: formatPrintCurrency(resumen?.conciliacion?.total_transferencia), align: "right" }],
              ["Credito", { value: formatPrintCurrency(resumen?.conciliacion?.total_credito), align: "right" }],
              ["Total no efectivo", { value: formatPrintCurrency(resumen?.conciliacion?.total_no_efectivo), align: "right" }],
              ["Efectivo reportado", { value: formatPrintCurrency(resumen?.conciliacion?.efectivo_reportado || 0), align: "right" }],
              ["Diferencia", { value: formatPrintCurrency(resumen?.conciliacion?.diferencia_efectivo || 0), align: "right" }],
            ],
          })
        ),
        buildSectionHtml(
          "Gastos por categoria",
          buildTableHtml({
            headers: ["Categoria", "Movimientos", "Total"],
            rows: (resumen?.gastos_por_categoria || []).map((gasto) => [
              gasto.categoria || "SIN_CATEGORIA",
              { value: gasto.cantidad || 0, align: "right" },
              { value: formatPrintCurrency(gasto.total), align: "right" },
            ]),
          })
        ),
        buildSectionHtml(
          "Movimientos manuales",
          buildTableHtml({
          headers: ["Fecha", "Tipo", "Categoria", "Descripcion", "Usuario", "Monto"],
          rows: movimientos.map((movimiento) => [
            formatPrintDateTime(movimiento.fecha),
            movimiento.tipo || "-",
            movimiento.categoria || "Sin categoria",
            movimiento.descripcion || "Sin descripcion",
            movimiento.nombre || movimiento.username || "Usuario",
            { value: formatPrintCurrency(movimiento.monto), align: "right" },
          ]),
        })
      ),
    ],
    footerNote: "Corte generado desde el modulo de caja.",
  });

export const buildCajaNoCobrosValidadosHtml = ({ sesion, resumen }) =>
  buildFormalDocument({
    title: "Validaciones administrativas de no cobro",
    subtitle: "Detalle de autorizaciones aplicadas durante la sesion de caja.",
    accent: "#15803d",
    badge: `Sesion #${sesion?.id_caja_sesion || "-"}`,
    metaRows: [
      { label: "Usuario de caja", value: sesion?.nombre || sesion?.username || "Usuario" },
      { label: "Fecha apertura", value: formatPrintDateTime(sesion?.fecha_apertura) },
      {
        label: "Fecha cierre",
        value: sesion?.fecha_cierre ? formatPrintDateTime(sesion.fecha_cierre) : "Pendiente",
      },
      {
        label: "Admins validadores",
        value:
          (resumen?.no_cobrados_validados_admins || [])
            .map((item) => item.nombre || item.username)
            .filter(Boolean)
            .join(", ") || "Sin validaciones",
      },
    ],
    summaryCards: [
      {
        label: "Registros validados",
        value: String(Number(resumen?.no_cobrados_validados_count || 0)),
      },
      {
        label: "Pendientes actuales",
        value: String(Number(resumen?.no_cobrados_pendientes_count || 0)),
      },
    ],
    sections: [
      buildSectionHtml(
        "Detalle de validaciones",
        (resumen?.no_cobrados_validados_count || 0) > 0
          ? buildTableHtml({
              headers: ["Modulo", "Referencia", "Admin", "Fecha", "Nota"],
              rows: (resumen?.no_cobrados_validados || []).map((item) => [
                item.modulo || "-",
                item.documento || item.referencia || "-",
                item.admin_nombre || item.admin_username || "Sin dato",
                formatPrintDateTime(item.fecha_validacion),
                item.nota_validacion || "Sin nota",
              ]),
            })
          : '<div class="notes-box">No existen validaciones administrativas registradas para esta sesion.</div>'
      ),
    ],
    footerNote: "Documento generado desde el cierre y validacion administrativa de caja.",
  });

export const buildKardexHtml = ({
  producto = null,
  movimientos = [],
  filtros = {},
  resumen = {},
}) =>
  (() => {
    const ultimoMovimiento = movimientos[0] || null;
    const valorInventario = producto
      ? Number(producto.existencia || 0) * Number(producto.precio_compra || 0)
      : 0;

    return buildFormalDocument({
    title: "Kardex de inventario",
    subtitle: "Trazabilidad formal de entradas, salidas y ajustes de stock.",
    accent: "#1f2937",
    badge: producto
      ? `Producto #${producto.id_producto || "-"}`
      : "Kardex general",
    metaRows: [
      { label: "Producto", value: producto?.nombre || "Todos los productos" },
      { label: "Codigo", value: producto?.codigo_barras || "Todos" },
      { label: "Desde", value: filtros?.desde || "Sin filtro" },
      { label: "Hasta", value: filtros?.hasta || "Sin filtro" },
      { label: "Tipo", value: filtros?.tipo || "Todos" },
      { label: "Busqueda", value: filtros?.q || "Sin filtro" },
    ],
    summaryCards: [
      {
        label: "Stock actual",
        value: producto
          ? String(Number(producto.existencia || 0))
          : `${movimientos.length} movimiento(s)`,
      },
      {
        label: "Entradas visibles",
        value: String(Number(resumen?.entradas || 0)),
      },
      {
        label: "Salidas visibles",
        value: String(Number(resumen?.salidas || 0)),
      },
      {
        label: "Ajustes visibles",
        value: String(Number(resumen?.ajustes || 0)),
      },
      producto
        ? {
            label: "Valor estimado stock",
            value: formatPrintCurrency(valorInventario),
          }
        : null,
      ultimoMovimiento
        ? {
            label: "Ultimo movimiento",
            value: `${ultimoMovimiento.tipo} | ${formatPrintDateTime(ultimoMovimiento.fecha)}`,
          }
        : null,
      producto
        ? {
            label: "Stock minimo",
            value: String(Number(producto.stock_minimo || 0)),
          }
        : null,
      producto?.ubicacion
        ? {
            label: "Ubicacion",
            value: producto.ubicacion,
          }
        : null,
    ],
    sections: [
      buildSectionHtml(
        "Movimientos de stock",
        buildTableHtml({
          headers: [
            "Fecha",
            "Producto",
            "Tipo",
            "Cantidad",
            "Antes",
            "Despues",
            "Motivo",
            "Usuario",
          ],
          rows: movimientos.map((movimiento) => [
            formatPrintDateTime(movimiento.fecha),
            `${movimiento.producto_nombre || "Producto"} (${movimiento.producto_codigo_barras || "Sin codigo"})`,
            movimiento.tipo || "-",
            { value: Number(movimiento.cantidad || 0), align: "right" },
            { value: Number(movimiento.existencia_antes || 0), align: "right" },
            { value: Number(movimiento.existencia_despues || 0), align: "right" },
            movimiento.motivo || "Sin detalle",
            movimiento.usuario_nombre || movimiento.usuario_username || "Sistema",
          ]),
        })
      ),
    ],
    footerNote: "Kardex generado desde el modulo de inventario.",
    });
  })();

export const buildNotaTrasladoHtml = (trasladoData, opciones = {}) => {
  const traslado = trasladoData?.traslado || {};
  const detalles = Array.isArray(trasladoData?.detalles) ? trasladoData.detalles : [];
  const movimientos = Array.isArray(trasladoData?.movimientos) ? trasladoData.movimientos : [];

  const empresa = {
    nombre: opciones.empresa_nombre || BUSINESS_INFO.name,
    direccion: opciones.empresa_direccion || BUSINESS_INFO.addressLines.join(", "),
    telefono: opciones.empresa_telefono || "",
    correo: opciones.empresa_correo || "",
    nit: opciones.empresa_nit || BUSINESS_INFO.nit,
    logoUrl: opciones.empresa_logo || "/icono.png",
  };

  const estado = String(traslado.estado || "").toUpperCase();
  const anulado = estado === "ANULADO";

  const folio = traslado.folio || `TR-${pad5(traslado.id_traslado)}`;
  const totalItems = Number(traslado.total_items || detalles.length || 0);
  const totalUnidades = Number(
    traslado.total_unidades ||
      detalles.reduce((acc, d) => acc + Number(d.cantidad || 0), 0)
  );
  const totalValor = Number(
    traslado.total_valorizado ||
      detalles.reduce((acc, d) => acc + Number(d.subtotal || 0), 0)
  );

  const filasProductos = detalles.length
    ? detalles
        .map((d, idx) => {
          const cantidad = Number(d.cantidad || 0);
          const costo = Number(d.costo_unitario || 0);
          const subtotal = Number(d.subtotal || cantidad * costo);
          return `
            <tr>
              <td class="col-num">${idx + 1}</td>
              <td class="col-desc">
                <div class="prod-nombre">${escapeHtml(d.producto_nombre || "Producto")}</div>
                ${d.codigo_barras ? `<div class="prod-codigo">Codigo: ${escapeHtml(d.codigo_barras)}</div>` : ""}
              </td>
              <td class="col-num">${cantidad}</td>
              <td class="col-num">${formatPrintCurrency(costo)}</td>
              <td class="col-num">${formatPrintCurrency(subtotal)}</td>
            </tr>`;
        })
        .join("")
    : `<tr><td colspan="5" class="empty-row">Sin renglones registrados.</td></tr>`;

  const filasMovimientos = movimientos.length
    ? movimientos
        .map((m) => {
          const tipo = String(m.tipo || "").toUpperCase();
          return `
            <tr>
              <td><span class="chip chip-${tipo === "ENTRADA" ? "in" : "out"}">${escapeHtml(tipo || "-")}</span></td>
              <td>${escapeHtml(m.bodega_nombre || "-")}</td>
              <td class="col-num">${Number(m.cantidad || 0)}</td>
              <td class="col-num">${Number(m.existencia_antes || 0)}</td>
              <td class="col-num">${Number(m.existencia_despues || 0)}</td>
              <td class="muted-cell">${escapeHtml(m.motivo || "")}</td>
            </tr>`;
        })
        .join("")
    : "";

  const seccionMovimientos = movimientos.length
    ? `
        <section class="section">
          <h2 class="section-title">Movimientos de stock generados</h2>
          <table class="data-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Bodega</th>
                <th class="col-num">Cantidad</th>
                <th class="col-num">Antes</th>
                <th class="col-num">Despues</th>
                <th>Motivo</th>
              </tr>
            </thead>
            <tbody>${filasMovimientos}</tbody>
          </table>
        </section>
      `
    : "";

  const seccionAnulacion = anulado
    ? `
        <section class="section anulacion">
          <h2 class="section-title section-title-danger">Anulacion</h2>
          <div class="meta-grid">
            <div class="meta-row"><div class="meta-label">Fecha</div><div class="meta-value">${escapeHtml(formatPrintDateTime(traslado.anulada_en))}</div></div>
            <div class="meta-row"><div class="meta-label">Anulado por</div><div class="meta-value">${escapeHtml(traslado.anulada_por_nombre || traslado.anulada_por_username || "-")}</div></div>
            ${traslado.motivo_anulacion ? `<div class="meta-row span-2"><div class="meta-label">Motivo</div><div class="meta-value">${escapeHtml(traslado.motivo_anulacion)}</div></div>` : ""}
          </div>
        </section>
      `
    : "";

  return `
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <title>Nota de traslado ${escapeHtml(folio)}</title>
        <style>
          @page {
            size: A4;
            margin: 14mm 14mm 18mm 14mm;
          }
          :root { color-scheme: light; }
          * { box-sizing: border-box; }
          html, body {
            margin: 0;
            padding: 0;
            background: #eef1f6;
            color: #0f172a;
            font-family: "Segoe UI", Arial, sans-serif;
            font-size: 12.5px;
            line-height: 1.5;
          }
          .page {
            position: relative;
            background: #fff;
            max-width: 210mm;
            min-height: 297mm;
            margin: 0 auto;
            padding: 16mm 14mm;
            box-shadow: 0 8px 28px rgba(15,23,42,0.08);
            overflow: hidden;
          }
          .watermark {
            position: absolute;
            top: 40%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-22deg);
            font-size: 110px;
            font-weight: 900;
            letter-spacing: 0.08em;
            color: rgba(220, 38, 38, 0.12);
            pointer-events: none;
            user-select: none;
            z-index: 0;
          }
          .page > *:not(.watermark) { position: relative; z-index: 1; }
          .tr-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 20px;
            padding-bottom: 14px;
            border-bottom: 3px double #0f172a;
          }
          .tr-brand { display: flex; gap: 14px; align-items: flex-start; }
          .tr-logo {
            width: 66px;
            height: 66px;
            object-fit: contain;
            border: 1px solid #e2e8f0;
            border-radius: 10px;
            padding: 4px;
            background: #fff;
          }
          .tr-brand-text h1 { margin: 0; font-size: 20px; letter-spacing: 0.02em; }
          .tr-brand-text .muted { color: #475569; font-size: 11.5px; }
          .tr-doc {
            text-align: right;
            min-width: 220px;
            padding: 10px 14px;
            border: 1px solid #0f172a;
            border-radius: 10px;
            background: #f8fafc;
          }
          .tr-doc .doc-title {
            font-size: 11px;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            color: #475569;
          }
          .tr-doc .doc-folio {
            font-size: 22px;
            font-weight: 800;
            letter-spacing: 0.06em;
            margin-top: 2px;
          }
          .tr-doc .doc-estado {
            display: inline-block;
            margin-top: 6px;
            padding: 2px 10px;
            border-radius: 999px;
            font-size: 10.5px;
            font-weight: 700;
            letter-spacing: 0.12em;
            text-transform: uppercase;
          }
          .estado-ok { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
          .estado-anulado { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
          .flow {
            margin-top: 16px;
            display: grid;
            grid-template-columns: 1fr 40px 1fr;
            align-items: stretch;
            gap: 10px;
          }
          .flow-box {
            border: 1px solid #cbd5e1;
            border-radius: 10px;
            padding: 12px 14px;
            background: #f8fafc;
          }
          .flow-box .flow-label {
            font-size: 10.5px;
            letter-spacing: 0.16em;
            text-transform: uppercase;
            color: #64748b;
          }
          .flow-box .flow-name { font-size: 15px; font-weight: 800; margin-top: 2px; }
          .flow-box .flow-sub { font-size: 11.5px; color: #475569; }
          .flow-arrow {
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 26px;
            color: #0f172a;
            font-weight: 700;
          }
          .section { margin-top: 18px; }
          .section-title {
            margin: 0 0 8px;
            font-size: 13px;
            letter-spacing: 0.14em;
            text-transform: uppercase;
            color: #0f172a;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 4px;
          }
          .section-title-danger { color: #991b1b; border-bottom-color: #fecaca; }
          .meta-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px 18px;
          }
          .meta-row {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            padding: 4px 0;
            border-bottom: 1px dashed #e2e8f0;
          }
          .meta-row.span-2 { grid-column: 1 / -1; }
          .meta-label { color: #475569; font-size: 11.5px; }
          .meta-value { font-weight: 600; text-align: right; }
          .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 6px;
          }
          .data-table th, .data-table td {
            padding: 7px 8px;
            border-bottom: 1px solid #e2e8f0;
            vertical-align: top;
            font-size: 12px;
          }
          .data-table thead th {
            background: #0f172a;
            color: #f8fafc;
            text-align: left;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            font-size: 10.5px;
            font-weight: 700;
          }
          .data-table .col-num { text-align: right; white-space: nowrap; }
          .data-table .col-desc { width: 52%; }
          .data-table .prod-nombre { font-weight: 700; }
          .data-table .prod-codigo { font-size: 10.5px; color: #64748b; margin-top: 2px; }
          .data-table .empty-row { text-align: center; color: #64748b; padding: 14px 0; font-style: italic; }
          .muted-cell { color: #475569; }
          .chip {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 999px;
            font-size: 10.5px;
            font-weight: 700;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }
          .chip-in { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
          .chip-out { background: #fef3c7; color: #92400e; border: 1px solid #fcd34d; }
          .totals {
            margin-top: 14px;
            display: flex;
            justify-content: flex-end;
          }
          .totals-box {
            min-width: 260px;
            border: 1px solid #0f172a;
            border-radius: 10px;
            padding: 10px 14px;
            background: #f8fafc;
          }
          .totals-row {
            display: flex;
            justify-content: space-between;
            gap: 12px;
            padding: 3px 0;
          }
          .totals-row.grand {
            border-top: 2px solid #0f172a;
            margin-top: 6px;
            padding-top: 8px;
            font-size: 14px;
            font-weight: 800;
          }
          .firmas {
            margin-top: 34px;
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 24px;
          }
          .firma {
            border-top: 1px solid #0f172a;
            padding-top: 6px;
            text-align: center;
            font-size: 11px;
            color: #475569;
            letter-spacing: 0.08em;
            text-transform: uppercase;
          }
          .footer-note {
            margin-top: 24px;
            padding-top: 10px;
            border-top: 1px dashed #cbd5e1;
            font-size: 11px;
            color: #64748b;
            text-align: center;
          }
          @media print {
            body { background: #fff; }
            .page { box-shadow: none; margin: 0; }
          }
        </style>
      </head>
      <body>
        <div class="page">
          ${anulado ? `<div class="watermark">ANULADO</div>` : ""}

          <header class="tr-header">
            <div class="tr-brand">
              <img class="tr-logo" src="${escapeHtml(empresa.logoUrl)}" alt="logo" onerror="this.style.display='none'" />
              <div class="tr-brand-text">
                <h1>${escapeHtml(empresa.nombre)}</h1>
                <div class="muted">${escapeHtml(empresa.direccion)}</div>
                ${empresa.telefono ? `<div class="muted">Tel: ${escapeHtml(empresa.telefono)}</div>` : ""}
                ${empresa.correo ? `<div class="muted">${escapeHtml(empresa.correo)}</div>` : ""}
                <div class="muted">NIT: ${escapeHtml(empresa.nit)}</div>
              </div>
            </div>
            <div class="tr-doc">
              <div class="doc-title">Nota de traslado</div>
              <div class="doc-folio">${escapeHtml(folio)}</div>
              <div class="doc-estado ${anulado ? "estado-anulado" : "estado-ok"}">
                ${escapeHtml(estado.replace("_", " ") || "VIGENTE")}
              </div>
            </div>
          </header>

          <section class="flow">
            <div class="flow-box">
              <div class="flow-label">Origen</div>
              <div class="flow-name">${escapeHtml(traslado.bodega_origen_nombre || "-")}</div>
              ${traslado.sucursal_origen_nombre ? `<div class="flow-sub">${escapeHtml(traslado.sucursal_origen_nombre)}</div>` : ""}
            </div>
            <div class="flow-arrow">&rarr;</div>
            <div class="flow-box">
              <div class="flow-label">Destino</div>
              <div class="flow-name">${escapeHtml(traslado.bodega_destino_nombre || "-")}</div>
              ${traslado.sucursal_destino_nombre ? `<div class="flow-sub">${escapeHtml(traslado.sucursal_destino_nombre)}</div>` : ""}
            </div>
          </section>

          <section class="section">
            <h2 class="section-title">Datos del traslado</h2>
            <div class="meta-grid">
              <div class="meta-row"><div class="meta-label">Fecha</div><div class="meta-value">${escapeHtml(formatPrintDateTime(traslado.fecha))}</div></div>
              <div class="meta-row"><div class="meta-label">Creado por</div><div class="meta-value">${escapeHtml(traslado.usuario_nombre || traslado.usuario_username || "-")}</div></div>
              <div class="meta-row"><div class="meta-label">Total items</div><div class="meta-value">${totalItems}</div></div>
              <div class="meta-row"><div class="meta-label">Total unidades</div><div class="meta-value">${totalUnidades}</div></div>
              ${traslado.motivo ? `<div class="meta-row span-2"><div class="meta-label">Motivo</div><div class="meta-value">${escapeHtml(traslado.motivo)}</div></div>` : ""}
              ${traslado.observaciones ? `<div class="meta-row span-2"><div class="meta-label">Observaciones</div><div class="meta-value">${escapeHtml(traslado.observaciones)}</div></div>` : ""}
            </div>
          </section>

          <section class="section">
            <h2 class="section-title">Productos trasladados</h2>
            <table class="data-table">
              <thead>
                <tr>
                  <th class="col-num">#</th>
                  <th>Producto</th>
                  <th class="col-num">Cantidad</th>
                  <th class="col-num">Costo unit.</th>
                  <th class="col-num">Subtotal</th>
                </tr>
              </thead>
              <tbody>${filasProductos}</tbody>
            </table>

            <div class="totals">
              <div class="totals-box">
                <div class="totals-row"><span>Total items</span><strong>${totalItems}</strong></div>
                <div class="totals-row"><span>Total unidades</span><strong>${totalUnidades}</strong></div>
                <div class="totals-row grand"><span>Valor total</span><strong>${formatPrintCurrency(totalValor)}</strong></div>
              </div>
            </div>
          </section>

          ${seccionMovimientos}
          ${seccionAnulacion}

          <section class="firmas">
            <div class="firma">Entrega</div>
            <div class="firma">Recibe</div>
            <div class="firma">Autoriza</div>
          </section>

          <div class="footer-note">${escapeHtml(BUSINESS_INFO.footer)}</div>
        </div>
      </body>
    </html>
  `;
};
