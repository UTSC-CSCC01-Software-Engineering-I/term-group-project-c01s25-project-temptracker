import type { TimeTemperaturePoint } from "./mapTypes";

export const createWeekMarks = () => {
  const date = new Date(Date.now());
  let marks;
  const day = date.getDay();
  switch (day) {
    case 1:
      marks = [
        { value: 1, label: "Tue" },
        { value: 2, label: "Wed" },
        { value: 3, label: "Thu" },
        { value: 4, label: "Fri" },
        { value: 5, label: "Sat" },
        { value: 6, label: "Sun" },
        { value: 7, label: "Mon" },
      ];
      break;
    case 2:
      marks = [
        { value: 1, label: "Wed" },
        { value: 2, label: "Thu" },
        { value: 3, label: "Fri" },
        { value: 4, label: "Sat" },
        { value: 5, label: "Sun" },
        { value: 6, label: "Mon" },
        { value: 7, label: "Tue" },
      ];
      break;
    case 3:
      marks = [
        { value: 1, label: "Thu" },
        { value: 2, label: "Fri" },
        { value: 3, label: "Sat" },
        { value: 4, label: "Sun" },
        { value: 5, label: "Mon" },
        { value: 6, label: "Tue" },
        { value: 7, label: "Wed" },
      ];
      break;
    case 4:
      marks = [
        { value: 1, label: "Fri" },
        { value: 2, label: "Sat" },
        { value: 3, label: "Sun" },
        { value: 4, label: "Mon" },
        { value: 5, label: "Tue" },
        { value: 6, label: "Wed" },
        { value: 7, label: "Thu" },
      ];
      break;
    case 5:
      marks = [
        { value: 1, label: "Sat" },
        { value: 2, label: "Sun" },
        { value: 3, label: "Mon" },
        { value: 4, label: "Tue" },
        { value: 5, label: "Wed" },
        { value: 6, label: "Thu" },
        { value: 7, label: "Fri" },
      ];
      break;
    case 6:
      marks = [
        { value: 1, label: "Sun" },
        { value: 2, label: "Mon" },
        { value: 3, label: "Tue" },
        { value: 4, label: "Wed" },
        { value: 5, label: "Thu" },
        { value: 6, label: "Fri" },
        { value: 7, label: "Sat" },
      ];
      break;
    case 0:
      marks = [
        { value: 1, label: "Mon" },
        { value: 2, label: "Tue" },
        { value: 3, label: "Wed" },
        { value: 4, label: "Thu" },
        { value: 5, label: "Fri" },
        { value: 6, label: "Sat" },
        { value: 7, label: "Sun" },
      ];
      break;
  }
  return marks;
};

export const createMonthMarks = () => {
  const days31 = [1, 3, 5, 7, 8, 10, 12];
  const fromDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const currentDate = new Date(Date.now());
  const days30 = [4, 6, 9, 11];
  const days28 = [2];
  let daysFromThisMonth = [];
  for (let i = currentDate.getDate(); i > 0; i--) {
    daysFromThisMonth.push(i);
  }
  daysFromThisMonth.sort((a, b) => a - b);

  const daysRemaining = 30 - daysFromThisMonth.length;
  const previousMonth = fromDate.getMonth();

  //add remaining days based on which is the previous month
  let daysFromPrevMonth = [];
  if (days31.indexOf(previousMonth) > -1) {
    for (let i = 31; i > 31 - daysRemaining; i--) {
      daysFromPrevMonth.push(i);
    }
  } else if (days30.indexOf(previousMonth) > -1) {
    for (let i = 30; i > 30 - daysRemaining; i--) {
      daysFromPrevMonth.push(i);
    }
  } else {
    for (let i = 28; i > 28 - daysRemaining; i--) {
      daysFromPrevMonth.push(i);
    }
  }
  daysFromPrevMonth.sort((a, b) => a - b);

  const labels = [...daysFromPrevMonth, ...daysFromThisMonth].map((label) => {
    return label.toString();
  });

  //create marks

  const marks = labels.map((label, index) => {
    return { value: index + 1, label: label };
  });
  return marks;
};

export const getNext7Days = () => {
  const dates = [];
  const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  if (isNaN(startDate.getTime())) {
    throw new Error("Invalid date format. Please use YYYY-MM-DD format.");
  }

  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i + 1);

    // Format to YYYY-MM-DD
    const formattedDate = currentDate.toISOString().split("T")[0];
    dates.push(formattedDate);
  }

  const dict: { [key: string]: any } = {};
  for (let j = 0; j < dates.length; j++) {
    dict[dates[j]] = [];
  }

  console.log("week dict", dict);
  return dict;
};

export const getNext30Days = () => {
  const dates = [];
  const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Check if the date is valid
  if (isNaN(startDate.getTime())) {
    throw new Error("Invalid date format. Please use YYYY-MM-DD format.");
  }

  for (let i = 0; i < 30; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i + 1);

    // Format to YYYY-MM-DD
    const formattedDate = currentDate.toISOString().split("T")[0];
    dates.push(formattedDate);
  }

  const dict: { [key: string]: any } = {};
  for (let j = 0; j < dates.length; j++) {
    dict[dates[j]] = [];
  }

  console.log("month dict", dict);
  return dict;
};

//TODO - debug - case when less than 7 days of data
export const bucketWeek = (data: TimeTemperaturePoint[]) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    // Return array of 30 empty arrays instead of empty array
    return Array(7).fill([]);
  }
  console.log("sample data", data[0]);

  const wdict: { [key: string]: any } = getNext7Days();
  console.log("generated week dict", wdict);
  for (let i = 0; i < data.length; i++) {
    const day = data[i][3].slice(0, 10);
    console.log("day", day);
    if (day in wdict) {
      wdict[day].push(data[i]);
    }
    // else {
    //   wdict[day] = [data[i]]
    // }
  }

  var keys = Object.keys(wdict);
  keys.sort();
  let wArray = [];
  for (let i = 0; i < keys.length; i++) {
    wArray.push(wdict[keys[i]]);
  }

  return wArray;
};
//TODO - debug - case when less than 30 days of data
export const bucketMonth = (data: TimeTemperaturePoint[]) => {
  //July 3rd
  if (!data || !Array.isArray(data) || data.length === 0) {
    // Return array of 30 empty arrays instead of empty array
    return Array(30).fill([]);
  }
  const mdict: { [key: string]: any } = getNext30Days();
  for (let i = 0; i < data.length; i++) {
    const day = data[i][3].slice(0, 10);
    if (day in mdict) {
      mdict[day].push(data[i]);
    }
    // else {
    //   mdict[day] = [data[i]]
    // }
  }

  //turn dict into array and sort
  var keys = Object.keys(mdict);
  keys.sort();
  let mArray = [];
  for (let i = 0; i < keys.length; i++) {
    mArray.push(mdict[keys[i]]);
  }
  return mArray;
};
