import { useUcotStore } from 'stores/ucot'
import { useCutcsaStore } from 'stores/cutcsa'
import { useBusOnlineMarkersStore} from 'stores/useBusOnlineMarkersStore'
import { mergeStops } from 'src/lib/tools'

export const getLineNumbers = () =>  {
  const ucot = useUcotStore()
  const cutcsa = useCutcsaStore()
  ucot.getLinesNumber()
}

export const getStops = () => {
  const ucot = useUcotStore()
  const cutcsa = useCutcsaStore()

  ucot.getStopsFromServer()
  cutcsa.getStopsFromServer()
}

let ms = null
export const stopMarkers = () => {
  const ucot = useUcotStore()
  const cutcsa = useCutcsaStore()
  if (ms === null) ms = mergeStops([
    ...ucot.stopMarkers,
    ...cutcsa.stopMarkers,
  ])
    return ms
}

export const busOnlineMarkers = () => {
  const busOnline = useBusOnlineMarkersStore()
  return busOnline.markers
}


