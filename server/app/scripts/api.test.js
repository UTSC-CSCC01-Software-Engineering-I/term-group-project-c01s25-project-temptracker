const axios = require('axios');
const { getAuthToken } = require('./getToken');

const SERVER_URL = 'http://4.236.162.53:8080'; // Deployed server
//const SERVER_URL = 'http://localhost:8080'; // Local server

let headers = {};

beforeAll(async () => {
    const token = await getAuthToken();
    headers = { Authorization: `Bearer ${token}` };
});

describe('API Integration Tests', () => {
    test('GET /api/users should return array', async () => {
        const res = await axios.get(`${SERVER_URL}/api/users`, { headers });
        expect(res.status).toBe(200);
        expect(Array.isArray(res.data.users)).toBe(true);
    });

    test('POST /api/temperatures with invalid data should fail', async () => {
        try {
            await axios.post(
                `${SERVER_URL}/api/temperatures`,
                { badField: 'invalid' },
                { headers }
            );
        } catch (err) {
            expect(err.response.status).toBeGreaterThanOrEqual(400);
        }
    });

    test('GET /api/poi should return 200', async () => {
        const res = await axios.get(
            `${SERVER_URL}/api/poi/closest?lat=43.6532&lon=-79.3832`,
            { headers }
        );
        expect(res.status).toBe(200);
        expect(Array.isArray(res.data)).toBe(true);
    });

    test('GET /api/tempByCoordinates/closest returns data', async () => {
        const params = {
            lat: '43.6532',
            lon: '-79.3832',
            limit: 3,
            interval: '30 days'
        };

        const res = await axios.get(`${SERVER_URL}/api/tempByCoordinates/closest`, {
            headers,
            params
        });

        expect(res.status).toBe(200);
        expect(Array.isArray(res.data)).toBe(true);
    });

    test('GET /api/tempByCoordinates/average returns average temperature', async () => {
        const res = await axios.get(
            `${SERVER_URL}/api/tempByCoordinates/average?lat=43.6532&lon=-79.3832`,
            { headers }
        );

        expect(res.status).toBe(200);
        expect(res.data).toHaveProperty('average');
        expect(typeof res.data.average === 'number' || res.data.average === null).toBe(true);
    });

    test('GET /api/poi/closest returns nearby POIs', async () => {
        const res = await axios.get(
            `${SERVER_URL}/api/poi/closest?lat=43.6532&lon=-79.3832`,
            { headers }
        );

        expect(res.status).toBe(200);
        expect(Array.isArray(res.data)).toBe(true);
        if (res.data.length > 0) {
            expect(res.data[0]).toHaveProperty('id');
            expect(res.data[0]).toHaveProperty('name');
            expect(res.data[0]).toHaveProperty('latitude');
            expect(res.data[0]).toHaveProperty('longitude');
            expect(res.data[0]).toHaveProperty('lake');
        }
    });

    test('GET /api/general-data/badges should return badges', async () => {
        const res = await axios.get(`${SERVER_URL}/api/general-data/badges`, { headers });

        expect(res.status).toBe(200);
        expect(Array.isArray(res.data)).toBe(true);

        if (res.data.length > 0) {
            expect(res.data[0]).toHaveProperty('id');
            expect(res.data[0]).toHaveProperty('name');
        }
    });


    test('POST /api/map-visual/fetch-contours returns expected structure', async () => {
        const today = new Date().toISOString().split("T")[0]; // e.g. "2025-08-04"
        const date = today;
        const currentHour = 12;

        const res = await axios.post(
            `${SERVER_URL}/api/map-visual/fetch-contours`,
            {
                date,
                today,
                currentHour,
                timeRange: "day",
            },
            { headers }
        );

        expect(res.status).toBe(201);
    });
});
