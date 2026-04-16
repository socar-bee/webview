import { Suspense } from 'react'

import MapView from './view/MapView'

export default function MapPage() {
  return (
    <Suspense>
      <MapView />
    </Suspense>
  )
}
