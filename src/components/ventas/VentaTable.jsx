import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  Paper,
  Chip,
  Stack,
  Tooltip,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";

function VentaTable({ items, onCambiarCantidad, onEliminar }) {
  if (!items.length) {
    return (
      <Paper
        variant="outlined"
        sx={{
          p: 4,
          borderRadius: 3,
          textAlign: "center",
        }}
      >
        <Stack spacing={1} alignItems="center">
          <ShoppingCartIcon color="disabled" sx={{ fontSize: 40 }} />
          <Typography variant="h6" fontWeight="bold">
            Carrito vacio
          </Typography>
          <Typography color="text.secondary">
            No hay productos agregados a la venta
          </Typography>
        </Stack>
      </Paper>
    );
  }

  return (
    <TableContainer
      component={Paper}
      variant="outlined"
      sx={{
        borderRadius: 3,
        maxWidth: "100%",
        overflowX: "auto",
      }}
    >
      <Table
        sx={{
          width: "100%",
          minWidth: 0,
          tableLayout: "fixed",
        }}
      >
        <TableHead>
          <TableRow sx={{ backgroundColor: "action.hover" }}>
            <TableCell sx={{ fontWeight: "bold", width: "34%" }}>Producto</TableCell>
            <TableCell sx={{ fontWeight: "bold", width: "14%" }}>Precio</TableCell>
            <TableCell sx={{ fontWeight: "bold", width: "10%" }}>Stock</TableCell>
            <TableCell sx={{ fontWeight: "bold", width: "18%" }}>Cantidad</TableCell>
            <TableCell sx={{ fontWeight: "bold", width: "16%" }}>Subtotal</TableCell>
            <TableCell align="center" sx={{ fontWeight: "bold", width: "8%" }}>
              Accion
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id_producto} hover>
              <TableCell sx={{ minWidth: 0 }}>
                <Box sx={{ minWidth: 0 }}>
                  <Tooltip title={item.nombre}>
                    <Typography
                      fontWeight={600}
                      noWrap
                      sx={{
                        display: "block",
                        maxWidth: "100%",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.nombre}
                    </Typography>
                  </Tooltip>

                  {item.codigo_barras && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      noWrap
                      sx={{
                        display: "block",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {item.codigo_barras}
                    </Typography>
                  )}
                </Box>
              </TableCell>

              <TableCell sx={{ whiteSpace: "nowrap" }}>
                <Typography fontWeight={600} noWrap>
                  Q {Number(item.precio_venta).toFixed(2)}
                </Typography>
              </TableCell>

              <TableCell>
                <Chip
                  label={item.stock}
                  size="small"
                  color={item.stock <= 5 ? "warning" : "primary"}
                  variant="outlined"
                />
              </TableCell>

              <TableCell>
                <TextField
                  type="number"
                  size="small"
                  value={item.cantidad}
                  onChange={(e) =>
                    onCambiarCantidad(item.id_producto, Number(e.target.value))
                  }
                  inputProps={{
                    min: 1,
                    max: item.stock,
                    style: { textAlign: "center" },
                  }}
                  sx={{ width: 90, maxWidth: "100%" }}
                />
              </TableCell>

              <TableCell sx={{ whiteSpace: "nowrap" }}>
                <Typography fontWeight="bold" color="primary.main" noWrap>
                  Q {(Number(item.precio_venta) * Number(item.cantidad)).toFixed(2)}
                </Typography>
              </TableCell>

              <TableCell align="center">
                <Tooltip title="Quitar producto">
                  <IconButton
                    color="error"
                    onClick={() => onEliminar(item.id_producto)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default VentaTable;
