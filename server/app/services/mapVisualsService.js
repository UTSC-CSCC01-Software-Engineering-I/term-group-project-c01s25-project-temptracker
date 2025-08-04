const supabase = require("../models/supabaseClient");

const fetchContourData = async (date,today,currentHour,timeRange) => {
    //fetches geo json data from the supabase storage
    console.log('current hour received:', currentHour)
    console.log('date:', date)
    console.log('today:', today)
    const weekDate = new Date(date)
    const todayDate = new Date(today)
    let fetchFunctions;
    if (timeRange == "week") {
      const dateStr = `${weekDate.getFullYear()}${(weekDate.getMonth() + 1)
        .toString()
        .padStart(2, "0")}${weekDate.getDate().toString().padStart(2, "0")}`;
      console.log("Current fetch date string:", dateStr);

      fetchFunctions = [
        // Database uploads
        async () => {
          const startDate = new Date(weekDate)
          startDate.setHours(0, 0, 0, 0);

          const endDate = new Date(weekDate);
          endDate.setDate(weekDate.getDate() + 1);
          endDate.setHours(0,0,0,0)
          const { data, error } = await supabase
            .from("temperatures")
            .select("latitude,longitude,temperature,measured_on")
            .gte("measured_on",startDate.toISOString())
            .lt("measured_on",endDate.toISOString())
            .eq("is_verified",true);

          if (error)
            throw new Error(`Error reading user uploads: ${error.message}`);
          console.log("user uploads:", data);
          return { type: "userPoints", data: data };
        },
        // Contour data fetchers
        async () => {
          const filePath = `${dateStr}/loofs_${dateStr}_12.geo.json`;
          const { data, error } = await supabase.storage
            .from("geojson")
            .download(filePath);
          if (error)
            throw new Error(
              `Error downloading loofs contours: ${error.message}`
            );
          const text = await data.text();
          return { type: "loofsContours", data: JSON.parse(text) };
        },
        async () => {
          const filePath = `${dateStr}/leofs_${dateStr}_12.geo.json`;
          const { data, error } = await supabase.storage
            .from("geojson")
            .download(filePath);
          if (error)
            throw new Error(
              `Error downloading leofs contours: ${error.message}`
            );
          const text = await data.text();
          return { type: "leofsContours", data: JSON.parse(text) };
        },
        async () => {
          const filePath = `${dateStr}/lsofs_${dateStr}_12.geo.json`;
          const { data, error } = await supabase.storage
            .from("geojson")
            .download(filePath);
          if (error)
            throw new Error(
              `Error downloading lsofs contours: ${error.message}`
            );
          const text = await data.text();
          return { type: "lsofsContours", data: JSON.parse(text) };
        },
        async () => {
          const filePath = `${dateStr}/lmhofs_${dateStr}_12.geo.json`;
          const { data, error } = await supabase.storage
            .from("geojson")
            .download(filePath);
          if (error)
            throw new Error(
              `Error downloading lmhofs contours: ${error.message}`
            );
          const text = await data.text();
          return { type: "lmhofsContours", data: JSON.parse(text) };
        },
      ];
    } else {
      const todayStr = `${todayDate.getFullYear()}${(todayDate.getMonth() + 1)
        .toString()
        .padStart(2, "0")}${todayDate.getDate().toString().padStart(2, "0")}`;
      console.log("Current fetch date string:", todayStr);

      fetchFunctions = [
        // Database uploads
        async () => {
          const startTime = new Date(todayDate);
          startTime.setUTCHours(currentHour, 0, 0, 0);
          
          const endTime = new Date(todayDate);
          endTime.setUTCHours(currentHour + 4, 0, 0, 0);
          
          const { data, error } = await supabase.from('temperatures').select('latitude,longitude,temperature,measured_on')
          .gte('measured_on', startTime.toISOString())
          .lt('measured_on', endTime.toISOString())
          .eq('is_verified', true);
          // console.log('between ', startTime.toISOString())
          // console.log('and ',endTime.toISOString())
          if (error) throw new Error(`Error reading user uploads: ${error.message}`);
          return { type: 'userPoints', data: data };
        },
        // Contour data fetchers
        async () => {
          const filePath = `${todayStr}/loofs_${todayStr}_${currentHour
            .toString()
            .padStart(2, "0")}.geo.json`;
          const { data, error } = await supabase.storage
            .from("geojson")
            .download(filePath);
          if (error)
            throw new Error(
              `Error downloading loofs contours: ${error.message}`
            );
          const text = await data.text();
          return { type: "loofsContours", data: JSON.parse(text) };
        },
        async () => {
          const filePath = `${todayStr}/leofs_${todayStr}_${currentHour
            .toString()
            .padStart(2, "0")}.geo.json`;
          const { data, error } = await supabase.storage
            .from("geojson")
            .download(filePath);
          if (error)
            throw new Error(
              `Error downloading leofs contours: ${error.message}`
            );
          const text = await data.text();
          return { type: "leofsContours", data: JSON.parse(text) };
        },
        async () => {
          const filePath = `${todayStr}/lsofs_${todayStr}_${currentHour
            .toString()
            .padStart(2, "0")}.geo.json`;
          const { data, error } = await supabase.storage
            .from("geojson")
            .download(filePath);
          if (error)
            throw new Error(
              `Error downloading lsofs contours: ${error.message}`
            );
          const text = await data.text();
          return { type: "lsofsContours", data: JSON.parse(text) };
        },
        async () => {
          const filePath = `${todayStr}/lmhofs_${todayStr}_${currentHour
            .toString()
            .padStart(2, "0")}.geo.json`;
          const { data, error } = await supabase.storage
            .from("geojson")
            .download(filePath);
          if (error)
            throw new Error(
              `Error downloading lmhofs contours: ${error.message}`
            );
          const text = await data.text();
          return { type: "lmhofsContours", data: JSON.parse(text) };
        },
      ];
    }

    try {
      const results = await Promise.all(fetchFunctions.map((fn) => fn()));
      // Update all states at once
      let newData = {}
      results.forEach((result) => {
        switch (result.type) {
          case "userPoints":
            // setUserPoints(result.data);
            newData['userPoints'] = result.data
            // setHeatMapPoints(result.data.map((item) => {
            //   return [item['latitude'], item['longitude']]
            // }))
            newData['heatMapPoints'] = result.data.map((item) => {
              return [item['latitude'], item['longitude']]
            })
            break;
          case "loofsContours":
            // setLoofsContours(result.data);
            newData['loofsContours'] = result.data
            break;
          case "leofsContours":
            // setLeofsContours(result.data);
            newData['leofsContours'] = result.data
            break;
          case "lsofsContours":
            // setLsofsContours(result.data);
            newData['lsofsContours'] = result.data
            break;
          case "lmhofsContours":
            // setLmhofsContours(result.data);
            newData['lmhofsContours'] = result.data
            break;
        }
      });
      if (timeRange == "week") {
        // setTempDate(date);
        newData['tempDate'] = weekDate.toISOString()
      } else {
        // setTempHour(currentHour);
        newData['currentHour'] = currentHour
      }

      // console.log('new Data:', newData)
      return { message: "Success", data: newData}
    } catch (error) {
      console.error("Error fetching data:", error);
      return { message: "Fail to fetch contour data", data: null}
    }
  };

  module.exports = { fetchContourData };