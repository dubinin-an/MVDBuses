import { defineStore } from 'pinia'
import { useUcotStore } from 'stores/ucot'
const ucot = useUcotStore()


export const useMarkerStore = defineStore('marker', {
  state: () => ({
    stops: [...ucot.stopMarkers]
  })
})
