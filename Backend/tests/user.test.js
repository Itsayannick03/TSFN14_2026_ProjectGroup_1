const { registerUser, loginUser } = require("../controllers/userController");
const User = require("../models/Users");
//const bcrypt = require("bcrypt");

jest.mock("../models/Users");
//jest.mock("bcrypt");

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.cookie = jest.fn().mockReturnValue(res);
  return res;
};

describe("Auth Controller", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  // ✅ 1️⃣ Test Missing Fields
  it("should return 409 if required fields are missing", async () => {
    const req = {
      body: {
        email: "test@test.com",
        // missing firstName, lastName, password, phoneNumber
      },
    };
    const res = mockResponse();

    await registerUser(req, res);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({
      error: "Missing fields",
    });
  });

  // ✅ 2️⃣ Test Successful Registration
  it("should register user successfully", async () => {
    const req = {
      body: {
        firstName: "John",
        lastName: "Doe",
        email: "john@test.com",
        phoneNumber: "123456789",
        password: "123456",
      },
    };
    const res = mockResponse();

    // No existing user
    User.findOne.mockResolvedValue(null);

    // Mock bcrypt
    //bcrypt.genSalt.mockResolvedValue("salt");
    //bcrypt.hash.mockResolvedValue("hashedPassword");

    // Mock save
    const saveMock = jest.fn().mockResolvedValue(true);
    User.mockImplementation(() => ({
      save: saveMock,
      id: "12345",
    }));

    await registerUser(req, res);

    expect(User.findOne).toHaveBeenCalledWith({ email: "john@test.com" });
    //expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
    //expect(bcrypt.hash).toHaveBeenCalledWith("123456", "salt");
    expect(res.cookie).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      error: "Registration Sucessfull",
    });
  });

  // ✅ 3️⃣ Test Login - User Not Found
  it("should return 404 if login user not found", async () => {
    const req = {
      body: {
        email: "nouser@test.com",
        password: "123456",
      },
    };
    const res = mockResponse();

    User.findOne.mockResolvedValue(null);

    await loginUser(req, res);

    expect(User.findOne).toHaveBeenCalledWith({
      email: "nouser@test.com",
    });
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: "User not found",
    });
  });
});