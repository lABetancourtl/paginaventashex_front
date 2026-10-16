import { useDepartamentos } from '../hooks/useDepartamentos'

function DepartamentoList() {
  const { data: departamentos, isPending, error } = useDepartamentos()

  if (isPending) {
    return <p>Cargando departamentos...</p>
  }

  if (error) {
    return <p>Error: {error.message}</p>
  }

  return (
    <div>
      <h2>Departamentos</h2>
      <ul>
        {departamentos.map((dept) => (
          <li key={dept.codigo}>
            {dept.codigo} - {dept.nombre}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default DepartamentoList