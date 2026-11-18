const LOW_STOCK = 5

// Unidades con un indicador de color: agotado, bajo o disponible
function StockText({ stock }: { stock: number }) {
  if (stock <= 0) {
    return (
      <span className="inline-flex items-center gap-1.5 font-medium text-danger">
        <span aria-hidden="true" className="size-1.5 rounded-full bg-danger" />
        Agotado
      </span>
    )
  }
  if (stock <= LOW_STOCK) {
    return (
      <span className="inline-flex items-center gap-1.5 font-medium text-amber-700">
        <span aria-hidden="true" className="size-1.5 rounded-full bg-amber-500" />
        {stock} <span className="font-normal">(bajo)</span>
      </span>
    )
  }
  return <span className="tabular-nums">{stock}</span>
}

export default StockText
