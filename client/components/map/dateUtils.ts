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

export const createTodayMarks = () => {
  const marks = [
    { value: 1, label: "12 AM"},
    { value: 2, label: "4 AM"},
    { value: 3, label: "8 AM"},
    { value: 4, label: "12 PM"},
    { value: 5, label: "4 PM"},
    { value: 6, label: "8 PM"},
  ]
  return marks

}




