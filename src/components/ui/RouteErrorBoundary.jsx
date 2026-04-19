import { Component } from "react";
import { Alert, Box, Button, Stack, Typography } from "@mui/material";

class RouteErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: String(error?.message || "No se pudo cargar esta pantalla."),
    };
  }

  componentDidCatch(error) {
    console.error("Route render error:", error);
  }

  handleRetry = () => {
    this.setState({ hasError: false, errorMessage: "" });
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 3,
          py: 6,
        }}
      >
        <Stack spacing={2.5} sx={{ width: "100%", maxWidth: 560 }}>
          <Alert severity="error" sx={{ borderRadius: 3 }}>
            No se pudo cargar esta pantalla.
          </Alert>
          <Typography variant="body1" color="text.secondary">
            {this.state.errorMessage}
          </Typography>
          <Button variant="contained" onClick={this.handleRetry}>
            Recargar pantalla
          </Button>
        </Stack>
      </Box>
    );
  }
}

export default RouteErrorBoundary;
