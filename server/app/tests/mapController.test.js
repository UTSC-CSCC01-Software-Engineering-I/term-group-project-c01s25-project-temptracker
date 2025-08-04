const { getTemperatureReading, lakeClicked, getChartData, checkWaterBodies } = require('../controllers/mapController');
const mapService = require('../services/mapService');

// Mock the mapService module
jest.mock('../services/mapService', () => ({
  getTemperatureReading: jest.fn(),
  lakeClicked: jest.fn(),
  getChartData: jest.fn(),
  checkWaterBodies: jest.fn(),
}));

// Mock Express response object
const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnThis();
  res.json = jest.fn().mockReturnThis();
  return res;
};

describe('mapController', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Suppress console logs to clean up test output
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console logs after each test
    console.log.mockRestore();
    console.error.mockRestore();
  });

  describe('getTemperatureReading', () => {
    it('should return temperature reading with status 201 on success', async () => {
      const mockResult = { message: 'Temperature reading acquired successfully', data: { temp: 20, lat: 42.0, lng: -80.0 } };
      mapService.getTemperatureReading.mockResolvedValue(mockResult);
      const req = {
        body: {
          coord: [42.0, -80.0],
          date: '20230804',
          hour: '12',
        },
      };
      const res = mockResponse();

      await getTemperatureReading(req, res);

      expect(mapService.getTemperatureReading).toHaveBeenCalledWith([42.0, -80.0], '20230804', '12');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should return status 500 with error message on failure', async () => {
      const mockError = new Error('Service error');
      mapService.getTemperatureReading.mockRejectedValue(mockError);
      const req = {
        body: {
          coord: [42.0, -80.0],
          date: '20230804',
          hour: '12',
        },
      };
      const res = mockResponse();

      await getTemperatureReading(req, res);

      expect(mapService.getTemperatureReading).toHaveBeenCalledWith([42.0, -80.0], '20230804', '12');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Service error' });
    });
  });

  describe('lakeClicked', () => {
    it('should return lake data with status 201 on success', async () => {
      const mockResult = { message: 'Point in known water body', lake: 'loofs' };
      mapService.lakeClicked.mockResolvedValue(mockResult);
      const req = {
        body: {
          coord: [42.0, -80.0],
          date: '20230804',
          hour: '12',
        },
      };
      const res = mockResponse();

      await lakeClicked(req, res);

      expect(mapService.lakeClicked).toHaveBeenCalledWith([42.0, -80.0], '20230804', '12');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should return status 500 with error message on failure', async () => {
      const mockError = new Error('Service error');
      mapService.lakeClicked.mockRejectedValue(mockError);
      const req = {
        body: {
          coord: [42.0, -80.0],
          date: '20230804',
          hour: '12',
        },
      };
      const res = mockResponse();

      await lakeClicked(req, res);

      expect(mapService.lakeClicked).toHaveBeenCalledWith([42.0, -80.0], '20230804', '12');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Service error' });
    });
  });

  describe('getChartData', () => {
    it('should return chart data with status 201 on success', async () => {
      const mockResult = { message: 'Successfully retrieved lake time data', data: [{ date: '2023-08', temperature: 21 }] };
      mapService.getChartData.mockResolvedValue(mockResult);
      const req = {
        body: {
          lake: 'loofs',
        },
      };
      const res = mockResponse();

      await getChartData(req, res);

      expect(mapService.getChartData).toHaveBeenCalledWith('loofs');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should return status 500 with error message on failure', async () => {
      const mockError = new Error('Service error');
      mapService.getChartData.mockRejectedValue(mockError);
      const req = {
        body: {
          lake: 'loofs',
        },
      };
      const res = mockResponse();

      await getChartData(req, res);

      expect(mapService.getChartData).toHaveBeenCalledWith('loofs');
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Service error' });
    });
  });

  describe('checkWaterBodies', () => {
    it('should return update results with status 201 on success', async () => {
      const mockResult = { message: 'Success', processed: 1, successful: 1, failed: 0, results: [{ id: 1, success: true, water_body: 'loofs' }] };
      mapService.checkWaterBodies.mockResolvedValue(mockResult);
      const req = {};
      const res = mockResponse();

      await checkWaterBodies(req, res);

      expect(mapService.checkWaterBodies).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('should return status 500 with error message on failure', async () => {
      const mockError = new Error('Service error');
      mapService.checkWaterBodies.mockRejectedValue(mockError);
      const req = {};
      const res = mockResponse();

      await checkWaterBodies(req, res);

      expect(mapService.checkWaterBodies).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Service error' });
    });
  });
});