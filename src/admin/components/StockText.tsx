const LOW_STOCK = 5

function StockText({ stock }: { stock: number }) {
  if (stock <= 0) return <span className="font-medium text-danger">Agotado</span>
  if (stock <= LOW_STOCK) return <span className="font-medium text-amber-700">{stock} (bajo)</span>
  return <span>{stock}</span>
}

export default StockText