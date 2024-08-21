import { useBusOnlineMarkersStore } from 'stores/useBusOnlineMarkersStore'
const store = useBusOnlineMarkersStore();


export function searchBus(param){
  console.log('searchBus', param)
  let send = ''
  if (param === '') send = []
  else send = param.split(',')
  store.setBusPayload({"lineas": send})
}
export function searchCompany(param){
  console.log('searchCompany', param)
  store.setBusPayload({"empresa": param})
}
export function searchStop(param){
  console.log('searchStop', param)

}
