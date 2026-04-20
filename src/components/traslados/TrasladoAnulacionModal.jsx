import { useState, useEffect } from "react";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

function TrasladoAnulacionModal({ open, onClose, onConfirm, traslado, loading }) {
  const [motivo, setMotivo] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setMotivo("");
      setError("");
    }
  }, [open]);

  const enviar = () => {
    const m = motivo.trim();
    if (m.length < 3) {
      setError("El motivo debe tener al menos 3 caracteres");
      return;
    }
    onConfirm(m);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Anular traslado</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2}>
          {traslado && (
            <Typography variant="body2" color="text.secondary">
              Vas a anular el traslado{" "}
              <b>{traslado.folio || `#${traslado.id_traslado}`}</b> de{" "}
              <b>{traslado.bodega_origen_nombre}</b> a{" "}
              <b>{traslado.bodega_destino_nombre}</b>. Se devolvera el stock a la
              bodega origen y se descontara de la bodega destino.
            </Typography>
          )}

          <Alert severity="warning">
            Si en la bodega destino ya no existen las unidades (se vendieron o
            consumieron), la anulacion fallara. No se permite dejar stock
            negativo.
          </Alert>

          <TextField
            label="Motivo de anulacion"
            placeholder="Ej. Error al seleccionar productos"
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            fullWidth
            multiline
            minRows={2}
            inputProps={{ maxLength: 200 }}
            disabled={loading}
          />

          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          color="error"
          variant="contained"
          onClick={enviar}
          disabled={loading}
          startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
        >
          {loading ? "Anulando..." : "Confirmar anulacion"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default TrasladoAnulacionModal;
