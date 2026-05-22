const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

try {
  console.log("Starting backend...");

  const backendPath = path.join(__dirname, "../backend/FMSbackend");
  const venvPath = path.join(__dirname, "../venv");
  const isWindows = process.platform === "win32";

  const pythonExec = isWindows
    ? path.join(venvPath, "Scripts", "python.exe")
    : path.join(venvPath, "bin", "python");

  const pipExec = isWindows
    ? path.join(venvPath, "Scripts", "pip.exe")
    : path.join(venvPath, "bin", "pip");

  // Step 1: Create venv if missing
  if (!fs.existsSync(venvPath)) {
    console.log("Virtual environment not found! Creating venv...");

    // Create venv using system python
    execSync(`"${isWindows ? "python" : "python3"}" -m venv "${venvPath}"`, { stdio: "inherit" });

    console.log("Upgrading pip...");
    execSync(`"${pipExec}" install --upgrade pip`, { stdio: "inherit" });

    console.log("Installing backend dependencies...");
    execSync(`"${pipExec}" install -r "${path.join(backendPath, "requirements.txt")}"`, { stdio: "inherit" });
  }

  // Step 2: Ensure Django is installed (for safety)
  try {
    execSync(`"${pipExec}" show django`, { stdio: "inherit" });
  } catch {
    console.log("Django not found, installing...");
    execSync(`"${pipExec}" install django`, { stdio: "inherit" });
  }

  // Step 3: Start Django server
  console.log("Starting Django server...");
  execSync(`"${pythonExec}" "${path.join(backendPath, "manage.py")}" runserver`, { stdio: "inherit" });

} catch (err) {
  console.error("Backend failed to start:", err.message);
  process.exit(1);
}
