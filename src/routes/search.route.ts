const express = require("express");
const Router = express.Router();
import { searchV2 } from "~@/utils/crawler";
import { getEbayClient } from "~@/utils/helper";
// const { bulkUpsertItems } = require("../utils/model");
const bodyParser = require("body-parser");
Router.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
Router.use(bodyParser.json());

Router.post("/", async (req, res) => {
  const keyword = req.body.keyword;
  const exclude = req.body.exclude || "";
  const pageNumber = req.body.pageNumber || 1;
  if (!keyword || keyword.length < 0) {
    return res.status(400).json({
      error: true,
      payload: "Please input your keyword",
    });
  }
  const ebayClient = await getEbayClient();
  const { items, isHasNextPage, totalItems } = await searchV2(
    ebayClient,
    keyword,
    { words: exclude, xchars: "?" },
    pageNumber
  );
  res.json({
    currentPage: pageNumber,
    totalItems,
    itemsPerPage: 100,
    currentItems: items,
    isHasNextPage,
  });

  // bulkUpsertItems(items.map((item) => Helper.manipulateItem(item)));
});
export default Router;
