import DvRequest from "devergroup-request";
import moment from "moment";

import cheerio from "cheerio";
import _ from "lodash";

import log from "./logger";

export const SoldType = {
  AUCTION: "AUCTION",
  OFFER: "OFFER",
  FIXED: "FIXED",
  UNKNOWN: "UNKNOWN",
};

// const getSecondHttpClient = async () => {
//   const headers = {
//     "User-Agent": userAgent.getRandom(
//       (ua) => ua.userAgent.indexOf("linux") !== -1
//     ),
//   };

//   const instance = axios.create({
//     headers,
//     timeout: 30 * 1000,
//   });

//   instance.interceptors.response.use(
//     (req) => {
//       return req;
//     },
//     (err) => {
//       log.error("err when fetch (normal_client)", { err });
//       throw new Error("err when fetch(normal_client)");
//     }
//   );

//   return instance;
// };

const text2Price = (textPrice) => {
  return Number(
    textPrice
      .trim()
      .replace(
        /[a-zA-Z\!\"\#\$\%\&\'\(\)\*\+\,\-\/\:\;\<\=\>\?\@\[\\\]\^\_\`{\|\}\~]/g,
        ""
      )
      .trim()
  );
};

// export const getBestOffer = async (ebayId) => {
//   const client = await getSecondHttpClient();
//   const { data, status } = await client.post(
//     "https://130point.com/wp_pages/sales/getBestOffer.php",
//     qs.stringify({
//       type: "simple",
//       ebayID: ebayId,
//     }),
//     {
//       headers: {
//         "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
//         Accept: "*/*",
//         Referer: "https://130point.com/sales/",
//         Origin: "https://130point.com",
//         "X-Requested-With": "XMLHttpRequest",
//       },
//     }
//   );
//   if (status === 200) {
//     const $ = cheerio.load(data);
//     //@TODO: check if any
//     const offerPrice: any = text2Price($("input[type=submit]").val().trim());
//     if (offerPrice.indexOf("View Best Offer Accepted") !== -1) {
//       throw new Error("Cant fetch the best offer");
//     }
//     // tslint:disable-next-line:radix
//     return offerPrice;
//   } else {
//     throw new Error(`Can't not fetch the ebay offerPrice`);
//   }
// };

export const getBestOfferV2 = async (
  ebayClient: DvRequest,
  itemLink: string,
  originalPrice: number
) => {
  itemLink = itemLink.replace(/(\?.*)|(#.*)/g, "?");

  const suffix = "nordt=true&rt=nc&orig_cvip=true";
  itemLink = itemLink + suffix;
  const { data, status } = await ebayClient.get(itemLink);
  if (status === 200) {
    const bestOfferDetectPos = data.indexOf('"taxExclusivePrice":');
    if (bestOfferDetectPos === -1) {
      return originalPrice;
    }
    const nextPos = data.indexOf(
      ',"',
      bestOfferDetectPos + '"taxExclusivePrice":'.length
    );
    const price = data.slice(
      bestOfferDetectPos + '"taxExclusivePrice":'.length,
      nextPos
    );
    return text2Price(price) || originalPrice;
  }
  throw new Error("fetch error");
};

const exclusionString2Array = (exclusion, exChars): [string[], string[]] => {
  const MAX_BUILT_IN_EXCLUDE = 10;
  let xcharsArray = [];
  if (exChars) {
    xcharsArray = exChars
      .split(/ +/)
      .map((char) => char.toLowerCase().replace(/ /g, ""))
      .filter((item: string) => item && item.length > 0);
  }

  if (!exclusion || exclusion.length === 0) return [[], []];

  const words: string[] = exclusion
    .split(",")
    .map((word) => word.toLowerCase().replace(/ /g, ""))
    .filter((item) => item && item.length > 0);

  const chunkArray = _.chunk(words, MAX_BUILT_IN_EXCLUDE);

  if (chunkArray.length > 0) {
    const firstChunk = chunkArray[0];
    chunkArray.shift();
    const secondChunk = chunkArray.reduce((prev, current) => {
      return [...prev, ...current];
    }, []);

    return [firstChunk, [...secondChunk, ...xcharsArray]];
  }

  return [chunkArray[0], []];
};

export const searchV2 = async (
  ebayClient: DvRequest,
  keyword: string,
  { words: exWords, xchars: exXchars },
  pageNumber: number
) => {
  const [exclusionInTheUrl, secondaryExclusion] = exclusionString2Array(
    exWords,
    exXchars
  );

  let queryText =
    keyword +
    exclusionInTheUrl.reduce((pre, current) => {
      return pre + ` -${current}`;
    }, "");

  queryText = queryText.replace(/ +/g, "+");
  const url = `https://www.ebay.com/sch/i.html?_from=R40&_nkw=${queryText}&_sacat=0&LH_TitleDesc=0&LH_PrefLoc=3&LH_Sold=1&rt=nc&_ipg=100&_pgn=${pageNumber}`;
  // log.info(`crawing the url: ${url}`, { url });

  const { data, status } = await ebayClient.get(url);
  if (status === 200) {
    const $ = cheerio.load(data);
    let items = [];
    const divider = $(".srp-river-answer--REWRITE_START").is("div");
    if (divider) {
      const isMistake = $(".srp-river-answer--REWRITE_START")
        .text()
        .includes("Did you mean");
      if (isMistake) {
        items = $("ul.srp-results > .s-item").toArray();
      } else {
        items = $(".srp-river-answer--REWRITE_START")
          .last()
          .prevAll(".s-item")
          .toArray();
        items = items.reverse();
      }
    } else {
      items = $("ul.srp-results > .s-item").toArray();
    }
    const totalItems = $(".srp-controls__count .srp-controls__count-heading")
      .find("span")
      .first()
      .text()
      .trim()
      .replace(/\,/g, "");

    const isTitleValid = (title: string) => {
      if (!secondaryExclusion || secondaryExclusion.length === 0) return true;
      let isValid = true;
      for (let i = 0; i <= secondaryExclusion.length - 1; i++) {
        if (title.toLowerCase().indexOf(secondaryExclusion[i]) !== -1) {
          isValid = false;
        }
      }
      return isValid;
    };

    let rawItems = (
      await Promise.all(
        items.map(async (item) => {
          const pic = $(item).find(".s-item__image img").first().attr("src");
          const title = $(item).find(".s-item__title").text().trim();
          const isTitlevalid = isTitleValid(title);
          if (!isTitlevalid) {
            // log.info(`ignored item: ${title}`, {
            //   title,
            //   secondaryExclusion,
            //   isTitlevalid,
            // });
            return undefined;
          }
          const getShippingCost = () => {
            let shipping = $(item)
              .find(".s-item__shipping")
              .first()
              .text()
              .trim();
            if (shipping !== "Free Shipping") {
              shipping = shipping.replace(/\+|shipping/g, "").trim();
              return text2Price(shipping);
            }
            return 0;
          };
          const date = $(item).find(".s-item__ended-date").text();
          let price: any = $(item)
            .find(".s-item__price span")
            .first()
            .text()
            .replace(/\$|\,|C/g, "");

          const link = $(item).find(".s-item__link").attr("href");
          const productHint = $(item)
            .find(".s-item__purchase-options-with-icon")
            .first()
            .text();
          let soldType = SoldType.UNKNOWN;
          if (productHint.length === 0) {
            soldType = SoldType.AUCTION;
          }
          if (productHint.indexOf("Best Offer") !== -1) {
            soldType = SoldType.OFFER;
          }
          if (productHint.indexOf("Buy") !== -1) {
            soldType = SoldType.FIXED;
          }
          let bids: any = $(item)
            .find(".s-item__bids")
            .text()
            .replace(/bids/, "")
            .trim();
          if (soldType !== "AUCTION") {
            bids = null;
          } else {
            bids = parseInt(bids);
          }

          const getId = () => {
            const lastIndex = link.indexOf("?");
            const firstIndex = link.lastIndexOf("/", lastIndex) + 1;
            return parseInt(link.slice(firstIndex, lastIndex));
          };

          const id = getId();

          price = text2Price(price);
          let offerPrice = null;
          // if (soldType === SoldType.OFFER && fullySearch) {
          //   log.info("start: get best offer", {
          //     link,
          //     price,
          //   });
          //   try {
          //     offerPrice = await getBestOfferV2(ebayClient, link, price);
          //   } catch {
          //     throw new Error(`Can't not get bestOffer Price ${id}`);
          //     // try {

          //     //   // offerPrice = getBestOffer(id);
          //     //   // offerPrice = price;
          //     // } catch {
          //     //   offerPrice = price;
          //     // }
          //   }
          //   log.info("end: get best offer", {
          //     link,
          //     price,
          //     offerPrice,
          //   });
          // }

          return {
            pic,
            title,
            soldType,
            shipping: getShippingCost(),
            id,
            soldDate: moment(date, "MMM-DD HH:mm"),
            price,
            bids,
            offerPrice: offerPrice || 0,
            link,
          };
        })
      )
    ).filter((item) => item);

    const checkIfHasNextPage = () => {
      const nextBtn = $(".srp-results .pagination__next");
      const isExisted = nextBtn.toArray().length > 0;
      if (!isExisted) return false;
      const isDisabled = $(nextBtn).attr("aria-disabled");
      if (isDisabled) return false;
      return true;
    };
    const isHasNextPage = checkIfHasNextPage();
    return {
      items: rawItems,
      currentPage: pageNumber,
      isHasNextPage,
      totalItems: parseFloat(totalItems),
    };
  }
};
