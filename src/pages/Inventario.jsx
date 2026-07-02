import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import DownloadIcon from "@mui/icons-material/Download";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import TimelineIcon from "@mui/icons-material/Timeline";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import WarehouseIcon from "@mui/icons-material/Warehouse";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import PaidOutlinedIcon from "@mui/icons-material/PaidOutlined";

import { getMovimientosStock, getStock } from "../services/stockService";
import {
  formatPrintCurrency,
  openPrintDocument,
} from "../utils/printDocuments";
import {
  getTableHeaderCellSx,
  getTableHeaderRowSx,
} from "../utils/tableHeaderStyles";
import {
  CATALOGO_OPTIONS,
  getCatalogoChipProps,
  resolverCatalogo,
} from "../utils/catalogoProducto";

const MOVIMIENTO_OPTIONS = [
  { value: "", label: "Todos" },
  { value: "ENTRADA", label: "Entradas" },
  { value: "SALIDA", label: "Salidas" },
  { value: "AJUSTE", label: "Ajustes" },
];

const CATALOGO_FILTER_LOCAL = [
  { value: "", label: "Todos" },
  ...CATALOGO_OPTIONS.map(({ value, label }) => ({ value, label })),
];

const GT_TIME_ZONE = "America/Guatemala";

const formatDateTime = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleString("es-GT", {
    timeZone: GT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDateOnly = (value) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString("es-GT", {
    timeZone: GT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const getTipoColor = (tipo) => {
  if (tipo === "ENTRADA") return "success";
  if (tipo === "SALIDA") return "error";
  if (tipo === "AJUSTE") return "warning";
  return "default";
};

// Envoltorio alrededor del helper compartido. Mantiene la misma forma
// { label, color, variant } que el resto de la pagina ya consume.
const getCatalogoChipLegacy = (registro) => {
  const props = getCatalogoChipProps(registro);
  return {
    label: props.label,
    color: props.chipColor,
    variant: props.chipVariant,
  };
};

const toCsvValue = (value) => {
  const normalized = String(value ?? "");
  return `"${normalized.replaceAll('"', '""')}"`;
};

const escapeHtml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const buildExcelCsv = (lines) => {
  const separator = ";";
  return [
    "sep=;",
    ...lines.map((line) => line.map(toCsvValue).join(separator)),
  ].join("\r\n");
};

const buildInventarioHtml = ({ productos, totalGeneral, filtros }) => {
  const generatedAt = new Date().toLocaleString("es-GT", {
    timeZone: GT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  const rows = productos
    .map((producto) => {
      const cantidad = Number(producto.stock_total ?? producto.existencia ?? 0);
      const costo = Number(producto.precio_compra || 0);
      const total = cantidad * costo;

      return `
        <tr>
          <td>${escapeHtml(producto.codigo_barras || "Sin codigo")}</td>
          <td>${escapeHtml(producto.nombre || "Producto")}</td>
          <td>${escapeHtml(formatDateOnly(producto.fecha_ingreso))}</td>
          <td class="number">${cantidad}</td>
          <td class="money">${formatPrintCurrency(costo)}</td>
          <td class="money">${formatPrintCurrency(total)}</td>
        </tr>`;
    })
    .join("");

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>Inventario valorizado</title>
        <style>
          @page { size: letter portrait; margin: 14mm; }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            font-family: Arial, Helvetica, sans-serif;
            color: #111827;
            font-size: 12px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            gap: 16px;
            border-bottom: 2px solid #111827;
            padding-bottom: 10px;
            margin-bottom: 14px;
          }
          h1 {
            margin: 0 0 6px;
            font-size: 22px;
            letter-spacing: 0;
          }
          .meta {
            color: #475569;
            line-height: 1.45;
          }
          .summary {
            text-align: right;
            font-weight: 700;
            line-height: 1.5;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          thead {
            display: table-header-group;
          }
          th {
            background: #1f2937;
            color: #fff;
            text-align: left;
            font-size: 11px;
            padding: 8px 7px;
            border: 1px solid #1f2937;
          }
          td {
            padding: 7px;
            border: 1px solid #d1d5db;
            vertical-align: top;
          }
          tbody tr:nth-child(even) {
            background: #f8fafc;
          }
          .number,
          .money {
            text-align: right;
            white-space: nowrap;
          }
          .total-row td {
            font-weight: 800;
            background: #e5e7eb;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1>Inventario valorizado</h1>
            <div class="meta">
              Catalogo: ${escapeHtml(filtros.catalogo || "Todos")}<br />
              Busqueda: ${escapeHtml(filtros.busqueda || "Sin filtro")}<br />
              Generado: ${escapeHtml(generatedAt)}
            </div>
          </div>
          <div class="summary">
            Productos: ${productos.length}<br />
            Total inventario: ${formatPrintCurrency(totalGeneral)}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 18%;">Codigo</th>
              <th>Nombre</th>
              <th style="width: 12%;">Fecha ingreso</th>
              <th style="width: 11%;">Cantidad</th>
              <th style="width: 14%;">Precio costo</th>
              <th style="width: 14%;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
            <tr class="total-row">
              <td colspan="5" class="money">TOTAL INVENTARIO</td>
              <td class="money">${formatPrintCurrency(totalGeneral)}</td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>`;
};

const getStockSplit = (registro) => {
  const general = Number(registro?.stock_general ?? 0);
  const tiendaTaller = Number(registro?.stock_tienda_taller ?? 0);
  const total = Number(registro?.stock_total ?? registro?.existencia ?? general + tiendaTaller);

  return { general, tiendaTaller, total };
};

function Inventario() {
  const theme = useTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const [stockRows, setStockRows] = useState([]);
  const [movimientos, setMovimientos] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(
    searchParams.get("id_producto") || ""
  );
  const [busquedaProducto, setBusquedaProducto] = useState("");
  const [busquedaMovimiento, setBusquedaMovimiento] = useState("");
  const [moduloFiltro, setModuloFiltro] = useState("");
  const [tipoMovimiento, setTipoMovimiento] = useState("");
  const [desde, setDesde] = useState("");
  const [hasta, setHasta] = useState("");
  const [soloBajoMinimo, setSoloBajoMinimo] = useState(false);
  const [loadingStock, setLoadingStock] = useState(true);
  const [loadingMovimientos, setLoadingMovimientos] = useState(true);
  const [exportingPdf, setExportingPdf] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadStock = async () => {
      try {
        setLoadingStock(true);
        setError("");
        const data = await getStock();
        setStockRows(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.error || "No se pudo cargar el inventario.");
      } finally {
        setLoadingStock(false);
      }
    };

    loadStock();
  }, []);

  useEffect(() => {
    const loadMovimientos = async () => {
      try {
        setLoadingMovimientos(true);
        setError("");
        const data = await getMovimientosStock({
          id_producto: selectedProductId || undefined,
          tipo: tipoMovimiento || undefined,
          desde: desde || undefined,
          hasta: hasta || undefined,
          q: busquedaMovimiento || undefined,
          limit: 200,
        });
        setMovimientos(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.error || "No se pudo cargar el kardex.");
      } finally {
        setLoadingMovimientos(false);
      }
    };

    loadMovimientos();
  }, [selectedProductId, tipoMovimiento, desde, hasta, busquedaMovimiento]);

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams);

    if (selectedProductId) {
      nextParams.set("id_producto", selectedProductId);
    } else {
      nextParams.delete("id_producto");
    }

    const current = searchParams.toString();
    const next = nextParams.toString();

    if (current !== next) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [selectedProductId, searchParams, setSearchParams]);

  const productosFiltrados = useMemo(() => {
    const texto = busquedaProducto.trim().toLowerCase();

    return stockRows.filter((producto) => {
      const matchesModulo =
        !moduloFiltro || resolverCatalogo(producto) === moduloFiltro;

      const matchesSearch =
        !texto ||
        String(producto.nombre || "").toLowerCase().includes(texto) ||
        String(producto.codigo_barras || "").toLowerCase().includes(texto) ||
        String(producto.descripcion || "").toLowerCase().includes(texto);

      const matchesLowStock = !soloBajoMinimo || Boolean(producto.bajo_minimo);

      return matchesModulo && matchesSearch && matchesLowStock;
    });
  }, [stockRows, busquedaProducto, moduloFiltro, soloBajoMinimo]);

  const productosExportables = useMemo(
    () =>
      productosFiltrados.filter(
        (producto) =>
          Number(producto.stock_total ?? producto.existencia ?? 0) > 0
      ),
    [productosFiltrados]
  );

  const selectedProduct = useMemo(() => {
    return stockRows.find(
      (producto) => String(producto.id_producto) === String(selectedProductId)
    );
  }, [stockRows, selectedProductId]);

  const resumenInventario = useMemo(() => {
    return productosFiltrados.reduce(
      (acc, producto) => {
        const existencia = Number(producto.existencia || 0);
        const stockMinimo = Number(producto.stock_minimo || 0);

        acc.unidades += existencia;
        if (stockMinimo > 0 && existencia <= stockMinimo) {
          acc.bajoMinimo += 1;
        }

        return acc;
      },
      {
        productos: productosFiltrados.length,
        unidades: 0,
        bajoMinimo: 0,
      }
    );
  }, [productosFiltrados]);

  const movimientosFiltrados = useMemo(() => {
    if (!moduloFiltro) return movimientos;

    return movimientos.filter(
      (movimiento) => resolverCatalogo(movimiento) === moduloFiltro
    );
  }, [movimientos, moduloFiltro]);

  const resumenMovimientos = useMemo(() => {
    return movimientosFiltrados.reduce(
      (acc, movimiento) => {
        const cantidad = Number(movimiento.cantidad || 0);
        if (movimiento.tipo === "ENTRADA") acc.entradas += cantidad;
        if (movimiento.tipo === "SALIDA") acc.salidas += cantidad;
        if (movimiento.tipo === "AJUSTE") acc.ajustes += 1;
        return acc;
      },
      { entradas: 0, salidas: 0, ajustes: 0 }
    );
  }, [movimientosFiltrados]);

  const valorTotalInventario = useMemo(() => {
    return stockRows.reduce((acc, producto) => {
      const existencia = Number(
        producto.stock_total ?? producto.existencia ?? 0
      );
      const costo = Number(producto.precio_compra || 0);
      return acc + existencia * costo;
    }, 0);
  }, [stockRows]);

  const valorEstimadoStock = useMemo(() => {
    if (!selectedProduct) return 0;

    return Number(
      (selectedProduct.stock_total ?? selectedProduct.existencia) || 0
    ) * Number(selectedProduct.precio_compra || 0);
  }, [selectedProduct]);

  const ultimoMovimiento = useMemo(() => {
    return movimientosFiltrados[0] || null;
  }, [movimientosFiltrados]);

  const limpiarFiltros = () => {
    setBusquedaProducto("");
    setBusquedaMovimiento("");
    setModuloFiltro("");
    setTipoMovimiento("");
    setDesde("");
    setHasta("");
    setSoloBajoMinimo(false);
    setSelectedProductId("");
  };

  const seleccionarProducto = (productoId) => {
    setSelectedProductId(String(productoId || ""));
    setBusquedaMovimiento("");
    setTipoMovimiento("");
    setDesde("");
    setHasta("");
  };

  const cards = [
    {
      label: "Productos en inventario",
      value: resumenInventario.productos,
      helper: "Catalogo con stock registrado",
      icon: <WarehouseIcon color="primary" />,
    },
    {
      label: "Unidades disponibles",
      value: resumenInventario.unidades,
      helper: "Existencia total actual",
      icon: <Inventory2Icon color="primary" />,
    },
    {
      label: "Valor estimado inventario",
      value: formatPrintCurrency(valorTotalInventario),
      helper: "Stock actual por precio de compra",
      icon: <PaidOutlinedIcon color="success" />,
    },
    {
      label: "Productos bajo minimo",
      value: resumenInventario.bajoMinimo,
      helper: "Requieren atencion o compra",
      icon: <WarningAmberIcon color={resumenInventario.bajoMinimo > 0 ? "warning" : "disabled"} />,
    },
    {
      label: selectedProduct ? "Stock del producto" : "Movimientos visibles",
      value: selectedProduct ? Number(selectedProduct.existencia || 0) : movimientos.length,
      helper: selectedProduct
        ? `${selectedProduct.nombre} | Minimo ${Number(selectedProduct.stock_minimo || 0)}`
        : "Filas visibles en el kardex",
      icon: <TimelineIcon color="primary" />,
    },
  ];

  const exportarPdf = async () => {
    try {
      setExportingPdf(true);
      setError("");

      if (!productosExportables.length) {
        setError("No hay productos con stock disponible para exportar en PDF.");
        return;
      }

      const totalGeneral = productosExportables.reduce((acc, producto) => {
        const cantidad = Number(producto.stock_total ?? producto.existencia ?? 0);
        const costo = Number(producto.precio_compra || 0);
        return acc + cantidad * costo;
      }, 0);

      openPrintDocument({
        title: "Inventario valorizado",
        html: buildInventarioHtml({
          productos: productosExportables,
          totalGeneral,
          filtros: {
            catalogo: moduloFiltro || "Todos",
            busqueda: busquedaProducto || "Sin filtro",
          }
        }),
        width: 1200,
        height: 900,
      });
    } catch (err) {
      console.error(err);
      setError(err.message || "No se pudo generar el PDF del inventario.");
    } finally {
      setExportingPdf(false);
    }
  };

  const exportarExcel = async () => {
    try {
      setExportingExcel(true);
      setError("");

      if (!productosExportables.length) {
        setError("No hay productos con stock disponible para exportar a Excel.");
        return;
      }

      const totalGeneral = productosExportables.reduce((acc, producto) => {
        const cantidad = Number(producto.stock_total ?? producto.existencia ?? 0);
        const costo = Number(producto.precio_compra || 0);
        return acc + cantidad * costo;
      }, 0);

      const lines = [
        ["CODIGO", "NOMBRE", "FECHA INGRESO", "CANTIDAD", "PRECIO COSTO", "TOTAL"],
        ...productosExportables.map((producto) => {
          const cantidad = Number(producto.stock_total ?? producto.existencia ?? 0);
          const costo = Number(producto.precio_compra || 0);
          return [
            producto.codigo_barras || "Sin codigo",
            producto.nombre || "Producto",
            formatDateOnly(producto.fecha_ingreso),
            cantidad,
            costo.toFixed(2),
            (cantidad * costo).toFixed(2),
          ];
        }),
        ["", "", "", "", "TOTAL INVENTARIO", totalGeneral.toFixed(2)],
      ];

      const csv = buildExcelCsv(lines);
      const blob = new Blob(["\uFEFF", csv], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = moduloFiltro
        ? `inventario-${moduloFiltro.toLowerCase()}.csv`
        : "inventario-productos.csv";
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError(err.message || "No se pudo exportar el inventario.");
    } finally {
      setExportingExcel(false);
    }
  };

  return (
    <Box>
      <Stack spacing={1.5} mb={3}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <TimelineIcon color="primary" />
          <Typography variant="h4" fontWeight="bold">
            Inventario y Kardex
          </Typography>
        </Stack>

        <Typography variant="body1" color="text.secondary">
          Consulta existencias actuales y revisa la trazabilidad de entradas, salidas y ajustes por producto.
        </Typography>
      </Stack>

      <Alert severity="info" sx={{ mb: 3, borderRadius: 3 }}>
        Este modulo usa los movimientos reales registrados por ventas, compras, anulaciones, ajustes y repuestos de taller.
      </Alert>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        justifyContent="flex-end"
        alignItems={{ xs: "stretch", sm: "center" }}
        mb={3}
      >
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={exportarExcel}
          disabled={loadingStock || exportingExcel}
        >
          {exportingExcel ? "Exportando..." : "Exportar Excel"}
        </Button>
        <Button
          variant="contained"
          color="error"
          startIcon={<PictureAsPdfIcon />}
          onClick={exportarPdf}
          disabled={loadingStock || exportingPdf}
        >
          {exportingPdf ? "Generando PDF..." : "Exportar PDF"}
        </Button>
      </Stack>

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(2, minmax(0, 1fr))",
            xl: "repeat(5, minmax(0, 1fr))",
          },
          gap: 2,
          mb: 3,
        }}
      >
        {cards.map((card) => (
          <Paper
            key={card.label}
            elevation={2}
            sx={{
              p: 2.5,
              borderRadius: 4,
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">
                {card.label}
              </Typography>
              {card.icon}
            </Stack>
            <Typography variant="h4" fontWeight="bold">
              {card.value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {card.helper}
            </Typography>
          </Paper>
        ))}
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            lg: "minmax(420px, 0.9fr) minmax(0, 1.6fr)",
          },
          gap: 3,
          alignItems: "start",
        }}
      >
        <Paper
          elevation={2}
          sx={{
            p: 2.5,
            borderRadius: 4,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "visible",
          }}
        >
          <Stack spacing={1.5} sx={{ flex: 1, minHeight: 0 }}>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Stock actual
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Selecciona un producto para enfocar su kardex.
              </Typography>
            </Box>

            <TextField
              label="Buscar producto"
              placeholder="Nombre, codigo o descripcion"
              value={busquedaProducto}
              onChange={(event) => setBusquedaProducto(event.target.value)}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel id="modulo-inventario-label">Catalogo</InputLabel>
              <Select
                labelId="modulo-inventario-label"
                label="Catalogo"
                value={moduloFiltro}
                // value representa un CATALOGO normalizado ('' = Todos).
                onChange={(event) => setModuloFiltro(event.target.value)}
              >
                {CATALOGO_FILTER_LOCAL.map((option) => (
                  <MenuItem key={option.value || "all"} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControlLabel
              control={
                <Checkbox
                  checked={soloBajoMinimo}
                  onChange={(event) => setSoloBajoMinimo(event.target.checked)}
                />
              }
              label="Mostrar solo stock bajo"
            />

            <Stack direction="row" spacing={1.5}>
              <Button
                variant={selectedProductId ? "outlined" : "contained"}
                fullWidth
                onClick={() => seleccionarProducto("")}
              >
                Todos
              </Button>
              <Button variant="text" fullWidth onClick={limpiarFiltros}>
                Limpiar
              </Button>
            </Stack>

            {selectedProduct && (
              <Paper
                variant="outlined"
                sx={{
                  p: 1.75,
                  borderRadius: 3,
                  borderColor: "primary.main",
                  background:
                    "linear-gradient(180deg, rgba(37,99,235,0.10) 0%, rgba(37,99,235,0.03) 100%)",
                  boxShadow: "0 10px 24px rgba(37,99,235,0.12)",
                  transition: "transform 220ms ease, box-shadow 220ms ease, opacity 220ms ease",
                  animation: "inventarioSelectedCardIn 220ms ease",
                  transformOrigin: "top left",
                  "@keyframes inventarioSelectedCardIn": {
                    "0%": {
                      opacity: 0,
                      transform: "translateY(-8px) scale(0.985)",
                    },
                    "100%": {
                      opacity: 1,
                      transform: "translateY(0) scale(1)",
                    },
                  },
                  "&:hover": {
                    transform: "translateY(-1px)",
                    boxShadow: "0 14px 28px rgba(37,99,235,0.16)",
                  },
                }}
              >
                <Stack spacing={0.75}>
                  <Typography variant="body2" color="text.secondary">
                    Producto seleccionado
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {selectedProduct.nombre}
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {(() => {
                      const moduloChip = getCatalogoChipLegacy(selectedProduct);
                      return (
                        <Chip
                          size="small"
                          color={moduloChip.color}
                          variant={moduloChip.variant}
                          label={moduloChip.label}
                        />
                      );
                    })()}
                    <Chip
                      size="small"
                      color="primary"
                      variant="filled"
                      label={`Total ${getStockSplit(selectedProduct).total}`}
                    />
                    <Chip
                      size="small"
                      variant="outlined"
                      color="primary"
                      label={`General ${getStockSplit(selectedProduct).general}`}
                    />
                    <Chip
                      size="small"
                      variant="outlined"
                      color="secondary"
                      label={`Tienda/Taller ${getStockSplit(selectedProduct).tiendaTaller}`}
                    />
                    <Chip
                      size="small"
                      color={selectedProduct.bajo_minimo ? "warning" : "default"}
                      variant="outlined"
                      label={`Min ${Number(selectedProduct.stock_minimo || 0)}`}
                    />
                    <Chip
                      size="small"
                      variant="outlined"
                      label={selectedProduct.codigo_barras || "Sin codigo"}
                    />
                  </Stack>
                </Stack>
              </Paper>
            )}

            <Divider />

            {loadingStock ? (
              <Stack alignItems="center" spacing={2} py={4}>
                <CircularProgress />
                <Typography color="text.secondary">Cargando inventario...</Typography>
              </Stack>
            ) : (
              <TableContainer
                sx={{
                  height: { xs: 440, lg: 520 },
                  minHeight: { xs: 440, lg: 520 },
                  borderRadius: 3,
                  overflowY: "auto",
                  overscrollBehavior: "contain",
                  scrollbarWidth: "thin",
                  scrollbarColor: `${theme.palette.primary.main} transparent`,
                  "&::-webkit-scrollbar": {
                    width: 10,
                  },
                  "&::-webkit-scrollbar-track": {
                    backgroundColor: "transparent",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "rgba(96, 165, 250, 0.45)",
                    borderRadius: 999,
                    border: "2px solid transparent",
                    backgroundClip: "padding-box",
                  },
                }}
              >
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow sx={getTableHeaderRowSx(theme)}>
                      <TableCell sx={getTableHeaderCellSx(theme)}>Producto</TableCell>
                      <TableCell sx={getTableHeaderCellSx(theme)}>Catalogo</TableCell>
                      <TableCell align="right" sx={getTableHeaderCellSx(theme)}>Stock</TableCell>
                      <TableCell sx={getTableHeaderCellSx(theme)}>Distribucion</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {productosFiltrados.map((producto) => {
                      const selected =
                        String(producto.id_producto) === String(selectedProductId);

                      return (
                        <TableRow
                          key={producto.id_producto}
                          hover
                          selected={selected}
                          onClick={() => seleccionarProducto(producto.id_producto)}
                          sx={{
                            cursor: "pointer",
                            transition: "all 180ms ease",
                            backgroundColor: selected ? "rgba(37,99,235,0.10)" : "transparent",
                            boxShadow: selected
                              ? "inset 3px 0 0 #2563eb"
                              : "inset 0 0 0 transparent",
                            "& .MuiTableCell-root": {
                              borderBottomColor: "divider",
                              transition: "all 180ms ease",
                              backgroundColor: selected ? "rgba(37,99,235,0.04)" : "transparent",
                            },
                            "& .MuiTypography-root": {
                              color: selected ? "primary.main" : "inherit",
                            },
                            "&:hover": {
                              backgroundColor: selected
                                ? "rgba(37,99,235,0.14)"
                                : "rgba(148,163,184,0.08)",
                            },
                          }}
                        >
                          <TableCell>
                            <Stack spacing={0.5}>
                              <Typography fontWeight={700}>
                                {producto.nombre}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Codigo: {producto.codigo_barras || "Sin codigo"}
                              </Typography>
                              {producto.bajo_minimo && (
                                <Chip
                                  size="small"
                                  color="warning"
                                  label={`Bajo minimo | Faltan ${Number(producto.faltante || 0)}`}
                                  sx={{ width: "fit-content" }}
                                />
                              )}
                            </Stack>
                          </TableCell>
                          <TableCell>
                            {(() => {
                              const moduloChip = getCatalogoChipLegacy(producto);
                              return (
                                <Chip
                                  size="small"
                                  color={moduloChip.color}
                                  variant={moduloChip.variant}
                                  label={moduloChip.label}
                                />
                              );
                            })()}
                          </TableCell>
                          <TableCell align="right">
                            <Typography fontWeight="bold">
                              {getStockSplit(producto).total}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Min {Number(producto.stock_minimo || 0)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
                              <Chip
                                size="small"
                                variant="outlined"
                                color="primary"
                                label={`G ${getStockSplit(producto).general}`}
                              />
                              <Chip
                                size="small"
                                variant="outlined"
                                color="secondary"
                                label={`T/T ${getStockSplit(producto).tiendaTaller}`}
                              />
                            </Stack>
                          </TableCell>
                        </TableRow>
                      );
                    })}

                    {!loadingStock && productosFiltrados.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4}>
                          <Typography color="text.secondary">
                            No hay productos que coincidan con el filtro actual.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Stack>
        </Paper>

        <Paper
          elevation={2}
          sx={{
            p: 2.5,
            borderRadius: 4,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            overflow: "visible",
          }}
        >
          <Stack spacing={2} sx={{ flex: 1, minHeight: 0 }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={1.5}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
            >
              <Box>
                <Typography variant="h6" fontWeight="bold">
                  Kardex de movimientos
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedProduct
                    ? `Producto enfocado: ${selectedProduct.nombre}`
                    : "Mostrando movimientos de todos los productos."}
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} flexWrap="wrap">
                {selectedProduct && (
                  <Chip
                    color="primary"
                    variant="outlined"
                    label={`Total ${getStockSplit(selectedProduct).total}`}
                  />
                )}
                {selectedProduct && (
                  <Chip
                    color="primary"
                    variant="outlined"
                    label={`General ${getStockSplit(selectedProduct).general}`}
                  />
                )}
                {selectedProduct && (
                  <Chip
                    color="secondary"
                    variant="outlined"
                    label={`Tienda/Taller ${getStockSplit(selectedProduct).tiendaTaller}`}
                  />
                )}
                {selectedProduct && (
                  (() => {
                    const moduloChip = getCatalogoChipLegacy(selectedProduct);
                    return (
                      <Chip
                        color={moduloChip.color}
                        variant={moduloChip.variant}
                        label={`Catalogo ${moduloChip.label}`}
                      />
                    );
                  })()
                )}
                {selectedProduct && Number(selectedProduct.stock_minimo || 0) > 0 && (
                  <Chip
                    color={selectedProduct.bajo_minimo ? "warning" : "default"}
                    variant="outlined"
                    label={`Minimo ${Number(selectedProduct.stock_minimo || 0)}`}
                  />
                )}
                {selectedProduct?.ubicacion && (
                  <Chip
                    variant="outlined"
                    label={`Ubicacion ${selectedProduct.ubicacion}`}
                  />
                )}
              </Stack>
            </Stack>

            {(selectedProduct || ultimoMovimiento) && (
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    md: "repeat(2, minmax(0, 1fr))",
                  },
                  gap: 1.5,
                }}
              >
                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.75,
                    borderRadius: 3,
                    background:
                      "linear-gradient(180deg, rgba(37,99,235,0.06) 0%, rgba(37,99,235,0.02) 100%)",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Valor estimado del stock
                  </Typography>
                  <Typography variant="h5" fontWeight="bold" color="primary.main">
                    Q {valorEstimadoStock.toFixed(2)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Basado en existencia actual y precio de compra registrado.
                  </Typography>
                </Paper>

                <Paper
                  variant="outlined"
                  sx={{
                    p: 1.75,
                    borderRadius: 3,
                    background:
                      "linear-gradient(180deg, rgba(15,23,42,0.05) 0%, rgba(15,23,42,0.02) 100%)",
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Ultimo movimiento registrado
                  </Typography>
                  <Typography variant="h6" fontWeight="bold">
                    {ultimoMovimiento
                      ? `${ultimoMovimiento.tipo} | ${Number(ultimoMovimiento.cantidad || 0)} unidad(es)`
                      : "Sin movimientos visibles"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {ultimoMovimiento
                      ? `${formatDateTime(ultimoMovimiento.fecha)} | ${ultimoMovimiento.motivo || "Sin detalle"}`
                      : "Ajusta los filtros o selecciona un producto para ver su traza."}
                  </Typography>
                </Paper>
              </Box>
            )}

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(2, minmax(0, 1fr))",
                  xl: "repeat(5, minmax(0, 1fr))",
                },
                gap: 1.5,
              }}
            >
              <TextField
                label="Buscar en movimientos"
                placeholder="Motivo, usuario o producto"
                value={busquedaMovimiento}
                onChange={(event) => setBusquedaMovimiento(event.target.value)}
                fullWidth
              />

              <FormControl fullWidth>
                <InputLabel id="tipo-movimiento-label">Tipo</InputLabel>
                <Select
                  labelId="tipo-movimiento-label"
                  label="Tipo"
                  value={tipoMovimiento}
                  onChange={(event) => setTipoMovimiento(event.target.value)}
                >
                  {MOVIMIENTO_OPTIONS.map((option) => (
                    <MenuItem key={option.value || "all"} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                label="Desde"
                type="date"
                value={desde}
                onChange={(event) => setDesde(event.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />

              <TextField
                label="Hasta"
                type="date"
                value={hasta}
                onChange={(event) => setHasta(event.target.value)}
                InputLabelProps={{ shrink: true }}
                fullWidth
              />

              <Button
                variant="outlined"
                startIcon={<AutorenewIcon />}
                onClick={() => {
                  setTipoMovimiento("");
                  setBusquedaMovimiento("");
                  setDesde("");
                  setHasta("");
                }}
                sx={{ minHeight: 56 }}
              >
                Limpiar filtros
              </Button>
            </Box>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",
                  md: "repeat(3, minmax(0, 1fr))",
                },
                gap: 1.5,
              }}
            >
              <Paper variant="outlined" sx={{ p: 1.75, borderRadius: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Entradas visibles
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="success.main">
                  {resumenMovimientos.entradas}
                </Typography>
              </Paper>
              <Paper variant="outlined" sx={{ p: 1.75, borderRadius: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Salidas visibles
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="error.main">
                  {resumenMovimientos.salidas}
                </Typography>
              </Paper>
              <Paper variant="outlined" sx={{ p: 1.75, borderRadius: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Ajustes visibles
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="warning.main">
                  {resumenMovimientos.ajustes}
                </Typography>
              </Paper>
            </Box>

            {loadingMovimientos ? (
              <Stack alignItems="center" spacing={2} py={6}>
                <CircularProgress />
                <Typography color="text.secondary">Cargando kardex...</Typography>
              </Stack>
            ) : (
              <TableContainer
                sx={{
                  height: { xs: 460, lg: 520 },
                  minHeight: { xs: 460, lg: 520 },
                  borderRadius: 3,
                  overflowY: "auto",
                  overscrollBehavior: "contain",
                  scrollbarWidth: "thin",
                  scrollbarColor: `${theme.palette.primary.main} transparent`,
                  "&::-webkit-scrollbar": {
                    width: 10,
                  },
                  "&::-webkit-scrollbar-track": {
                    backgroundColor: "transparent",
                  },
                  "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "rgba(96, 165, 250, 0.45)",
                    borderRadius: 999,
                    border: "2px solid transparent",
                    backgroundClip: "padding-box",
                  },
                }}
              >
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow sx={getTableHeaderRowSx(theme)}>
                      <TableCell sx={getTableHeaderCellSx(theme)}>Fecha</TableCell>
                      <TableCell sx={getTableHeaderCellSx(theme)}>Producto</TableCell>
                      <TableCell sx={getTableHeaderCellSx(theme)}>Tipo</TableCell>
                      <TableCell align="right" sx={getTableHeaderCellSx(theme)}>Cantidad</TableCell>
                      <TableCell align="right" sx={getTableHeaderCellSx(theme)}>Antes</TableCell>
                      <TableCell align="right" sx={getTableHeaderCellSx(theme)}>Despues</TableCell>
                      <TableCell sx={getTableHeaderCellSx(theme)}>Motivo</TableCell>
                      <TableCell sx={getTableHeaderCellSx(theme)}>Usuario</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {movimientosFiltrados.map((movimiento, index) => (
                      <TableRow key={`${movimiento.id_producto}-${movimiento.fecha}-${index}`} hover>
                        <TableCell>
                          {formatDateTime(movimiento.fecha)}
                        </TableCell>
                        <TableCell>
                          <Stack spacing={0.5}>
                            <Typography fontWeight={700}>
                              {movimiento.producto_nombre || "Producto"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {movimiento.producto_codigo_barras || "Sin codigo"}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            color={getTipoColor(movimiento.tipo)}
                            label={movimiento.tipo}
                          />
                        </TableCell>
                        <TableCell align="right">{Number(movimiento.cantidad || 0)}</TableCell>
                        <TableCell align="right">{Number(movimiento.existencia_antes || 0)}</TableCell>
                        <TableCell align="right">{Number(movimiento.existencia_despues || 0)}</TableCell>
                        <TableCell>{movimiento.motivo || "Sin detalle"}</TableCell>
                        <TableCell>
                          {movimiento.usuario_nombre || movimiento.usuario_username || "Sistema"}
                        </TableCell>
                      </TableRow>
                    ))}

                    {!loadingMovimientos && movimientosFiltrados.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={8}>
                          <Typography color="text.secondary">
                            No hay movimientos para los filtros seleccionados.
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}

export default Inventario;
