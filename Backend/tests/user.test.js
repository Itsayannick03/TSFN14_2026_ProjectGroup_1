

const { registerUser, loginUser } = require("../controllers/userController");
const User = require("../models/Users");
const bcrypt = require("bcrypt");
jest.mock("../models/Users");

  // 1 Test Missing Fields
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

  //  2 Test Successful Registration
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

     //  Mocka att användaren inte finns
    User.findOne = jest.fn().mockResolvedValue(null);

    //  Mocka bcrypt, för lösenord
    bcrypt.genSalt = jest.fn().mockResolvedValue("salt");
    bcrypt.hash = jest.fn().mockResolvedValue("hashedPassword");

    //  Mock new User().save()
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

  // 3 Test Login - User Not Found
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
