import { useState } from "react";
import {
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

const buildFormState = (usuarioEditando) => {
  const roles = Array.isArray(usuarioEditando?.roles)
    ? usuarioEditando.roles.map((rol) => Number(rol.id_rol))
    : [];

  return {
    username: usuarioEditando?.username || "",
    password: "",
    nombre: usuarioEditando?.persona_nombre || "",
    apellido: usuarioEditando?.persona_apellido || "",
    dpi_persona: usuarioEditando?.dpi_persona || "",
    telefono: usuarioEditando?.telefono || "",
    direccion_persona: usuarioEditando?.direccion_persona || "",
    roles,
  };
};

function UsuarioFormModal({
  open,
  onClose,
  onSave,
  loading = false,
  usuarioEditando = null,
  roles = [],
}) {
  const [form, setForm] = useState(() => buildFormState(usuarioEditando));

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRolesChange = (event) => {
    const value = event.target.value;
    setForm((prev) => ({
      ...prev,
      roles: Array.isArray(value) ? value.map(Number) : [],
    }));
  };

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    onSave({
      username: form.username.trim(),
      password: form.password,
      persona: {
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        dpi_persona: form.dpi_persona.trim(),
        telefono: form.telefono.trim(),
        direccion_persona: form.direccion_persona.trim(),
      },
      roles: form.roles.map(Number),
    });
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Typography variant="h6" fontWeight="bold">
          {usuarioEditando ? "Editar usuario" : "Nuevo usuario"}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2} mt={0.5}>
          <Grid item xs={12} md={usuarioEditando ? 12 : 6}>
            <TextField
              fullWidth
              required
              label="Username"
              name="username"
              value={form.username}
              onChange={handleChange}
            />
          </Grid>

          {!usuarioEditando && (
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                type="password"
                label="Password"
                name="password"
                value={form.password}
                onChange={handleChange}
                helperText="Minimo 4 caracteres."
              />
            </Grid>
          )}

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Nombre"
              name="nombre"
              value={form.nombre}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              required
              label="Apellido"
              name="apellido"
              value={form.apellido}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="DPI"
              name="dpi_persona"
              value={form.dpi_persona}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Telefono"
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Direccion"
              name="direccion_persona"
              value={form.direccion_persona}
              onChange={handleChange}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="roles-usuario-label">Roles</InputLabel>
              <Select
                labelId="roles-usuario-label"
                multiple
                value={form.roles}
                onChange={handleRolesChange}
                input={<OutlinedInput label="Roles" />}
                renderValue={(selected) => (
                  <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                    {selected.map((idRol) => {
                      const rol = roles.find((item) => Number(item.id_rol) === Number(idRol));
                      return (
                        <Chip
                          key={idRol}
                          size="small"
                          label={rol?.nombre_rol || `Rol ${idRol}`}
                        />
                      );
                    })}
                  </Stack>
                )}
              >
                {roles.map((rol) => (
                  <MenuItem key={rol.id_rol} value={Number(rol.id_rol)}>
                    {rol.nombre_rol}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} color="inherit" disabled={loading}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={handleSubmit} disabled={loading}>
          {loading ? <CircularProgress size={24} color="inherit" /> : usuarioEditando ? "Guardar cambios" : "Crear usuario"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default UsuarioFormModal;
