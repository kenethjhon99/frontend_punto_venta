import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import api from "../services/api";

import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Avatar,
  InputAdornment,
  IconButton,
  CircularProgress,
} from "@mui/material";

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mostrarPassword, setMostrarPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", form);
      const { token, user } = res.data;

      login(user, token);

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
        background:
          "linear-gradient(135deg, rgba(25,118,210,0.12) 0%, rgba(156,39,176,0.10) 100%)",
      }}
    >
      <Paper
        elevation={10}
        sx={{
          width: "100%",
          maxWidth: 420,
          p: 4,
          borderRadius: 4,
          backdropFilter: "blur(8px)",
        }}
      >
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2.5,
          }}
        >
          <Box display="flex" flexDirection="column" alignItems="center" gap={1}>
            <Avatar
              sx={{
                bgcolor: "primary.main",
                width: 60,
                height: 60,
                boxShadow: 3,
              }}
            >
              <LockOutlinedIcon fontSize="large" />
            </Avatar>

            <Typography variant="h4" fontWeight="bold" textAlign="center">
              Iniciar sesión
            </Typography>

            <Typography variant="body2" color="text.secondary" textAlign="center">
              Ingresa a tu sistema de punto de venta
            </Typography>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Usuario"
            name="username"
            value={form.username}
            onChange={handleChange}
            fullWidth
            required
            autoFocus
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonOutlineIcon color="action" />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            label="Contraseña"
            name="password"
            type={mostrarPassword ? "text" : "password"}
            value={form.password}
            onChange={handleChange}
            fullWidth
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setMostrarPassword((prev) => !prev)}
                    edge="end"
                  >
                    {mostrarPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Button
            type="submit"
            variant="contained"
            size="large"
            disabled={loading}
            sx={{
              py: 1.5,
              borderRadius: 3,
              fontWeight: "bold",
              boxShadow: 4,
            }}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Ingresar"}
          </Button>

          <Typography variant="caption" color="text.secondary" textAlign="center">
            Acceso seguro al sistema
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
}

export default Login;
