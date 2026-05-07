import { useOutletContext } from 'react-router-dom'
import { MenuTab } from './tabs/MenuTab.jsx'

export function AdminMenuPage() {
  const { prodList, addProduct, updateProduct, removeProduct } =
    useOutletContext()

  return (
    <MenuTab
      prodList={prodList}
      addProduct={addProduct}
      updateProduct={updateProduct}
      removeProduct={removeProduct}
    />
  )
}
