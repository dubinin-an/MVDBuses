export const colorShade = (color, percent) => {
  color = color.replace(`#`, ``);
  var num = parseInt(color,16),
    amt = Math.round(2.55 * percent),
    R = (num >> 16) + amt,
    B = (num >> 8 & 0x00FF) + amt,
    G = (num & 0x0000FF) + amt;

  return '#'+(0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (B<255?B<1?0:B:255)*0x100 + (G<255?G<1?0:G:255)).toString(16).slice(1);
};

export const mergeStops = (stops, tolerance = 0.0000001) => {
  const mergedStops = [];

  stops.forEach(stop => {
    const existingStop = mergedStops.find(merged => {
      const [lat1, lng1] = merged.geometry.coordinates;
      const [lat2, lng2] = stop.geometry.coordinates;
      return Math.abs(lat1 - lat2) <= tolerance && Math.abs(lng1 - lng2) <= tolerance;
    });

    if (existingStop) {
      // Если найден похожий элемент, объединяем properties
      Object.assign(existingStop.properties, stop.properties);
    } else {
      // Если не найден похожий элемент, добавляем его в массив
      mergedStops.push(stop);
    }
  });

  return mergedStops;
}

export const filterUnique = (arr) =>{
  const uniqueNames = new Set();
  const uniqueArr = [];

  arr.forEach(el => {
    if (!uniqueNames.has(el.properties.name)) {
      uniqueNames.add(el.properties.name);
      uniqueArr.push(el);
    }
  });
  return uniqueArr;
}
