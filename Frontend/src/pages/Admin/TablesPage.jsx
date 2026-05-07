import { useOutletContext } from 'react-router-dom'
import { TablesTab } from './tabs/TablesTab.jsx'

export function TablesPage() {
  const {
    sortedTables,
    tableStats,
    loadingTables,
    loadTables,
    qrLinksByTableNumber,
    loadQrLinks,
    printTableQRCodes,
    activeOrdersByTable,
    navigateToSection,
  } = useOutletContext()

  return (
    <TablesTab
      sortedTables={sortedTables}
      tableStats={tableStats}
      loadingTables={loadingTables}
      loadTables={loadTables}
      qrLinksByTableNumber={qrLinksByTableNumber}
      loadQrLinks={loadQrLinks}
      printTableQRCodes={printTableQRCodes}
      activeOrdersByTable={activeOrdersByTable}
      onViewOrders={(tableId) => navigateToSection('orders', `table=${tableId}`)}
    />
  )
}
