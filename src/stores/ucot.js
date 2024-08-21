import { defineStore } from 'pinia'
import _ from 'lodash'

export const useUcotStore = defineStore('ucot', {
  state: () => ({
    linesNumbers:[],
    lines: [],
    stops:[],
  }),
  actions: {
    async getLinesNumber () {
      const uri = 'http://localhost/ucot/recorridos.html'
      try {
        const response = await fetch(uri);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const html = await response.text();
        // Создаем элемент DOM из HTML
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        // Находим селектор с именем linea
        const selectElement = doc.querySelector('select[name="linea"]');
        if (selectElement) {
          // Извлекаем опции и формируем массив объектов
          const options = Array.from(selectElement.options).map(option => ({
            value: option.value,
            label: option.textContent
          }));

          // console.log(options);
          this.linesNumbers = options
        } else {
          console.error('Селектор "linea" не найден');
        }
      } catch (error) {
        console.error('Ошибка при запросе страницы:', error);
      }
    },
    async getStopsFromServer () {
      const uri = 'http://localhost/ucot/OSM/paradas.kml'
      try {
        const response = await fetch(uri);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        else {
          const html = await response.text();
          const dataArray = html.split(',');

          // Объект для хранения уникальных координат и соответствующих маршрутов
          const coordinatesMap = {};

          // Парсим данные
          for (let i = 0; i < dataArray.length - 1; i += 3) {
            // Очищаем название маршрута от символа \n
            let route = dataArray[i].trim();

            const longitude = parseFloat(dataArray[i + 1]);
            const latitude = parseFloat(dataArray[i + 2]);

            // Проверяем корректность координат
            if (longitude >= -180 && longitude <= 180 && latitude >= -90 && latitude <= 90) {
              const coordKey = `${longitude},${latitude}`;

              // Если координаты уже есть в карте, добавляем маршрут к списку маршрутов
              if (coordinatesMap[coordKey]) {
                if (!coordinatesMap[coordKey].routes.includes(route)) {
                  coordinatesMap[coordKey].routes.push(route);
                }
              } else {
                // Если координат еще нет, создаем новую запись
                coordinatesMap[coordKey] = {
                  coordinates: [longitude, latitude],
                  routes: [route]
                };
              }
            }
          }

          // Преобразуем результат в массив объектов
          const coordinatesArray = Object.keys(coordinatesMap).map(coordKey => ({
            coordinates: coordinatesMap[coordKey].coordinates,
            routes: coordinatesMap[coordKey].routes
          }));

          // console.log(coordinatesArray);
          this.stops = coordinatesArray;
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
        delete temp.coordinates
        temp.type = 'stop'
        temp.status = 0
        return {
          geometry : {type: "Point", coordinates: stop.coordinates},
          properties : temp,
          type : "Feature"
        }
      })
    }
  }
})
