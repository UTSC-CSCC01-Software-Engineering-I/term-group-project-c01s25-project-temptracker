import { getUserLocation } from "@/components/map/GeoLocation"; // adjust path as needed

describe("getUserLocation", () => {
  const originalGeolocation = navigator.geolocation;

  afterEach(() => {
    Object.defineProperty(navigator, "geolocation", {
      value: originalGeolocation,
      configurable: true,
      writable: true,
    });
    jest.clearAllMocks();
  });

  test("resolves with actual coordinates when geolocation is available and permitted", async () => {
    const mockCoords = { latitude: 45, longitude: -75 };
    const getCurrentPosition = jest.fn((success) =>
      success({ coords: mockCoords })
    );

    // @ts-ignore
    navigator.geolocation = { getCurrentPosition };

    const location = await getUserLocation();
    expect(location).toEqual(mockCoords);
    expect(getCurrentPosition).toHaveBeenCalled();
  });

  test("rejects with default Toronto coords when permission is denied or error occurs", async () => {
    const mockError = { code: 1, message: "Permission denied" };
    const getCurrentPosition = jest.fn((_success, error) => error(mockError));

    // @ts-ignore
    navigator.geolocation = { getCurrentPosition };

    await expect(getUserLocation()).rejects.toEqual({
      latitude: 43.70011,
      longitude: -79.4163,
    });
  });

  test("rejects with default Toronto coords when geolocation is not supported", async () => {
    // @ts-ignore
    navigator.geolocation = undefined;

    await expect(getUserLocation()).rejects.toEqual({
      latitude: 43.70011,
      longitude: -79.4163,
    });
  });
});
