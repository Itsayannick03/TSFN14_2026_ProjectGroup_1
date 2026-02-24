const { spawn } = require("child_process");
const os = require("os");
const process = require("process");

const system = os.platform(); // win32, linux, darwin

let frontend;
let backend;

if (system === "win32") {
  // Windows: open new cmd windows
  frontend = spawn(
    "cmd",
    ["/c", "start", "cmd", "/k", "cd Frontend && npm run dev"],
    { shell: true }
  );

  backend = spawn(
    "cmd",
    ["/c", "start", "cmd", "/k", "cd Backend && node server.js"],
    { shell: true }
  );
} else if (system === "linux" || system === "darwin") {
  // Linux / macOS
  frontend = spawn("npm", ["run", "dev"], {
    cwd: "Frontend",
    stdio: "inherit",
  });

  backend = spawn("node", ["server.js"], {
    cwd: "Backend",
    stdio: "inherit",
  });
} else {
  console.error("OS not supported");
  process.exit(1);
}

// Equivalent to frontend.wait() / backend.wait()
frontend.on("exit", (code) => {
  console.log(`Frontend exited with code ${code}`);
});

backend.on("exit", (code) => {
  console.log(`Backend exited with code ${code}`);
});