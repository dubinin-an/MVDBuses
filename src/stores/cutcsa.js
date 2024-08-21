import { defineStore } from 'pinia'
import _ from 'lodash'

const token = 'o0Xth2O4a7SaaoW8tM9vi77+082ea6ac2241mgQUwGNnn9eoseZ4NRs45p34ipCK'

export const useCutcsaStore = defineStore('cutcsa', {
  state: () => ({
    linesNumbers: [],
    lines: [],
    stops: [],
  }),
  actions: {
    async getStopsFromServer () {
      // https://appmobile.cutcsa.com.uy/api/Cutcsa/GetBusStops/V1/o0Xth2O4a7SaaoW8tM9vi77+082ea6ac2241mgQUwGNnn9eoseZ4NRs45p34ipCK/undefined
      const uri = `http://localhost/cutcsa/api/Cutcsa/GetBusStops/V1/${token}/undefined`
      try {
        const response = await fetch(uri);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        } else {
          const res = await response.json()
          this.stops = res.BusStops;
          // console.log(this.stops)
        }
      } catch (error) {
        console.error('Ошибка при запросе страницы:', error);
      }
    }
  },
  getters: {
    stopMarkers (state) {
      return state.stops.map(stop => {
        const temp = _.cloneDeep(stop)
        delete temp.Latitude
        delete temp.Longitude
        temp.type = 'stop'
        temp.status = 0
        return {
          geometry: { type: "Point", coordinates: [stop.Latitude, stop.Longitude] },
          properties: temp,
          type: "Feature"
        }
      })
    }
  }
})
