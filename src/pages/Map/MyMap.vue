<template>
  <div id="map">
    <canvas ref="stopCanvas" style="position: absolute; top: 0; left: 0; z-index: 500"></canvas>
    <canvas ref="busCanvas" style="position: absolute; top: 0; left: 0; z-index: 501"></canvas>
  </div>

  <q-dialog v-model="selectMarkersDialog" backdrop-filter="'contrast(40%)">
    <q-card style="width: 700px; max-width: 80vw;">
      <q-card-section class="row items-center q-pb-none text-h6">
        Dialog
      </q-card-section>

      <q-card-section>
        <q-list dense bordered separator>

          <q-item tag="label" v-ripple
                  v-for="(item, id) in selectedMarkers"
                  :key="id"
          >
            <q-item-section side top>
              <q-checkbox v-model="item.check" />
            </q-item-section>

            <q-item-section>
              <q-item-label>{{item.properties.name}}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Close" color="primary" v-close-popup @click="selectedMarkers = []"/>
        <q-btn flat label="Select" :disable="!ifCheckMarkers" color="primary" v-close-popup @click="selectBus"/>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import L from 'leaflet';
import "leaflet.locatecontrol"; // Импорт плагина
import "leaflet.locatecontrol/dist/L.Control.Locate.min.css"; // Импорт стилей
import 'leaflet/dist/leaflet.css';
import { drawFontAwesomeIcon, drawCircle, handleClick as handleCanvasClick, iconSize, drawBadge } from './canvasUtils';
import { useBusOnlineMarkersStore } from 'stores/useBusOnlineMarkersStore'
import { debounce } from 'lodash'
import { stopMarkers } from 'src/lib/basesUtils'
import { searchBus } from 'components/Search/SearchController'
import { filterUnique } from 'src/lib/tools'

const minBusZoomForIcons = 12; // Минимальный уровень зума для отображения иконок
const minStopZoomForIcons = 17; // Минимальный уровень зума для отображения иконок
const center = [-34.9058916, -56.1913095]; // Заданная центральная точка
const busOnlineStore = useBusOnlineMarkersStore();

const devMode = computed(() => busOnlineStore.devmode);
busOnlineStore.setMapActiveState(!devMode.value);
busOnlineStore.getBusMarkers();
const busOnlineMarkers = computed(() => busOnlineStore.markers);
watch(busOnlineMarkers, () => debouncedDrawBusMarkers(),
  {deep: true}
);

const ifCheckMarkers = computed(() => selectedMarkers.value.filter(item => item.check).length>0);

const busCanvas = ref(null);
const stopCanvas = ref(null);
const selectMarkersDialog = ref(false);
let map;
let busctx;
let stopctx;
const zoomLevel = ref(minBusZoomForIcons);
const selectedMarkers = ref([]);
const selectBus = () => {
  const temp = selectedMarkers.value.filter(item => item.check).map(item => item.properties.name);
  searchBus(temp.join(','))
}

watch(selectedMarkers, () => {
  selectMarkersDialog.value = selectedMarkers.value.length > 1
  if (selectedMarkers.value.length === 1) {
    selectedMarkers.value[0].check = true
    selectBus()
  }
  },
  {deep: true}
);

const popup = computed(() => L.popup({
  offset: L.point(0, zoomLevel.value >= minBusZoomForIcons ? -2 : 6), // Поднятие на 10 пикселей
  className: 'custom-popup'
}));
const debouncedDrawBusMarkers = debounce(drawBusMarkers, 200);

onMounted(async () => {
  console.log('MyMapTS DEV', devMode.value);

  map = L.map('map').setView(center, minBusZoomForIcons);
  map.zoomControl.setPosition('topright');
  L.control.locate({
    flyTo: true,
    position: 'topright',
    locateOptions: {
      maxZoom: 18
    }
  }).addTo(map);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap ' + (devMode.value ? 'DEV' : 'PROD')
  }).addTo(map);
  busctx = busCanvas.value.getContext('2d');
  stopctx = stopCanvas.value.getContext('2d');
  resizeCanvas();

  map.on('move', () => {
    drawStopMarkers()
    drawBusMarkers()
  });
  map.on('zoomend', () => {
    zoomLevel.value = map.getZoom();
    drawStopMarkers()
    debouncedDrawBusMarkers();
  });

  window.addEventListener('resize', resizeCanvas);
  busCanvas.value.addEventListener('click', (event) => {
    const temp = handleCanvasClick(event, busCanvas.value, busOnlineMarkers.value, map)
    temp.forEach(item => item.check = false)
    // selectedMarkers.value = temp
    selectedMarkers.value = filterUnique(temp)
  });

  await document.fonts.load(`${iconSize}px FontAwesome`);
  document.fonts.ready.then(() => {
    debouncedDrawBusMarkers();
  });
  drawStopMarkers()

});

onUnmounted(() => {
  map.off('move', drawBusMarkers);
  map.off('zoomend', drawBusMarkers);
  window.removeEventListener('resize', resizeCanvas);
  if (busCanvas.value) {
    busCanvas.value.removeEventListener('click', (event) => handleCanvasClick(event, busCanvas.value, busOnlineMarkers.value, map));
  }
});

function resizeCanvas() {
  const size = map.getSize();
  busCanvas.value.width = size.x;
  busCanvas.value.height = size.y
  stopCanvas.value.width = size.x;
  stopCanvas.value.height = size.y;
  drawBusMarkers();
  drawStopMarkers()
}

function drawBusMarkers() {
  busctx.clearRect(0, 0, busCanvas.value.width, busCanvas.value.height);

  const bounds = map.getBounds();
  busOnlineMarkers.value.forEach((marker) => {
    const latLng = L.latLng(marker.geometry.coordinates[0], marker.geometry.coordinates[1]);
    if (bounds.contains(latLng)) {
      const point = map.latLngToContainerPoint(latLng);
      if (zoomLevel.value >= minBusZoomForIcons) {
        drawFontAwesomeIcon(busctx, marker.properties, point.x, point.y);
        drawBadge(busctx, marker.properties.name, marker.properties.status, point.x, point.y);
      } else {
        drawCircle(busctx, marker.properties, point.x, point.y);
      }
    }
  });
  // drawStopMarkers(); // Перерисовываем маркеры остановок, чтобы они оставались поверх маркеров автобусов

}
function drawStopMarkers() {
  stopctx.clearRect(0, 0, stopCanvas.value.width, stopCanvas.value.height);

  const bounds = map.getBounds();
  if (zoomLevel.value >= 15)
    stopMarkers().forEach((marker) => {
    const latLng = L.latLng(marker.geometry.coordinates[0], marker.geometry.coordinates[1]);
    if (bounds.contains(latLng)) {
      const point = map.latLngToContainerPoint(latLng);
      if (zoomLevel.value >= minStopZoomForIcons) {
        drawFontAwesomeIcon(stopctx, marker.properties, point.x, point.y);
      } else {
        drawCircle(stopctx, marker.properties, point.x, point.y);
      }
    }
  });
}

function handleMouseMove(event) {
  const rect = busCanvas.value.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const markersUnderMouse = busOnlineMarkers.value.filter((marker) => {
    const latLng = L.latLng(marker.geometry.coordinates[0], marker.geometry.coordinates[1]);
    const point = map.latLngToContainerPoint(latLng);
    return (
      x >= point.x - iconSize / 2 &&
      x <= point.x + iconSize / 2 &&
      y >= point.y - iconSize / 2 &&
      y <= point.y + iconSize / 2
    );
  });

  if (markersUnderMouse.length > 0 && zoomLevel.value >= minBusZoomForIcons - 3) {
    const latLng = L.latLng(markersUnderMouse[0].geometry.coordinates[0], markersUnderMouse[0].geometry.coordinates[1]);
    const content = markersUnderMouse.map(marker => marker.properties.name).join('<br>');
    popup.value
    .setLatLng(latLng)
    .setContent(content)
    .openOn(map);
  } else if (zoomLevel.value >= minBusZoomForIcons) {
    map.closePopup();
  }
}
</script>

<style scoped>
#map {
  height: 94vh;
  width: 100vw;
}

.custom-popup .leaflet-popup-content-wrapper, .custom-popup .leaflet-popup-tip {
  z-index: 10000 !important; /* Устанавливаем z-index для popup */
}
</style>
