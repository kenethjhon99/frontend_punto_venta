import LocalCarWashIcon from "@mui/icons-material/LocalCarWash";
import BuildIcon from "@mui/icons-material/Build";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { userHasRole } from "../utils/roles";

function Servicios() {
  const { user } = useAuth();
  const canManageCatalog = userHasRole(user, "SUPER_ADMIN", "ADMIN");
  const serviceCards = [
    {
      title: "Autolavado",
      description: "Gestiona servicios de lavado, recepcion de vehiculos y seguimiento rapido.",
      to: "/carwash/autolavado",
      icon: <LocalCarWashIcon sx={{ fontSize: 34 }} />,
      accent: "linear-gradient(135deg, rgba(59,130,246,0.32), rgba(14,165,233,0.14))",
      borderColor: "rgba(96,165,250,0.35)",
    },
    {
      title: "Reparacion",
      description: "Administra diagnosticos, trabajos de taller y control de mantenimientos.",
      to: "/carwash/reparacion",
      icon: <BuildIcon sx={{ fontSize: 34 }} />,
      accent: "linear-gradient(135deg, rgba(148,163,184,0.28), rgba(59,130,246,0.12))",
      borderColor: "rgba(148,163,184,0.3)",
    },
    ...(canManageCatalog
      ? [
          {
            title: "Catalogo",
            description: "Crea y edita tipos de vehiculo y servicios en una pagina dedicada.",
            to: "/servicios/catalogo",
            icon: <Inventory2OutlinedIcon sx={{ fontSize: 34 }} />,
            accent: "linear-gradient(135deg, rgba(34,197,94,0.24), rgba(16,185,129,0.12))",
            borderColor: "rgba(34,197,94,0.28)",
          },
        ]
      : []),
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        <Stack spacing={1} mb={3}>
          <Typography variant="h4" fontWeight="bold">
            Servicios
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Selecciona el area de trabajo para autolavado o reparacion.
          </Typography>
        </Stack>

        <Box
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2, minmax(0, 1fr))",
              xl: "repeat(3, minmax(0, 1fr))",
            },
          }}
        >
          {serviceCards.map((service) => (
            <Paper
              key={service.title}
              elevation={3}
              sx={{
                p: 3,
                borderRadius: 4,
                minHeight: 220,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                background: service.accent,
                border: `1px solid ${service.borderColor}`,
              }}
            >
              <Stack spacing={2}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: 3,
                    display: "grid",
                    placeItems: "center",
                    bgcolor: "rgba(255,255,255,0.08)",
                    color: "#fff",
                  }}
                >
                  {service.icon}
                </Box>

                <Box>
                  <Typography variant="h5" fontWeight="bold" gutterBottom>
                    {service.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {service.description}
                  </Typography>
                </Box>
              </Stack>

              <Button
                component={RouterLink}
                to={service.to}
                variant="contained"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  alignSelf: "flex-start",
                  mt: 3,
                  borderRadius: 999,
                  px: 3,
                  fontWeight: 700,
                }}
              >
                Ir a {service.title}
              </Button>
            </Paper>
          ))}
        </Box>
      </Box>
    </Container>
  );
}

export default Servicios;
