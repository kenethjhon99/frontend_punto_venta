import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
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
            Carrito vacío
          </Typography>
          <Typography color="text.secondary">
            No hay productos agregados a la venta
          </Typography>
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        borderRadius: 3,
        overflow: "hidden",
      }}
    >
      <Table>
        <TableHead>
          <TableRow sx={{ backgroundColor: "action.hover" }}>
            <TableCell sx={{ fontWeight: "bold" }}>Producto</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Precio</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Stock</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Cantidad</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Subtotal</TableCell>
            <TableCell align="center" sx={{ fontWeight: "bold" }}>
              Acción
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id_producto} hover>
              <TableCell>
                <Box>
                  <Typography fontWeight={600}>{item.nombre}</Typography>
                  {item.codigo_barras && (
                    <Typography variant="body2" color="text.secondary">
                      {item.codigo_barras}
                    </Typography>
                  )}
                </Box>
              </TableCell>

              <TableCell>
                <Typography fontWeight={600}>
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
                  sx={{ width: 90 }}
                />
              </TableCell>

              <TableCell>
                <Typography fontWeight="bold" color="primary.main">
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
    </Paper>
  );
}

export default VentaTable;