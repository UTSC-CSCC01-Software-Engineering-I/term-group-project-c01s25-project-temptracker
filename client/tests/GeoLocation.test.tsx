import { getUserLocation } from "@/components/map/GeoLocation";

describe("getUserLocation", () => {
  const originalGeolocation = navigator.geolocation;

  afterEach(() => {
    // RESET: restore original geolocation and clear mocks after each test
    Object.defineProperty(navigator, "geolocation", {
      value: originalGeolocation,
      configurable: true,
      writable: true,
    });
    jest.clearAllMocks();
  });

  test("resolves with actual coordinates when geolocation is available and permitted", async () => {
    // PREPARE: simulate successful geolocation with mock coordinates
    const mockCoords = { latitude: 45, longitude: -75 };
    const getCurrentPosition = jest.fn((success) =>
      success({ coords: mockCoords })
    );
    // @ts-ignore override navigator
    navigator.geolocation = { getCurrentPosition };

    // ACT: call the function
    const location = await getUserLocation();

    // VERIFY: check coordinates and that geolocation was used
    expect(location).toEqual(mockCoords);
    expect(getCurrentPosition).toHaveBeenCalled();
  });

  test("rejects with default Toronto coords when permission is denied or error occurs", async () => {
    // PREPARE: simulate error in geolocation callback
    const mockError = { code: 1, message: "Permission denied" };
    const getCurrentPosition = jest.fn((_success, error) => error(mockError));
    // @ts-ignore override navigator
    navigator.geolocation = { getCurrentPosition };

    // ACT & VERIFY: expect default Toronto coordinates
    await expect(getUserLocation()).rejects.toEqual({
      latitude: 43.70011,
      longitude: -79.4163,
    });
  });

  test("rejects with default Toronto coords when geolocation is not supported", async () => {
    // PREPARE: simulate missing geolocation support
    // @ts-ignore override navigator
    navigator.geolocation = undefined;

    // ACT & VERIFY: expect fallback coordinates
    await expect(getUserLocation()).rejects.toEqual({
      latitude: 43.70011,
      longitude: -79.4163,
    });
  });
});
