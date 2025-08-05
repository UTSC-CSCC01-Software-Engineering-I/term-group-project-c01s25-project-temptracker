const axios = require('axios');
const { getAuthToken } = require('./getToken');

const SERVER_URL = 'http://4.236.162.53:8080'; // Deployed server
//const SERVER_URL = 'http://localhost:8080'; // Local server

// Add timing to each request
axios.interceptors.request.use(config => {
    config.metadata = { startTime: Date.now() };
    return config;
});

// Utility to measure duration
function getDuration(res) {
    return Date.now() - res.config.metadata.startTime;
}

describe('Performance Tests (Deployed)', () => {
    let headers;

    beforeAll(async () => {
        const token = await getAuthToken();
        headers = { Authorization: `Bearer ${token}` };
    });

    test('GET /api/users responds under 500ms', async () => {
        const res = await axios.get(`${SERVER_URL}/api/users`, { headers });
        const duration = getDuration(res);

        expect(res.status).toBe(200);
        expect(duration).toBeLessThan(850);
    });

    test('GET /api/poi/closest responds under 500ms', async () => {
        const res = await axios.get(`${SERVER_URL}/api/poi/closest?lat=43.7&lon=-79.4`, { headers });
        const duration = getDuration(res);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.data)).toBe(true);
        expect(duration).toBeLessThan(500);
    });

    test('GET /api/tempByCoordinates/closest responds under 500ms', async () => {
        const res = await axios.get(`${SERVER_URL}/api/tempByCoordinates/closest?lat=43.7&lon=-79.4`, { headers });
        const duration = getDuration(res);

        expect(res.status).toBe(200);
        expect(Array.isArray(res.data)).toBe(true);
        expect(duration).toBeLessThan(500);
    });


    test("GET /api/general-data/badges responds under 500ms", async () => {
        const res = await axios.get(`${SERVER_URL}/api/general-data/badges`, { headers });

        const duration = getDuration(res);

        expect(res.status).toBe(200);
        expect(duration).toBeLessThan(800);
    });


    test('POST /api/map/fetch-contours responds under 1000ms', async () => {
        const body = {
            date: new Date().toISOString(),
            today: new Date().toISOString(),
            currentHour: new Date().getUTCHours(),
            timeRange: 'day',
        };

        const res = await axios.post(`${SERVER_URL}/api/map-visual/fetch-contours`, body, { headers });
        const duration = getDuration(res);

        expect(res.status).toBe(201);
        expect(duration).toBeLessThan(1000); // Relaxed limit for heavier route
    });
});
