import { useRef } from "react";
import LocalCarWashIcon from "@mui/icons-material/LocalCarWash";
import BuildIcon from "@mui/icons-material/Build";
import StorefrontIcon from "@mui/icons-material/Storefront";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import {
  Box,
  Button,
  Container,
  Paper,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Link as RouterLink } from "react-router-dom";
import {
  getSummaryCardSx,
  getSummaryIconWrapSx,
  getSummaryValueSx,
} from "../utils/summaryCardStyles";

function Servicios() {
  const theme = useTheme();
  const servicesBackgroundUrl = "/fondo-de-servicios.jpeg";
  const backgroundRef = useRef(null);
  const serviceCards = [
    {
      title: "Autolavado",
      description: "Gestiona servicios de lavado, recepcion de vehiculos y seguimiento rapido.",
      to: "/carwash/autolavado",
      icon: LocalCarWashIcon,
      tone: "primary",
    },
    {
      title: "Reparacion",
      description: "Administra diagnosticos, trabajos de taller y control de mantenimientos.",
      to: "/carwash/reparacion",
      icon: BuildIcon,
      tone: "secondary",
    },
    {
      title: "Tienda",
      description: "Registra ventas de productos exclusivos de tienda sin mezclar el catalogo general del POS.",
      to: "/servicios/tienda",
      icon: StorefrontIcon,
      tone: "success",
    },
  ];

  const handleBackgroundMove = (event) => {
    const element = backgroundRef.current;
    if (!element) return;

    const bounds = element.getBoundingClientRect();
    const xRatio = (event.clientX - bounds.left) / bounds.width - 0.5;
    const yRatio = (event.clientY - bounds.top) / bounds.height - 0.5;

    element.style.setProperty("--services-bg-x", `${xRatio * 16}px`);
    element.style.setProperty("--services-bg-y", `${yRatio * 12}px`);
  };

  const resetBackgroundMove = () => {
    const element = backgroundRef.current;
    if (!element) return;

    element.style.setProperty("--services-bg-x", "0px");
    element.style.setProperty("--services-bg-y", "0px");
  };

  return (
    <Box
      ref={backgroundRef}
      onMouseMove={handleBackgroundMove}
      onMouseLeave={resetBackgroundMove}
      sx={{
        "--services-bg-x": "0px",
        "--services-bg-y": "0px",
        "--services-bg-scale": "1.05",
        position: "relative",
        minHeight: "calc(100vh - 120px)",
        mx: { xs: -2, md: -3 },
        mt: { xs: -2, md: -3 },
        px: { xs: 2, md: 3 },
        py: { xs: 3, md: 4 },
        overflow: "hidden",
        isolation: "isolate",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          zIndex: -2,
          backgroundImage: `
            linear-gradient(135deg, rgba(10, 15, 28, 0.82) 0%, rgba(14, 23, 41, 0.62) 42%, rgba(10, 15, 28, 0.82) 100%),
            radial-gradient(circle at top right, rgba(59, 130, 246, 0.18), transparent 36%),
            radial-gradient(circle at bottom left, rgba(244, 114, 182, 0.12), transparent 30%),
            url(${servicesBackgroundUrl})
          `,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          filter: "saturate(1.04) contrast(1.01)",
          transform:
            "translate3d(var(--services-bg-x), var(--services-bg-y), 0) scale(var(--services-bg-scale))",
          transition: "transform 260ms ease-out, filter 260ms ease-out",
        },
        "&::after": {
          content: '""',
          position: "absolute",
          inset: 0,
          zIndex: -1,
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 28%, rgba(255,255,255,0.00) 100%)",
          pointerEvents: "none",
        },
        "&:hover": {
          "--services-bg-scale": "1.08",
        },
        "&:hover::before": {
          filter: "saturate(1.1) contrast(1.04)",
        },
      }}
    >
      <Container maxWidth="xl" sx={{ py: 0 }}>
      <Box
        sx={{
          maxWidth: 1200,
          mx: "auto",
          px: { xs: 0, md: 0 },
          py: { xs: 0, md: 0 },
        }}
      >
        <Paper
          elevation={0}
          sx={(currentTheme) => ({
            ...getSummaryCardSx(currentTheme, "primary", { minHeight: 0 }),
            mb: 3,
            background:
              currentTheme.palette.mode === "dark"
                ? "linear-gradient(180deg, rgba(15,23,42,0.78) 0%, rgba(15,23,42,0.64) 100%)"
                : "linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(255,255,255,0.78) 100%)",
            backdropFilter: "blur(16px)",
            border:
              currentTheme.palette.mode === "dark"
                ? "1px solid rgba(148, 163, 184, 0.20)"
                : "1px solid rgba(255, 255, 255, 0.68)",
            boxShadow:
              currentTheme.palette.mode === "dark"
                ? "0 18px 40px rgba(2, 6, 23, 0.26)"
                : "0 20px 45px rgba(15, 23, 42, 0.12)",
          })}
        >
          <Stack spacing={1.5}>
            <Typography variant="overline" color="primary.main" sx={{ fontWeight: 800, letterSpacing: "0.16em" }}>
              Operacion diaria
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              Servicios
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Selecciona el area de trabajo para autolavado, reparacion o venta de tienda con una interfaz mas clara, visual y rapida.
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} useFlexGap flexWrap="wrap">
              <Chip color="primary" variant="outlined" label="Autolavado" />
              <Chip color="secondary" variant="outlined" label="Reparacion" />
              <Chip color="success" variant="outlined" label="Tienda" />
            </Stack>
          </Stack>
        </Paper>

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
              sx={(currentTheme) => ({
                ...getSummaryCardSx(currentTheme, service.tone, {
                  interactive: true,
                  minHeight: 248,
                }),
                background:
                  currentTheme.palette.mode === "dark"
                    ? "linear-gradient(180deg, rgba(15,23,42,0.84) 0%, rgba(15,23,42,0.72) 100%)"
                    : "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,255,255,0.84) 100%)",
                backdropFilter: "blur(14px)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                textDecoration: "none",
                color: "inherit",
              })}
            >
              <Stack spacing={2}>
                <Box sx={getSummaryIconWrapSx(theme, service.tone)}>
                  <service.icon sx={{ fontSize: 34 }} />
                </Box>

                <Box>
                  <Typography
                    variant="h5"
                    fontWeight="bold"
                    gutterBottom
                    sx={getSummaryValueSx(theme, service.tone)}
                  >
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
                  boxShadow: "none",
                }}
              >
                Ir a {service.title}
              </Button>
            </Paper>
          ))}
        </Box>
      </Box>
    </Container>
    </Box>
  );
}

export default Servicios;
