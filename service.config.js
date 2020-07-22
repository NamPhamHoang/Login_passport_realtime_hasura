const log = require("~@/utils/logger").default;
const { registerErrorHandling } = require("devergroup-error");
registerErrorHandling({
  logger: log,
  isForceQuitWhenErrorOccur: true,
});

const wait = (time) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};
process.once("beforeExit", async (code) => {
  log.warn(`grateful exit with code: ${process.env.uid}`, code);
  await wait(process.env.spinSleepTime);
});
