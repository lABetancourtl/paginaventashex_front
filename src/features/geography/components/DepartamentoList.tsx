import { useDepartamentos } from '../hooks/useDepartamentos';

function DepartamentoList() {
  // Toda la lógica de carga está en el hook
  const { departamentos, isLoading, error } = useDepartamentos()

  if (isLoading) {
    return <p>Cargando departamentos...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
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

export default DepartamentoList;