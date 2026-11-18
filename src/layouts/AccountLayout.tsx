import { Outlet } from 'react-router'
import AccountNav from '../features/account/components/AccountNav'

function AccountLayout() {
  return (
    <div className="mx-auto flex w-full max-w-[60rem] flex-col gap-7">
      <AccountNav />

      {/* Alto mínimo fijo: al cambiar de pestaña la página y el footer no saltan */}
      <div className="min-h-[27.5rem]">
        <Outlet />
      </div>
    </div>
  )
}

export default AccountLayout
