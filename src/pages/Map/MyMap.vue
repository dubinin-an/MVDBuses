<template>
  <div id="map">
    <canvas ref="canvas" style="position: absolute; top: 0; left: 0; z-index: 500"></canvas>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';
import L from 'leaflet';
import "leaflet.locatecontrol"; // Импорт плагина
import "leaflet.locatecontrol/dist/L.Control.Locate.min.css"; // Импорт стилей
import 'leaflet/dist/leaflet.css';
import { drawFontAwesomeIcon, drawCircle, handleClick as handleCanvasClick, iconSize, drawBadge } from './canvasUtils';
import { useMarkersStore } from 'stores/useMarkersStore'
import { debounce } from 'lodash'

const minZoomForIcons = 12; // Минимальный уровень зума для отображения иконок
const center = [-34.9058916, -56.1913095]; // Заданная центральная точка
const markersCount = 5000; // Количество маркеров для генерации
const store = useMarkersStore();
const devMode = computed(() => import.meta.env.MODE === 'development');

store.setMapActiveState(!devMode.value);
// store.generateRandomMarkers(center, markersCount);

store.getBusMarkers();
const markers = computed(() => store.markers);
watch(markers, () => debouncedDrawIcons(),
  {deep: true}
);

const canvas = ref(null);
let map;
let ctx;
// const zoomLevel = ref(minZoomForIcons);
const zoomLevel = computed(() => map.getZoom());

const popup = computed(() => L.popup({
  offset: L.point(0, zoomLevel.value >= minZoomForIcons ? -2 : 6), // Поднятие на 10 пикселей
  className: 'custom-popup'
}));
const debouncedDrawIcons = debounce(drawIcons, 200);

onMounted(async () => {
  console.log('MyMapTS DEV', devMode.value);

  map = L.map('map').setView(center, minZoomForIcons);
  // zoomLevel.value = map.getZoom();
  map.zoomControl.setPosition('topright');
  L.control.locate({
    flyTo: true,
    position: 'topright',
    locateOptions: {
      maxZoom: 18
    }
  }).addTo(map);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap' + (devMode.value ? 'DEV' : '')
  }).addTo(map);

  ctx = canvas.value.getContext('2d');
  resizeCanvas();

  map.on('move', drawIcons);
  map.on('zoomend', () => {
    // zoomLevel.value = map.getZoom();
    debouncedDrawIcons();
  });
  window.addEventListener('resize', resizeCanvas);
  canvas.value.addEventListener('click', (event) => handleCanvasClick(event, canvas.value, markers.value, map));
  canvas.value.addEventListener('mousemove', handleMouseMove);

  await document.fonts.load(`${iconSize}px FontAwesome`);
  document.fonts.ready.then(() => {
    debouncedDrawIcons();
  });
});

onUnmounted(() => {
  map.off('move', drawIcons);
  map.off('zoomend', drawIcons);
  window.removeEventListener('resize', resizeCanvas);
  if (canvas.value) {
    canvas.value.removeEventListener('click', (event) => handleCanvasClick(event, canvas.value, markers.value, map));
    canvas.value.removeEventListener('mousemove', handleMouseMove);
  }
});

function resizeCanvas() {
  const size = map.getSize();
  canvas.value.width = size.x;
  canvas.value.height = size.y;
  debouncedDrawIcons();
}

function drawIcons() {
  ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);

  const bounds = map.getBounds();
  markers.value.forEach((marker) => {
    const latLng = L.latLng(marker.geometry.coordinates[0], marker.geometry.coordinates[1]);
    if (bounds.contains(latLng)) {
      const point = map.latLngToContainerPoint(latLng);
      if (zoomLevel.value >= minZoomForIcons) {
        drawFontAwesomeIcon(ctx, marker.properties, point.x, point.y);
        drawBadge(ctx, marker.properties.name, marker.properties.status, point.x, point.y);
      } else {
        drawCircle(ctx, marker.properties, point.x, point.y);
      }
    }
  });
}

function handleMouseMove(event) {
  const rect = canvas.value.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  const markersUnderMouse = markers.value.filter((marker) => {
    const latLng = L.latLng(marker.geometry.coordinates[0], marker.geometry.coordinates[1]);
    const point = map.latLngToContainerPoint(latLng);
    return (
      x >= point.x - iconSize / 2 &&
      x <= point.x + iconSize / 2 &&
      y >= point.y - iconSize / 2 &&
      y <= point.y + iconSize / 2
    );
  });

  if (markersUnderMouse.length > 0 && zoomLevel.value >= minZoomForIcons - 3) {
    const latLng = L.latLng(markersUnderMouse[0].geometry.coordinates[0], markersUnderMouse[0].geometry.coordinates[1]);
    const content = markersUnderMouse.map(marker => marker.properties.name).join('<br>');
    popup.value
    .setLatLng(latLng)
    .setContent(content)
    .openOn(map);
  } else if (zoomLevel.value >= minZoomForIcons) {
    map.closePopup();
  }
}
</script>

<style scoped>
#map {
  height: 100vh;
  width: 100vw;
}

.custom-popup .leaflet-popup-content-wrapper, .custom-popup .leaflet-popup-tip {
  z-index: 10000 !important; /* Устанавливаем z-index для popup */
}
</style>
