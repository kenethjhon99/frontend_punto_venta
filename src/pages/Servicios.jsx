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
import { alpha, useTheme } from "@mui/material/styles";
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
  const isLightMode = theme.palette.mode === "light";
  const glassTextPrimary = isLightMode ? "#0f172a" : "#f8fafc";
  const glassTextSecondary = isLightMode
    ? "rgba(15, 23, 42, 0.78)"
    : "rgba(226, 232, 240, 0.88)";
  const heroSurface = isLightMode
    ? `linear-gradient(180deg, ${alpha("#ffffff", 0.68)} 0%, ${alpha(
        "#f8fafc",
        0.58
      )} 100%)`
    : "linear-gradient(180deg, rgba(15,23,42,0.80) 0%, rgba(15,23,42,0.70) 100%)";
  const cardSurface = isLightMode
    ? `linear-gradient(180deg, ${alpha("#ffffff", 0.52)} 0%, ${alpha(
        "#e2e8f0",
        0.38
      )} 100%)`
    : "linear-gradient(180deg, rgba(15,23,42,0.78) 0%, rgba(15,23,42,0.68) 100%)";
  const heroBorder = isLightMode
    ? alpha("#ffffff", 0.44)
    : alpha("#93c5fd", 0.16);
  const heroShadow = isLightMode
    ? "0 22px 55px rgba(15, 23, 42, 0.18)"
    : "0 20px 45px rgba(2, 6, 23, 0.24)";
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
            ${
              isLightMode
                ? `linear-gradient(135deg, rgba(255, 255, 255, 0.18) 0%, rgba(248, 250, 252, 0.10) 42%, rgba(15, 23, 42, 0.18) 100%),
                   radial-gradient(circle at top right, rgba(59, 130, 246, 0.16), transparent 36%),
                   radial-gradient(circle at bottom left, rgba(244, 114, 182, 0.10), transparent 30%),`
                : `linear-gradient(135deg, rgba(10, 15, 28, 0.82) 0%, rgba(14, 23, 41, 0.62) 42%, rgba(10, 15, 28, 0.82) 100%),
                   radial-gradient(circle at top right, rgba(59, 130, 246, 0.18), transparent 36%),
                   radial-gradient(circle at bottom left, rgba(244, 114, 182, 0.12), transparent 30%),`
            }
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
          background: isLightMode
            ? "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 28%, rgba(255,255,255,0.00) 100%)"
            : "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 28%, rgba(255,255,255,0.00) 100%)",
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
            color: glassTextPrimary,
            background: heroSurface,
            backdropFilter: "blur(18px)",
            border: `1px solid ${heroBorder}`,
            boxShadow: heroShadow,
          })}
        >
          <Stack spacing={1.5}>
            <Typography
              variant="overline"
              sx={{
                fontWeight: 800,
                letterSpacing: "0.16em",
                color: alpha(theme.palette.primary.light, 0.98),
              }}
            >
              Operacion diaria
            </Typography>
            <Typography variant="h4" fontWeight="bold">
              Servicios
            </Typography>
            <Typography variant="body1" sx={{ color: glassTextSecondary }}>
              Selecciona el area de trabajo para autolavado, reparacion o venta de tienda con una interfaz mas clara, visual y rapida.
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1} useFlexGap flexWrap="wrap">
              <Chip
                color="primary"
                variant="outlined"
                label="Autolavado"
                sx={{
                  bgcolor: alpha(
                    theme.palette.primary.main,
                    isLightMode ? 0.08 : 0.1
                  ),
                }}
              />
              <Chip
                color="secondary"
                variant="outlined"
                label="Reparacion"
                sx={{
                  bgcolor: alpha(
                    theme.palette.secondary.main,
                    isLightMode ? 0.08 : 0.1
                  ),
                }}
              />
              <Chip
                color="success"
                variant="outlined"
                label="Tienda"
                sx={{
                  bgcolor: alpha(
                    theme.palette.success.main,
                    isLightMode ? 0.08 : 0.1
                  ),
                }}
              />
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
                color: glassTextPrimary,
                background: cardSurface,
                backdropFilter: "blur(16px)",
                border: `1px solid ${alpha(
                  service.tone === "primary"
                    ? currentTheme.palette.primary.main
                    : service.tone === "secondary"
                      ? currentTheme.palette.secondary.main
                      : currentTheme.palette.success.main,
                  isLightMode ? 0.34 : 0.24
                )}`,
                boxShadow: isLightMode
                  ? "0 18px 38px rgba(15, 23, 42, 0.14)"
                  : "0 18px 38px rgba(2, 6, 23, 0.18)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                textDecoration: "none",
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
                  <Typography variant="body1" sx={{ color: glassTextSecondary }}>
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
