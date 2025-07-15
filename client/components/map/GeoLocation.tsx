export const getUserLocation = () => {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          resolve({ latitude: latitude, longitude: longitude });
        },
        (error) => {
          console.error("Error getting user location:", error);
          //default Toronto
          reject({ latitude: 43.70011, longitude: -79.4163 });
        }
      );
    } else {
      const errorMsg = "Geolocation is not supported by this browser.";
      console.error(errorMsg);
      reject({ latitude: 43.70011, longitude: -79.4163 });
    }
  });
};
