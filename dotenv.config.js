const path = require("path");
const fs = require("fs");
const getEnvFile = () => {
  const envPath = path.join(
    __dirname,
    `./.environments/${process.env.NODE_ENV}.env`
  );
  if (fs.existsSync(envPath)) {
    return envPath;
  } else {
    if (process.env.NODE_ENV !== "production") {
      throw new Error(`missing env file for stage: ${process.env.NODE_ENV}`);
    }
    return null;
  }
};
const envFile = getEnvFile();
if (envFile) {
  require("dotenv-safe").config({
    path: envFile,
  });
} else {
  require("dotenv-safe").config();
}
module.exports = {
  getEnvFile,
};
