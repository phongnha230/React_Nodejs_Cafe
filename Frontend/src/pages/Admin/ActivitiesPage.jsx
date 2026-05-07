import { useOutletContext } from 'react-router-dom'
import { ActivitiesTab } from './tabs/ActivitiesTab.jsx'

export function ActivitiesPage() {
  const { activityItems, addActivity, removeActivity } = useOutletContext()

  return (
    <ActivitiesTab
      activityItems={activityItems}
      addActivity={addActivity}
      removeActivity={removeActivity}
    />
  )
}
