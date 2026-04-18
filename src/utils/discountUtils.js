const round2 = (value) => Number((Number(value) || 0).toFixed(2));

export const normalizeDiscountPercentage = (value) => {
  if (value == null || value === "") return 0;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? round2(parsed) : 0;
};

export const calculateDiscountedPreviewLine = ({
  salePrice,
  costPrice,
  quantity,
  discountPercentage,
}) => {
  const precioListaUnitario = round2(salePrice);
  const costoUnitario = round2(costPrice);
  const cantidad = Number(quantity) || 0;
  const porcentaje = normalizeDiscountPercentage(discountPercentage);

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
      });

      acc.totalLista += line.precioListaUnitario * Number(item.cantidad || 0);
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
