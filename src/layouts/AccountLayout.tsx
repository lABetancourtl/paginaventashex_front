import { Outlet } from 'react-router'
import AccountNav from '../features/account/components/AccountNav'

function AccountLayout() {
  return (
    <div className="md:grid md:grid-cols-[14rem_1fr] md:gap-10">
      {/* Menú lateral: solo desde tablet */}
      <aside className="hidden md:block">
        <AccountNav />
      </aside>

      <div>
        <Outlet />
      </div>
    </div>
  )
}

export default AccountLayout