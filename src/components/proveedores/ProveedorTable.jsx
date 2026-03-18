import {
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

function ProveedorTable({
  proveedores = [],
  onEdit,
  onDeactivate,
  onViewHistory,
}) {
  if (!proveedores.length) {
    return (
      <Paper sx={{ p: 4, textAlign: "center" }} elevation={0}>
        <Typography color="text.secondary">
          No hay proveedores para mostrar.
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} elevation={0}>
      <Table sx={{ minWidth: 900 }}>
        <TableHead>
          <TableRow sx={{ backgroundColor: "#f8fafc" }}>
            <TableCell sx={{ fontWeight: "bold" }}>Nombre</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>NIT</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Telefono</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Correo</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Direccion</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Estado</TableCell>
            <TableCell align="center" sx={{ fontWeight: "bold" }}>
              Acciones
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {proveedores.map((proveedor) => (
            <TableRow key={proveedor.id_proveedor} hover>
              <TableCell>
                <Typography fontWeight={600}>{proveedor.nombre}</Typography>
              </TableCell>
              <TableCell>{proveedor.nit}</TableCell>
              <TableCell>{proveedor.telefono || "-"}</TableCell>
              <TableCell>{proveedor.correo || "-"}</TableCell>
              <TableCell>{proveedor.direccion || "-"}</TableCell>
              <TableCell>
                <Chip
                  label={proveedor.estado ? "Activo" : "Inactivo"}
                  color={proveedor.estado ? "success" : "default"}
                  size="small"
                  variant={proveedor.estado ? "filled" : "outlined"}
                />
              </TableCell>
              <TableCell align="center">
                <Stack direction="row" spacing={1} justifyContent="center">
                  <Tooltip title="Ver compras">
                    <span>
                      <IconButton color="inherit" onClick={() => onViewHistory(proveedor)}>
                        <ReceiptLongIcon />
                      </IconButton>
                    </span>
                  </Tooltip>

                  <Tooltip title="Editar proveedor">
                    <span>
                      <IconButton color="primary" onClick={() => onEdit(proveedor)}>
                        <EditIcon />
                      </IconButton>
                    </span>
                  </Tooltip>

                  <Tooltip title="Desactivar proveedor">
                    <span>
                      <IconButton
                        color="error"
                        onClick={() => onDeactivate(proveedor)}
                        disabled={!proveedor.estado}
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default ProveedorTable;
