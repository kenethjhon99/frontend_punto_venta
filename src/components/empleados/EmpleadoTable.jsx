import {
  Button,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import {
  getTableContainerSx,
  getTableHeaderCellSx,
  getTableHeaderRowSx,
} from "../../utils/tableHeaderStyles";

const cargoColorMap = {
  CARWASH: "primary",
  VENDEDOR: "secondary",
  REPARTIDOR: "info",
  RUTERO: "success",
  CAJERA: "warning",
  ADMINISTRATIVO: "default",
};

const tipoPagoColorMap = {
  SEMANAL: "warning",
  MENSUAL: "success",
};

function EmpleadoTable({
  empleados = [],
  onEdit,
  onToggleActivo,
  onCambiarEstadoOperativo,
  canManage = true,
}) {
  const theme = useTheme();

  if (!empleados.length) {
    return (
      <Paper sx={{ p: 4, textAlign: "center" }} elevation={0}>
        <Typography color="text.secondary">
          No hay empleados para mostrar.
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} elevation={0} sx={getTableContainerSx(theme)}>
      <Table sx={{ minWidth: 860 }}>
        <TableHead>
          <TableRow sx={getTableHeaderRowSx(theme)}>
            <TableCell sx={getTableHeaderCellSx(theme)}>ID</TableCell>
            <TableCell sx={getTableHeaderCellSx(theme)}>Nombre</TableCell>
            <TableCell sx={getTableHeaderCellSx(theme)}>Cargo</TableCell>
            <TableCell sx={getTableHeaderCellSx(theme)}>Tipo pago</TableCell>
            <TableCell sx={getTableHeaderCellSx(theme)}>ZGAS</TableCell>
            <TableCell sx={getTableHeaderCellSx(theme)}>Operativo</TableCell>
            <TableCell sx={getTableHeaderCellSx(theme)}>Estado</TableCell>
            <TableCell align="center" sx={getTableHeaderCellSx(theme)}>
              {canManage ? "Acciones" : "Modo"}
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {empleados.map((empleado) => (
            <TableRow key={empleado.id_empleado} hover>
              <TableCell>{empleado.id_empleado}</TableCell>
              <TableCell>
                <Typography fontWeight={700}>{empleado.nombre}</Typography>
              </TableCell>
              <TableCell>
                <Chip
                  label={empleado.cargo}
                  size="small"
                  color={cargoColorMap[empleado.cargo] || "default"}
                  variant="outlined"
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={empleado.tipo_pago}
                  size="small"
                  color={tipoPagoColorMap[empleado.tipo_pago] || "default"}
                  variant="outlined"
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={empleado.puede_repartir ? "Reparte" : "No reparte"}
                  size="small"
                  color={empleado.puede_repartir ? "info" : "default"}
                  variant={empleado.puede_repartir ? "filled" : "outlined"}
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={empleado.estado_operativo || "DISPONIBLE"}
                  size="small"
                  color={
                    empleado.estado_operativo === "DISPONIBLE"
                      ? "success"
                      : empleado.estado_operativo === "DESCANSO"
                        ? "default"
                        : "warning"
                  }
                  variant="outlined"
                />
              </TableCell>
              <TableCell>
                <Chip
                  label={empleado.activo ? "Activo" : "Inactivo"}
                  color={empleado.activo ? "success" : "default"}
                  size="small"
                  variant={empleado.activo ? "filled" : "outlined"}
                />
              </TableCell>
              <TableCell align="center">
                {canManage ? (
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <Button size="small" variant="outlined" onClick={() => onEdit(empleado)}>
                      Editar
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => onCambiarEstadoOperativo(empleado)}
                    >
                      Estado
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      color={empleado.activo ? "error" : "success"}
                      onClick={() => onToggleActivo(empleado)}
                    >
                      {empleado.activo ? "Desactivar" : "Activar"}
                    </Button>
                  </Stack>
                ) : (
                  <Chip label="Solo lectura" size="small" variant="outlined" />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default EmpleadoTable;
