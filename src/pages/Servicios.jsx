import LocalCarWashIcon from "@mui/icons-material/LocalCarWash";
import BuildIcon from "@mui/icons-material/Build";
import StorefrontIcon from "@mui/icons-material/Storefront";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

function Servicios() {
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
    {
      title: "Tienda",
      description: "Registra ventas de productos exclusivos de tienda sin mezclar el catalogo general del POS.",
      to: "/servicios/tienda",
      icon: <StorefrontIcon sx={{ fontSize: 34 }} />,
      accent: "linear-gradient(135deg, rgba(34,197,94,0.24), rgba(16,185,129,0.12))",
      borderColor: "rgba(34,197,94,0.32)",
    },
  ];

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        <Stack spacing={1} mb={3}>
          <Typography variant="h4" fontWeight="bold">
            Servicios
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Selecciona el area de trabajo para autolavado, reparacion o venta de tienda.
          </Typography>
        </Stack>

        <Box
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(3, minmax(0, 1fr))",
            },
          }}
        >
          {serviceCards.map((service) => (
            <Paper
              key={service.title}
              component={RouterLink}
              to={service.to}
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
                textDecoration: "none",
                color: "inherit",
                transition: "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
                "&:hover": {
                  transform: "translateY(-4px)",
                  boxShadow: 8,
                  borderColor: "rgba(96,165,250,0.45)",
                },
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
