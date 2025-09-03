const request = require('supertest');
const app = require('./index');

describe('GET /api/hello', () => {
  it('responds with json', async () => {
    const res = await request(app).get('/api/hello');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ message: 'Hello World' });
  });
});
