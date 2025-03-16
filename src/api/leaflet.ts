export async function geocodeAddress(address: string)
  : Promise<{ lat: number, lng: number } | null> {
  const apiUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json`;

  return await fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        return { lat, lng };
      } else {
        console.error("無法找到該地點");
        return null;
      }
    })
    .catch(error => {
      console.error("請求錯誤: ", error);
      return null;
    });
}

export function generateOffsetMidpoint(startLat: number, startLng: number, endLat: number, endLng: number, offsetDistance = 0.2) {
  // 計算隨機偏移量
  const offsetLat = offsetDistance * (Math.random() - 0.5); // 在起點和終點的中線上隨機偏移
  const offsetLng = offsetDistance * (Math.random() - 0.5);

  // 計算中途點的新經緯度
  const lat = startLat + (endLat - startLat) * 0.5 + offsetLat;
  const lng = startLng + (endLng - startLng) * 0.5 + offsetLng;

  return [lat, lng];
}
