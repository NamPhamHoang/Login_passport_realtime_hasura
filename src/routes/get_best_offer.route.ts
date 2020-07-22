import express from "express";

const Router = express.Router();
import { getBestOfferV2 } from "~@/utils/crawler";
import { getEbayClient } from "~@/utils/helper";

Router.post("/", async (req, res) => {
  const { item } = req.body;
  try {
    const ebayClient = await getEbayClient();
    const offerPrice = await getBestOfferV2(ebayClient, item.link, item.price);
    item.offerPrice = offerPrice;
    return res.json({
      error: false,
      payload: item,
    });
  } catch (err) {
    return res.status(400).json({
      err: true,
      message: `Can't fetch the best offer price ${err.toString()}`,
    });
  }
});

export default Router;
