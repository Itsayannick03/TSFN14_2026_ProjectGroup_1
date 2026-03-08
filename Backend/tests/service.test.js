const { createService,getServices, deleteService } = require("../controllers/serviceController");
const Service = require("../models/Service");
jest.mock("../models/Service");

// test 1 - create a service 
test("should create service successfully", async () => {
    const req = {
      body: {
        name: "Haircut",
        description: "Basic haircut service",
        price: 200,
        duration: 30,
      },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // mock save
    Service.mockImplementation(() => ({
      save: jest.fn().mockResolvedValue(true),
    }));

    await createService(req, res);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      message: "Service created",
      service: expect.any(Object),
    });
  });



// test 2 cant find a service
test("should return 500 if database fails", async () => {
  Service.find.mockRejectedValue(new Error("Database error"));

  const req = {};
  
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };

  await getServices(req, res);

  expect(res.status).toHaveBeenCalledWith(500);
  expect(res.json).toHaveBeenCalledWith({
    error: "Database error",
  });
});

// test 3 delete  service 
test("should delete service successfully", async () => {
    const req = {
      params: { id: "123" },
    };

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // mock service
    Service.findByIdAndDelete.mockResolvedValue({
      _id: "123",
      name: "Haircut",
    });

    await deleteService(req, res);

    expect(Service.findByIdAndDelete).toHaveBeenCalledWith("123");
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Service deleted",
    });
  });