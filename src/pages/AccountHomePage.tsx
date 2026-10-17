import AccountNav from '../features/account/components/AccountNav'

function AccountHomePage() {
  return (
    <>
      {/* Celular: el menú de cuenta es el contenido de la página */}
      <div className="md:hidden">
        <AccountNav />
      </div>

      {/* Computador: el menú ya está a la izquierda */}
      <p className="hidden border border-line p-10 text-center text-ink-muted md:block">
        Elige una sección del menú para ver o editar tu información.
      </p>
    </>
  )
}

export default AccountHomePage