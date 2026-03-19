const supabase = require("../models/supabaseClient");
const turf = require('@turf/turf');

async function isPointInContour(longitude, latitude, arr) {
  try {
    for (let i=0; i< arr.length;i++){
      const { data } = await supabase.storage.from('geojson').download(arr[i])
      if (data) {
        const text = await data.text();
        const geojson = JSON.parse(text)
        // console.log('NUM FEATURES: ',geojson['features'].length)
        for (let j=0; j < geojson.features.length; j++) {
          // var coordInFeature = isPointInContour(formData.longitude, formData.latitude, geojson.features[j])
          const point = turf.point([longitude, latitude]);
          var coordInFeature = turf.booleanPointInPolygon(point, geojson.features[j]);
          if (coordInFeature) {
            const lake = arr[i].split('/')[1].split('_')[0]
            switch (lake) {
              case 'loofs':
                return 'loofs'
              case 'leofs':
                return 'leofs'
              case 'lsofs':
                return 'lsofs'
              case 'lmhofs':
                return 'lmhofs'

            }
            
          }
        }
      }
    }
    return null
  } catch (err) {
    console.log('Error in isPointInContour:', err)
    return null
  } 
  
}

async function getTemperatureReading(coordinates,date,hour) {
  const [lat, lng] = coordinates
  // const date = new Date()
  // const dateStr = `${date.getFullYear()}${(date.getMonth()+1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}`
  const max_distance = 0.5
  const lakes = ['loofs','leofs','lsofs','lmhofs']
  const arr = lakes.map((item) => {
    return `${date}/${item}_${date}_${hour}.geo.json`
  })
  const waterBody = await isPointInContour(lng, lat, arr)
  if (waterBody != null) {
    console.log('point in ', waterBody)
    let min_distance = Infinity
    let tempLat
    let tempLng
    let tempTemp
    try {
        const { data } = await supabase.storage.from('geojson').download(`${date}/${waterBody}_${date}_points_${hour}.geo.json`)
        if (data) {
          const text = await data.text();
          const geojson = JSON.parse(text)

          //loop through points
          for (let j=0; j<geojson.features.length;j++) {
            var temp_coords = [geojson.features[j].geometry.coordinates[1], geojson.features[j].geometry.coordinates[0]]
            const temp_distance = Math.sqrt(Math.pow(lat - temp_coords[0], 2) + Math.pow(lng - temp_coords[1], 2))
            if (temp_distance <= max_distance && temp_distance < min_distance) {
              if (geojson.features[j].properties.temperature != null) {
                tempLat = geojson.features[j].geometry.coordinates[1]
                tempLng = geojson.features[j].geometry.coordinates[0]
                tempTemp = geojson.features[j].properties.temperature
                min_distance = temp_distance
              }
            }
          }
          return {message: "Temperature reading acquired successfully", data: {temp: tempTemp, lat: tempLat, lng: tempLng}}
        }
    } catch (e) {
        console.error("getTemperatureReading error:", e);
        // throw e;
        return { message: "Temperature reading unsuccessful", data: null}
    }
  } else {
    console.log('point not in water body')
    for (let i=0; i< arr.length; i++){
      try {
        const { data } = await supabase.storage.from('geojson').download(`${date}/${arr[i]}`)
        if (data) {
          const text = await data.text();
          const geojson = JSON.parse(text)

          //loop through points
          for (let j=0; j<geojson.features.length;j++) {
            var temp_coords = [geojson.features[j].geometry.coordinates[1], geojson.features[j].geometry.coordinates[0]]
            const temp_distance = Math.sqrt(Math.pow(lat - temp_coords[0], 2) + Math.pow(lng - temp_coords[1], 2))
            if (temp_distance <= max_distance) {
              if (geojson.features[j].properties.temperature != null) {
                return {message: "Temperature reading acquired successfully", data: {temp: geojson.features[j].properties.temperature, lat: temp_coords[0], lng: temp_coords[1]}}
              }
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

}

async function lakeClicked(coordinates,date,hour) {
  const [lat, lng] = coordinates
  // use geo json from today, 12pm for each check
  console.log(`checking lat: ${lat} lng: ${lng}`)
  
  const lakes = ['loofs','leofs','lsofs','lmhofs']
  const arr = lakes.map((item) => {
    return `${date}/${item}_${date}_${hour}.geo.json`
  })
  try {
    const inLake = await isPointInContour(lng, lat, arr)
    if (inLake) {
      return { message: "Point in known water body", lake: inLake}
    }
    // console.log("Point not in known water body")
    return { message: "Point not in a known water body", lake: "no lake"}
  } catch (err) {
    // console.log('Error in lakeClicked: ', err)
    return { message: "Point not in a known water body", lake: "no lake"}
  }
  
}

async function getChartData(lake) {
  if (!lake) {
    return { message: "Lake not clicked", data: null}
  }
  let lakeCode = lake
  
  const d = new Date()
  d.setFullYear(d.getFullYear() - 1)
  const dateStr = `${d.getFullYear()}-${(d.getMonth()+1).toString().padStart(2, "0")}-${d.getDate().toString().padStart(2, "0")}`
  console.log('after:',dateStr)
  //pull points from database that are within that lake
  try {
    const { data } = await supabase.from('temperatures')
    .select('latitude,longitude,temperature,measured_on')
    .eq('water_body', lakeCode)
    .gte('measured_on', dateStr)
    .eq('is_verified', true);
    console.log('request complete')

    if (data) {
      console.log('data:', data)
      const monthDict  = {}
      data.forEach((item) => {
        let date = item['measured_on'].split('T')[0].slice(0,7)
        if (date in monthDict) {
          monthDict[date].push(item['temperature'])
        } else {
          monthDict[date] = [item['temperature']]
        }
      })

      //sort into list
      const sortedData = Object.entries(monthDict)
        .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
        .map(([date, readings]) => ({
          date: date,
          temperature: readings.reduce((sum, reading) => sum + reading, 0) / readings.length
        }));
      console.log('sorted',sortedData)
      
      return { message: "Successfully retrieved lake time data", data: sortedData}
    }
     
    return { message: "No retrieved lake time data", data: null}
  } catch (e) {
    console.log('Error: ',e)
    return { message: e.message, data: null}
  }
  

}

async function checkWaterBodies() {
  console.log('In check water bodies function')
  const d = new Date()
  const dateStr = `${d.getFullYear()}${(d.getMonth() + 1).toString().padStart(2, "0")}${d.getDate().toString().padStart(2, "0")}`
  const lakes = ['loofs','leofs','lsofs','lmhofs']
  const arr = lakes.map((item) => {
    return `${dateStr}/${item}_${dateStr}_12.geo.json`
  })
  console.log('creating date arr')
  try {
      const { data, error } = await supabase.from('temperatures').select("id,latitude,longitude,water_body").is("water_body", null)
      console.log('made supaabse query')
      if (error) {
        console.log('error', error)
        throw error
      }
      if (data && data.length > 0) {

        // return { message: "Updated successfully"}
        console.log('creating promise')
        const updatePromises = data.map(async (record) => {
        try {
          const wb = await isPointInContour(record.longitude, record.latitude, arr)
          
          const { error: updateError } = await supabase
            .from('temperatures')
            .update({ 'water_body': wb })
            .eq('id', record.id)
          
          if (updateError) {
            console.error(`Failed to update record ${record.id}:`, updateError)
            return { id: record.id, success: false, error: updateError }
          }
          
          return { id: record.id, success: true, water_body: wb }
        } catch (err) {
          console.error(`Error processing record ${record.id}:`, err)
          return { id: record.id, success: false, error: err }
        }
      })

      const results = await Promise.all(updatePromises)
      const successful = results.filter(r => r.success).length
      const failed = results.filter(r => !r.success).length
      
      console.log(`Updates completed: ${successful} successful, ${failed} failed`)
      
      return { 
        message: "Success", 
        processed: data.length,
        successful,
        failed,
        results 
      }

    }
    console.log('No records to process')
    return { message: "No Records to process" }
  } catch (err) {
    console.log('Error in checkWaterBodies: ', err)
    throw err
  }
}

module.exports = {
  getTemperatureReading,
  lakeClicked,
  getChartData,
  checkWaterBodies
};