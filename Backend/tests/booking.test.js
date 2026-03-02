const { 
  selectService, 
  createBooking, 
  selectDate 
} = require('../controllers/bookingControllers');

const Booking = require('../models/Booking');
const Service = require('../models/Service');
const User = require('../models/Users');

jest.mock('../models/Booking');
jest.mock('../models/Service');
jest.mock('../models/Users');

describe('Booking Controller - Mocked Unit Tests', () => {

  let req;
  let res;

  beforeEach(() => {
    req = {
      body: {},
      cookies: {},
      params: {}
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn()
    };

    jest.clearAllMocks();
  });

  // TEST 1 – selectService SUCCESS
  test('selectService should create cookie and return 201', async () => {
    req.body.services = ['serviceId1'];

    Service.findById.mockResolvedValue({ _id: 'serviceId1' });

    await selectService(req, res);

    expect(Service.findById).toHaveBeenCalledWith('serviceId1');
    expect(res.cookie).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ error: "Created new service" });
  });

  //  TEST 2 – selectService FAIL (service not found)
  test('selectService should return 401 if service does not exist', async () => {
    req.body.services = ['badId'];

    Service.findById.mockResolvedValue(null);

    await selectService(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: "Service not found" });
  });

  //  TEST 3 – createBooking SUCCESS
  test('createBooking should create new booking successfully', async () => {
    const fakeDate = new Date().toISOString();

    req.cookies = {
      services: JSON.stringify(['service1']),
      user: 'user1',
      bookingDate: fakeDate
    };

    Booking.findOne.mockResolvedValue(null);

    Booking.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(true)
    }));

    await createBooking(req, res);

    expect(Booking.findOne).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({ message: "Booking created" });
  });

  // TEST 4 – selectDate FAIL (date already booked)
  test('selectDate should return 400 if date already booked', async () => {
    const date = new Date().toISOString();
    req.body.date = date;

    Booking.findOne.mockResolvedValue({ _id: 'existingBooking' });

    await selectDate(req, res);

    expect(Booking.findOne).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: "Date already booked" });
  });

});