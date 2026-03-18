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

function UsuarioTable({
  usuarios = [],
  onEdit,
  onToggleActivo,
}) {
  if (!usuarios.length) {
    return (
      <Paper sx={{ p: 4, textAlign: "center" }} elevation={0}>
        <Typography color="text.secondary">
          No hay usuarios para mostrar.
        </Typography>
      </Paper>
    );
  }

  return (
    <TableContainer component={Paper} elevation={0}>
      <Table sx={{ minWidth: 980 }}>
        <TableHead>
          <TableRow sx={{ backgroundColor: "#f8fafc" }}>
            <TableCell sx={{ fontWeight: "bold" }}>Usuario</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Nombre</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Telefono</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Roles</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Estado</TableCell>
            <TableCell align="center" sx={{ fontWeight: "bold" }}>
              Acciones
            </TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {usuarios.map((usuario) => (
            <TableRow key={usuario.id_usuario} hover>
              <TableCell>
                <Typography fontWeight={700}>{usuario.username}</Typography>
              </TableCell>

              <TableCell>
                <Typography fontWeight={600}>
                  {usuario.persona_nombre || usuario.nombre || "-"} {usuario.persona_apellido || ""}
                </Typography>
              </TableCell>

              <TableCell>{usuario.telefono || "-"}</TableCell>

              <TableCell>
                <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                  {(usuario.roles || []).map((rol) => (
                    <Chip
                      key={`${usuario.id_usuario}-${rol.id_rol}`}
                      label={rol.nombre_rol}
                      size="small"
                      color={rol.nombre_rol === "SUPER_ADMIN" ? "secondary" : "primary"}
                      variant="outlined"
                    />
                  ))}
                </Stack>
              </TableCell>

              <TableCell>
                <Chip
                  label={usuario.activo ? "Activo" : "Inactivo"}
                  color={usuario.activo ? "success" : "default"}
                  size="small"
                  variant={usuario.activo ? "filled" : "outlined"}
                />
              </TableCell>

              <TableCell align="center">
                <Stack direction="row" spacing={1} justifyContent="center">
                  <Button size="small" variant="outlined" onClick={() => onEdit(usuario)}>
                    Editar
                  </Button>

                  <Button
                    size="small"
                    variant="outlined"
                    color={usuario.activo ? "error" : "success"}
                    onClick={() => onToggleActivo(usuario)}
                  >
                    {usuario.activo ? "Desactivar" : "Activar"}
                  </Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

export default UsuarioTable;
