const round2 = (value) => Number((Number(value) || 0).toFixed(2));

export const normalizeDiscountPercentage = (value) => {
  if (value == null || value === "") return 0;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? round2(parsed) : 0;
};

export const calculateComboPreviewLine = ({
  salePrice,
  quantity,
  permiteCombo,
  comboUnidades,
  comboPrecio,
}) => {
  const precioNormal = round2(salePrice);
  const cantidad = Number(quantity) || 0;
  const unidadesCombo = Number(comboUnidades || 0);
  const precioCombo = round2(comboPrecio);
  const comboValido =
    Boolean(permiteCombo) &&
    Number.isInteger(unidadesCombo) &&
    unidadesCombo > 1 &&
    precioCombo > 0;

  if (!comboValido) {
    return {
      comboAplicado: false,
      comboUnidades: null,
      comboPrecio: null,
      comboCantidad: 0,
      unidadesSueltas: cantidad,
      subtotalLista: round2(precioNormal * cantidad),
      precioListaUnitario: precioNormal,
    };
  }

  const comboCantidad = Math.floor(cantidad / unidadesCombo);
  const unidadesSueltas = cantidad % unidadesCombo;
  const comboAplicado = comboCantidad > 0;
  const subtotalLista = comboAplicado
    ? round2(comboCantidad * precioCombo + unidadesSueltas * precioNormal)
    : round2(precioNormal * cantidad);

  return {
    comboAplicado,
    comboUnidades: unidadesCombo,
    comboPrecio: precioCombo,
    comboCantidad,
    unidadesSueltas,
    subtotalLista,
    precioListaUnitario: cantidad > 0 ? round2(subtotalLista / cantidad) : precioNormal,
  };
};

export const calculateDiscountedPreviewLine = ({
  salePrice,
  costPrice,
  quantity,
  discountPercentage,
  permiteCombo = false,
  comboUnidades = null,
  comboPrecio = null,
}) => {
  const combo = calculateComboPreviewLine({
    salePrice,
    quantity,
    permiteCombo,
    comboUnidades,
    comboPrecio,
  });
  const precioListaUnitario = combo.precioListaUnitario;
  const costoUnitario = round2(costPrice);
  const cantidad = Number(quantity) || 0;
  const porcentaje = normalizeDiscountPercentage(discountPercentage);

  if (combo.comboAplicado) {
    const descuentoTotal = round2(combo.subtotalLista * (porcentaje / 100));
    const subtotal = round2(combo.subtotalLista - descuentoTotal);
    const precioFinalUnitario = cantidad > 0 ? round2(subtotal / cantidad) : 0;
    const descuentoAplicadoUnitario =
      cantidad > 0 ? round2(descuentoTotal / cantidad) : 0;
    const utilidad = round2(subtotal - costoUnitario * cantidad);

    return {
      precioListaUnitario,
      costoUnitario,
      descuentoPorcentaje: porcentaje,
      descuentoAplicadoUnitario,
      precioFinalUnitario,
      descuentoTotal,
      subtotal,
      utilidad,
      comboAplicado: true,
      comboUnidades: combo.comboUnidades,
      comboPrecio: combo.comboPrecio,
      comboCantidad: combo.comboCantidad,
      unidadesSueltas: combo.unidadesSueltas,
      comboSubtotalLista: combo.subtotalLista,
    };
  }

  const gananciaUnitaria = round2(
    Math.max(precioListaUnitario - costoUnitario, 0)
  );
  const descuentoUnitario = round2(gananciaUnitaria * (porcentaje / 100));
  const precioFinalUnitario = round2(
    Math.max(costoUnitario, precioListaUnitario - descuentoUnitario)
  );
  const descuentoAplicadoUnitario = round2(
    precioListaUnitario - precioFinalUnitario
  );
  const descuentoTotal = round2(descuentoAplicadoUnitario * cantidad);
  const subtotal = round2(precioFinalUnitario * cantidad);
  const utilidad = round2(subtotal - costoUnitario * cantidad);

  return {
    precioListaUnitario,
    costoUnitario,
    descuentoPorcentaje: porcentaje,
    descuentoAplicadoUnitario,
    precioFinalUnitario,
    descuentoTotal,
    subtotal,
    utilidad,
    comboAplicado: combo.comboAplicado,
    comboUnidades: combo.comboUnidades,
    comboPrecio: combo.comboPrecio,
    comboCantidad: combo.comboCantidad,
    unidadesSueltas: combo.unidadesSueltas,
    comboSubtotalLista: combo.subtotalLista,
  };
};

export const calculateDiscountSummary = (items = [], discountPercentage = 0) => {
  return items.reduce(
    (acc, item) => {
      const line = calculateDiscountedPreviewLine({
        salePrice: item.precio_venta,
        costPrice: item.precio_compra,
        quantity: item.cantidad,
        discountPercentage,
        permiteCombo: item.permite_combo,
        comboUnidades: item.combo_unidades,
        comboPrecio: item.combo_precio,
      });

      acc.totalLista += line.comboSubtotalLista ?? line.precioListaUnitario * Number(item.cantidad || 0);
      acc.totalFinal += line.subtotal;
      acc.totalDescuento += line.descuentoTotal;
      acc.totalUtilidad += line.utilidad;

      return acc;
    },
    {
      totalLista: 0,
      totalFinal: 0,
      totalDescuento: 0,
      totalUtilidad: 0,
    }
  );
};
