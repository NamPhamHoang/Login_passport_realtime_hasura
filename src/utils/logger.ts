import { createLogger, TransportType } from "devergroup-error";

const getTransports = () => {
  if (process.env.NODE_ENV === "production") {
    return [TransportType.SENTRY, TransportType.CONSOLE];
  } else {
    return [TransportType.CONSOLE];
  }
};

const logger = createLogger({
  transports: getTransports(),
  context: {
    sentryOpts: {
      sentry: {
        dsn: process.env.SENTRY_DSN, //@Todo ADD to .env
      },
      level: "error",
    },
  },
});
export default logger;
