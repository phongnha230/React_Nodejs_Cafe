import { useOutletContext } from 'react-router-dom'
import { TablesTab } from './tabs/TablesTab.jsx'

export function TablesPage() {
  const {
    sortedTables,
    tableStats,
    loadingTables,
    loadTables,
    createTable,
    updateTable,
    removeTable,
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
      createTable={createTable}
      updateTable={updateTable}
      removeTable={removeTable}
      qrLinksByTableNumber={qrLinksByTableNumber}
      loadQrLinks={loadQrLinks}
      printTableQRCodes={printTableQRCodes}
      activeOrdersByTable={activeOrdersByTable}
      onViewOrders={(tableId) => navigateToSection('orders', `table=${tableId}`)}
    />
  )
}
