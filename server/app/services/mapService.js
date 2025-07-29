const supabase = require("../models/supabaseClient");

async function getTemperatureReading(coordinates,date) {
  const [lat, lng] = coordinates
  // const date = new Date()
  // const dateStr = `${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`
  const max_distance = 0.7
  let min_distance = Infinity
  const arr = [`loofs_${date}_points.geo.json`,`leofs_${date}_points.geo.json`,`lsofs_${date}_points.geo.json`,`lmhofs_${date}_points.geo.json`,'user_points.geo.json']
  console.log('Beginning loop')
  for (let i=0; i< arr.length; i++){
    console.log('checking', arr[i])
    try {
      const { data } = await supabase.storage.from('geojson').download(`${date}/${arr[i]}`)
      const text = await data.text();
      const geojson = JSON.parse(text)

      //loop through points
      for (let j=0; j<geojson.features.length;j++) {
        var temp_coords = [geojson.features[j].geometry.coordinates[1], geojson.features[j].geometry.coordinates[0]]
        const temp_distance = Math.sqrt(Math.pow(lat - temp_coords[0], 2) + Math.pow(lng - temp_coords[1], 2))
        if (temp_distance <= max_distance && temp_distance < min_distance) {
          if (geojson.features[j].properties.temperature != null) {
            console.log(`Nearest point: temp: ${geojson.features[j].properties.temperature}, lat: ${temp_coords[0]}, lng: ${temp_coords[1]}`)
            return {message: "Temperature reading acquired successfully", data: {temp: geojson.features[j].properties.temperature, lat: temp_coords[0], lng: temp_coords[1]}}
          }
        }
      }
      
    } catch(e) {
        console.error("getTemperatureReading error:", e);
        // throw e;
        return { message: "Temperature reading unsuccessful", data: null}
    }
  }
  console.log('No nearest point found')
  return { message: "Temperature reading unsuccessful", data: null}

}

module.exports = {
  getTemperatureReading
};