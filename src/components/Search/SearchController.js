import { useMarkersStore } from 'stores/useMarkersStore'
const store = useMarkersStore();


export function searchBus(param){
  console.log('searchBus', param)
  store.setBusPayload({"lineas": param.split(',')})
}
export function searchCompany(param){
  console.log('searchCompany', param)
  store.setBusPayload({"empresa": param})
}
export function searchStop(param){
  console.log('searchStop', param)

}
