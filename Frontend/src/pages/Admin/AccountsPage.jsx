import { useOutletContext } from 'react-router-dom'
import { AccountsTab } from './tabs/AccountsTab.jsx'

export function AccountsPage() {
  const { users, usersLoading, loadUsers, removeUser } = useOutletContext()

  return (
    <AccountsTab
      users={users}
      usersLoading={usersLoading}
      loadUsers={loadUsers}
      removeUser={removeUser}
    />
  )
}
