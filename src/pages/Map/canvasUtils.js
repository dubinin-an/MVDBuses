// canvasUtils.js
import '@fortawesome/fontawesome-free/css/all.css';

export const iconSize = 20;

const status2color = function(status) { // Цвет иконки в зависимости от статуса
  if (status === 70) return 'orange'; //ucot
  if (status === 20) return 'green'; //come
  if (status === 50) return 'blue'; //cutcsa
  if (status === 10) return 'red'; //coetc
  return 'black';
};

const type2icon = function(type) { // Типы иконок на карте
  const iconMap = {
    0: '\uf041', // marker
    1: '\uf3c5', // marker-round
    3: '\uf276', //map-pin
    4: '\uf55e', //bus
    "bus": '\uf55e', //bus
    5: '\uf1ad', //building
    6: '\uf288', //round P
    7: '\uf540', //square P
  };
  return iconMap[type] || '\uf057';
};

export const drawFontAwesomeIcon = function(ctx, icon, x, y) {
  ctx.font = `${iconSize}px FontAwesome`;
  ctx.fillStyle = status2color(icon.status); // Цвет иконки
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const iconUnicode = type2icon(icon.type);
  if (iconUnicode) {
    ctx.fillText(iconUnicode, x, y);
  }
};

export const drawBadge = function(ctx, text, status, x, y) {
  ctx.font = '10px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  ctx.fillStyle = 'white';
  ctx.strokeStyle = status2color(status);
  ctx.fillRect(x + iconSize / 2, y - iconSize, iconSize, iconSize / 2);
  ctx.strokeRect(x + iconSize / 2, y - iconSize, iconSize, iconSize / 2);

  ctx.fillStyle = 'black';
  ctx.fillText(text, x + iconSize, y - iconSize/1.5);
};

export const drawCircle = function(ctx, icon, x, y) {
  ctx.beginPath();
  ctx.arc(x, y, iconSize / 6, 0, 2 * Math.PI, false); // Радиус круга меньше iconSize
  ctx.fillStyle = status2color(icon.status);
  ctx.fill();
};

export const handleClick = function(event, canvas, markers, map) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  markers.forEach((marker) => {
    const point = map.latLngToContainerPoint(marker.geometry.coordinates);
    if (
      x >= point.x - iconSize / 2 &&
      x <= point.x + iconSize / 2 &&
      y >= point.y - iconSize / 2 &&
      y <= point.y + iconSize / 2
    ) {
      alert(`${marker.properties.name} clicked!`);
    }
  });
};

export const generateRandomMarkers = function(center, count, radius = 10) {
  const markers = [];
  const earthRadius = 6371; // Radius of the Earth in km

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * radius;

    const deltaLat = (distance * Math.cos(angle)) / earthRadius * (180 / Math.PI);
    const deltaLng = (distance * Math.sin(angle)) / (earthRadius * Math.cos(center[0] * Math.PI / 180)) * (180 / Math.PI);

    const newLat = center[0] + deltaLat;
    const newLng = center[1] + deltaLng;

    markers.push({
      geometry: {
        coordinates: [newLat, newLng],
      },
      properties: {
        id: `marker_${i}`,
        type: Math.ceil(Math.random() * 3), // Random type between 1 and 3
        name: `marker ${i + 1}`,
        status: Math.ceil(Math.random() * 2), // Random status between 1 и 2
      },
    });
  }

  return markers;
};
