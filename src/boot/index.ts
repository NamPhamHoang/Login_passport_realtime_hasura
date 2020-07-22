import path from "path";

import forever from "forever";

const runFile = (servicePath) => {
  if (process.env.NODE_ENV === "production") {
    return `env NODE_ENV=production node -r ./dotenv.config -r module-alias/register -r ./service.config.js ${servicePath}`;
  } else {
    return `env NODE_ENV=development node -r ./dotenv.config -r ts-node/register -r tsconfig-paths/register ${servicePath}`;
  }
};

const services = [
  {
    uid: "api",
    path:
      process.env.NODE_ENV === "production"
        ? path.join(__dirname, "./services/api.js")
        : path.join(__dirname, "./services/api.ts"),
    isEnable: Number(process.env.ENALBE_API) === 1,
  },
];

export default async () => {
  services.forEach((service) => {
    if (service.isEnable) {
      forever.start(service.path, {
        command: runFile(service.path),
        uid: service.uid,
        env: {
          NODE_ENV: process.env.NODE_ENV,
          uid: service.uid,
          minUptime: 0,
          service: service.uid,
          killTree: true,
          spinSleepTime: 3000,
        },
      });
    }
  });
};
