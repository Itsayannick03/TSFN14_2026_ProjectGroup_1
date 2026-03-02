const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/Users');

describe('Booking Controller - Essential Tests', () => {
  let testUser;
  let testService;
  let agent;

  beforeAll(async () => {
    await Booking.deleteMany({});
    await Service.deleteMany({});
    await User.deleteMany({});
    
    testUser = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phoneNumber: '123-456-7890',
      password: 'hashedpassword',
      role: 'user'
    });

    testService = await Service.create({
      name: 'Test Service',
      price: 100,
      duration: 60
    });
  });

  beforeEach(() => {
    agent = request.agent(app);
  });

  // TEST 1: GET /api/bookings - Public endpoint
  test('1. Anyone can see booked dates', async () => {
    const response = await request(app)
      .get('/api/bookings')
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  // TEST 2: POST /api/bookings/select-service - Success case
  test('2. Authenticated user can select services', async () => {
    const response = await agent
      .post('/api/bookings/select-service')
      .set('Cookie', [`user=${testUser._id}`])
      .send({ services: [testService._id.toString()] })
      .expect(201);

    const cookies = response.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toContain('services=');
  });

  // TEST 3: POST /api/bookings/select-service - Error case
  test('3. Invalid service ID is rejected', async () => {
    const fakeId = new mongoose.Types.ObjectId();
    
    const response = await agent
      .post('/api/bookings/select-service')
      .set('Cookie', [`user=${testUser._id}`])
      .send({ services: [fakeId.toString()] })
      .expect(401);

    expect(response.body.error).toBe('Service not found');
  });

  // TEST 4: POST /api/bookings/create - Full booking flow
  test('4. User can complete full booking process', async () => {
    // Select service
    await agent
      .post('/api/bookings/select-service')
      .set('Cookie', [`user=${testUser._id}`])
      .send({ services: [testService._id.toString()] });

    // Select date
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    
    await agent
      .post('/api/bookings/select-date')
      .set('Cookie', [`user=${testUser._id}`])
      .send({ date: futureDate.toISOString() });

    // Create booking
    const response = await agent
      .post('/api/bookings/create')
      .expect(201);

    expect(response.body.message).toBe('Booking created');

    // Verify in database
    const booking = await Booking.findOne({ 
      userID: testUser._id,
      date: futureDate
    });
    expect(booking).toBeTruthy();
  });
});