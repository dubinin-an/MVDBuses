// useMarkersStore.js
import { defineStore } from 'pinia';
import _ from "lodash";

export const useMarkersStore = defineStore('markers', {
  state: () => ({
    markers: [],
    mapActiveState: false,
    busPayload: {
      "empresa": "-1",
      "lineas": []
    },
    devmode: import.meta.env.MODE === 'development' // Определяем режим
    // devmode: false // Определяем режим
  }),
  actions: {
    setBusPayload(payload) {
      this.busPayload = Object.assign({}, this.busPayload, payload);
    },
    setMapActiveState(payload) {
      this.mapActiveState = payload;
    },
    async getBusMarkers() {
      console.log('getBusMarkers DEV', this.devmode);

      const minInterval = 1000; // Минимальное время между итерациями в миллисекундах
      const url = this.devmode
        ? 'http://localhost/stm-online-mock' // Моковые данные
        : 'http://localhost/stm-online'; // Реальные данные

      do {
        const startTime = Date.now();

        try {
          const temp = _.cloneDeep(this.busPayload);
          if (temp.lineas.length === 0) delete temp.lineas;

          const response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(temp)
          });

          if (response.ok) {
            const markers = await response.json();
            this.markers = markers.features.map(feature => {
              feature.geometry.coordinates.reverse();
              const temp = {
                id: feature.properties.id,
                type: 'bus',
                name: feature.properties.linea,
                line: feature.properties.sublinea,
                status: feature.properties.codigoEmpresa
              };
              return {
                geometry: feature.geometry,
                properties: temp
              };
            });
            if (this.devmode) break; // В режиме разработки делаем запрос только один раз
          }
        } catch (error) {
          console.error("Failed to fetch bus markers:", error);
        }

        // Рассчитываем время выполнения итерации
        const iterationTime = Date.now() - startTime;
        const remainingTime = minInterval - iterationTime;

        // Если итерация заняла меньше minInterval, ждем оставшееся время
        if (remainingTime > 0) {
          await new Promise(resolve => setTimeout(resolve, remainingTime));
        }

      } while (!this.devmode && this.mapActiveState); // В реальном режиме продолжаем запрашивать данные до отключения карты
    }
  }
});
