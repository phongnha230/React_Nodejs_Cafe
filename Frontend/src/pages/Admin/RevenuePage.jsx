import { useOutletContext } from 'react-router-dom'
import { RevenueTab } from './tabs/RevenueTab.jsx'

export function RevenuePage() {
  const { stats, orders } = useOutletContext()

  return <RevenueTab stats={stats} orders={orders} />
}
