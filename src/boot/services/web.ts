import { createProxyMiddleware } from "http-proxy-middleware";
import path from "path";
import log from "~@/utils/logger";
import express from "express";
import cors from "cors";

const app = express();
import bodyParser from "body-parser";

app.use(
  //@TODO: add to env
  cors({
    origin: "*",
  })
);

import searchRoute from "~@/routes/search.route";
import getBestOfferRoute from "~@/routes/get_best_offer.route";

app.use(
  "/hasura",
  createProxyMiddleware({
    target: `${process.env.HASURA_ENDPOINT}`,
    logLevel: "error",
    pathRewrite: (path) => {
      const pathSlashArr = path.split("/").filter((str) => str.length > 0);
      if (pathSlashArr.length <= 1) return "/";
      pathSlashArr.shift();
      return "/" + pathSlashArr.join("/");
    },

    ws: true,
    followRedirects: true,
  })
);
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// app.use("/public", express.static(path.join(__dirname, "../../public")));

app.use("/search", searchRoute);
app.use("/bestOffer", getBestOfferRoute);

(async () => {
  app.listen(process.env.PORT, () => {
    log.info(`> web application is runnning on PORT: ${process.env.PORT}`, {
      port: process.env.PORT,
    });
  });
})();
