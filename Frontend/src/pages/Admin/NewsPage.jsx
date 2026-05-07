import { useOutletContext } from 'react-router-dom'
import { NewsTab } from './tabs/NewsTab.jsx'

export function AdminNewsPage() {
  const { news, addNews, updateNews, removeNews } = useOutletContext()

  return (
    <NewsTab
      news={news}
      addNews={addNews}
      updateNews={updateNews}
      removeNews={removeNews}
    />
  )
}
