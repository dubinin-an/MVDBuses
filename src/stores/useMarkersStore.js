// useMarkersStore.js
import { defineStore } from 'pinia';
import _ from "lodash";

const devMode = () => {
  if (import.meta.env.MODE === 'development') return true;
  return false;
};

export const useMarkersStore = defineStore('markers', {
  state: () => ({
    markers: [],
    mapActiveState: false,
    busPayload: {
      "empresa": "-1",
      "lineas": [] //["100"]
    }
  }),
  actions: {
    setMapActiveState(state) {
      this.mapActiveState = state;
    },
    setBusPayload(state) {
      // Добавьте реализацию при необходимости
    },
    async getBusMarkers() {
      console.log('getBusMarkers DEV', devMode());

      const url = 'http://localhost/stm-online' + (devMode() ? '-mock' : '');

      const temp = _.cloneDeep(this.busPayload);
      if (temp.lineas.length === 0) delete temp.lineas;

      do {
        try {
          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(temp)
          });

          if (response.ok) {
            const markers = await response.json();
            markers.features.forEach(feature => {
              feature.geometry.coordinates.reverse();
              const temp = {
                id: feature.properties.id,
                type: 'bus',//feature.properties.tipoLineaDesc,
                name: feature.properties.linea,
                line:feature.properties.sublinea,
                status: feature.properties.codigoEmpresa
              };
              this.markers.push({
                geometry: feature.geometry,
                properties: temp
              });
            });
            break;
          }
        } catch (error) {
          console.error("Failed to fetch bus markers:", error);
        }
      } while (this.mapActiveState);
    }
  }
});
