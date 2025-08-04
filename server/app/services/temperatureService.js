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

async function submitTemperature(formData) {
  try {
    const d = new Date()
    const dateStr = `${d.getFullYear()}${(d.getMonth() + 1).toString().padStart(2, "0")}${d.getDate().toString().padStart(2, "0")}`
    const lakes = ['loofs','leofs','lsofs','lmhofs']
    const arr = lakes.map((item) => {
      return `${dateStr}/${item}_${dateStr}_12.geo.json`
    })
    const waterBody = await isPointInContour(formData?.longitude, formData?.latitude, arr)
    const [hours, minutes] = formData?.time.split(":");
    const timestamp = new Date(formData?.date);
    timestamp.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const formattedData = {
      temperature:
        formData.temperatureUnit === "F"
          ? ((formData.temperature - 32) * 5) / 9
          : formData.temperature,
      latitude: formData.latitude,
      longitude: formData.longitude,
      measured_on: timestamp.toISOString(),
      notes: formData.notes,
      user_id: formData.user_id,
      water_body: waterBody
    };

    const { data } = await supabase
      .from("temperatures")
      .insert(formattedData)
      .select()
      .single();

    //update the storage geo json files
    const formattedDate = `${timestamp.getFullYear()}${(timestamp.getMonth()+1).toString().padStart(2, '0')}${timestamp.getDate().toString().padStart(2, '0')}`
    const getUserPoints = await supabase.storage.from('geojson').download(`${formattedDate}/user_points.geo.json`)
    if (getUserPoints.data && !getUserPoints.error) {
      const text = await getUserPoints.data.text();
      let geojson = JSON.parse(text)
     
      //add the new point
      geojson.features.push({
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [Number(((formData.longitude + 180) % 360) - 180), Number(formData.latitude)]
                        },
                "properties": {
                    "temperature": formData.temperatureUnit === "F" ? ((formData.temperature - 32) * 5) / 9 : formData.temperature,
                }
            })
      //update the geo json in the bucket
      const jsonString = JSON.stringify(geojson, null, 2);
      const jsonBlob = new Blob([jsonString], { type: 'application/json' });

      const writeUserPoints = await supabase.storage.from('geojson').upload(
        `${formattedDate}/user_points.geo.json`,
        jsonBlob,
        {
          upsert: true
        }
      )
      if (!writeUserPoints.error) {
        return {
          message: "Temperature submitted successfully",
          data: data,
        };
      }
    }

    // return {
    //   message: "Error reading user points froms storage",
    //   data: data,
    // };
  } catch (e) {
    console.error("submitTemperatures error:", e);
    throw e;
  }
}

async function submitTemperatures(csvData) {
  try {
    const d = new Date()
    const dateStr = `${d.getFullYear()}${(d.getMonth() + 1).toString().padStart(2, "0")}${d.getDate().toString().padStart(2, "0")}`
    const lakes = ['loofs','leofs','lsofs','lmhofs']
    const arr = lakes.map((item) => {
      return `${dateStr}/${item}_${dateStr}_12.geo.json`
    })
    
    const processedData = [];
    for (const item of csvData.formData) {
      const waterBody = await isPointInContour(item.longitude, item.latitude, arr);
      processedData.push({
        temperature:
          item.temperatureUnit === "F"
            ? ((item.temperature - 32) * 5) / 9
            : item.temperature,
        latitude: item.latitude,
        longitude: item.longitude,
        measured_on: item.date,
        notes: item.notes,
        user_id: csvData.userId,
        is_verified: true, // Temperature submitted via CSV exclusively by admins are verified
        water_body: waterBody
      });
    }

    const { data } = await supabase.from("temperatures").insert(processedData);

    return { message: "Temperature CSV submitted successfully", data: data };
  } catch (e) {
    console.error("submitTemperatures error:", e);
    throw e;
  }
}


module.exports = {
  submitTemperature,
  submitTemperatures
};
