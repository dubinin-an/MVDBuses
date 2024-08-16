import { useUcotStore } from 'stores/ucot'

export const getLineNumbers = () =>  {
  const ucot = useUcotStore()

  ucot.getLinesNumber()
}

export const getStops = () => {
  const ucot = useUcotStore()

  ucot.getStops()
}
