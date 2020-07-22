import axios from "axios";
import cheerio from "cheerio";

const _get = async ({ headId, catId, row, variant }) => {
  const { data } = await axios.get(
    `https://www.psacard.com/Pop/GetItemTable?headingID=${headId}&categoryID=${catId}`,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36",
      },
    }
  );
  const $ = cheerio.load(data);
  const totalItems = $("table.interior-result-table tbody")
    .find("tr")
    .toArray();
  const items = totalItems
    .map((item) => {
      const line = $(item).find("td.card-num").text();
      const lineNumber = line
        .replace(
          /[a-zA-Z\!\"\#\$\%\&\'\(\)\*\+\,\-\/\:\;\<\=\>\?\@\[\\\]\^\_\`{\|\}\~]/,
          ""
        )
        .trim();
      if (lineNumber == row.toString()) {
        return item;
      }
    })
    .filter((item) => item);
  let target = null;

  if (items.length <= 0) {
    return target;
  }
  if (!variant || variant.length <= 0) {
    target = items[0];
  } else {
    items.forEach((item) => {
      const isThisOne = $(item)
        .find(".shop-link")
        .parent()
        .text()
        .includes(variant);
      if (isThisOne) {
        target = item;
      }
    });
  }
  if (target) {
    $(target).find("td:first-child").remove();
    $(target).find("td:first-child").remove();
    return $(target).html();
  }
  return null;
};

export const getCardData = async (link: string, row: number, variant) => {
  const { data } = await axios.get(link, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.108 Safari/537.36",
    },
  });
  const $ = cheerio.load(data);
  const headId = $("#headingid").val();
  const catId = $("#categoryid").val();
  const html = await _get({
    catId,
    headId,
    row,
    variant,
  });
  return html;
};
