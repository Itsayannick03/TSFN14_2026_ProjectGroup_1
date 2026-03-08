

const { registerUser, loginUser } = require("../controllers/userController");
const User = require("../models/Users");
const bcrypt = require("bcrypt");
jest.mock("../models/Users");

  // test 1 missing fields
  test("should return 409 if required fields are missing", async () => {
    const req = {
      body: {
        email: "test@test.com",
        // missing firstName, lastName, password, phoneNumber
      },
    };
    
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      error: "Missing fields",
    });
  });

  //  test 2 successful registration
  test("should register user successfully", async () => {
    const req = {
      body: {
        firstName: "John",
        lastName: "Doe",
        email: "john@test.com",
        phoneNumber: "123456789",
        password: "123456",
      },
    };
   const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      cookie: jest.fn(),
    };

     //  mock user does not exist
    User.findOne = jest.fn().mockResolvedValue(null);

    //  mock password
    bcrypt.genSalt = jest.fn().mockResolvedValue("salt");
    bcrypt.hash = jest.fn().mockResolvedValue("hashedPassword");

    //  mock new user
    User.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(true),
      id: "123",
    }));

    await registerUser(req, res);

    expect(res.cookie).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      error: "Registration Sucessfull",
    });
  });

  // test 3 login 
  test("should return 404 if login user not found", async () => {
    const req = {
      body: {
        email: "nouser@test.com",
        password: "123456",
      },
    };
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    User.findOne.mockResolvedValue(null);

    await loginUser(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "User not found",
    });
  });
