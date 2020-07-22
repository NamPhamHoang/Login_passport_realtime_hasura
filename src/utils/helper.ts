import _ from "lodash";
import DvRequest from "devergroup-request";
import log from "./logger";
import { getProxies } from "./model";

export const manipulateItem = (item) => {
  return {
    id: item.id,
    shipping: item.shipping,
    soldDate: item.soldDate,
    soldType: item.soldType,
    price: item.price,
    bids: item.bids,
    offerPrice: item.offerPrice,
    _data: _.pick(item, ["link", "pic", "title"]),
  };
};

export const getEbayClient = async () => {
  const proxies = await getProxies();
  // console.log(proxies);
  return getRequest(proxies);
};

export const getRequest = async (proxy = []): Promise<DvRequest> => {
  // let currentCookie = await redis.get("cookie_string");
  let headers = {};
  headers[
    "cookie"
  ] = `ak_bmsc=D2F4871664CAAA550D3A6E96CE189CE9764511B8DE4C00009E7D855E40F31754~pl8aCT2YG0GvuurTuj36BResMBSSU/JQCVgtMgfeDdblGkL3MdklZlhXrSTKj0gjr9q9C14F0tgEJVqPgpJG5pv0QJnmqhv75sd9gq5IRgyySRJfhiwjgRhQjImaT88FJkvmXFkck0lpcPPZk6J3/gdBA5xdvVt658fmngFq8Nz3vxw7uHSEuKtisZQ4mHMvYjku13MvGdzdfOjroIgmPwNFLmMPuHjURfxiZOvMtcLj4=; JSESSIONID=8CE497997ED063AAC18479555F4CCF5A; AMCVS_A71B5B5B54F607AB0A4C98A2%40AdobeOrg=1; AMCV_A71B5B5B54F607AB0A4C98A2%40AdobeOrg=-1303530583%7CMCIDTS%7C18355%7CMCMID%7C60279351420273947712357412810169157558%7CMCAAMLH-1586411588%7C3%7CMCAAMB-1586411588%7CRKhpRz8krg2tLO6pguXWp5olkAcUniQYPHaMWWgdJ3xzPWQmdj0y%7CMCCIDH%7C-1190537685%7CMCOPTOUT-1585813988s%7CNONE%7CvVersion%7C3.3.0; aam_uuid=60290114390372698702358734547985710603; bm_sv=372C1B70BC9066EE01585A73811E9957~VUyHGf48GSpHPczWX4rtPl0q+WlF0t/EhJfV3OFb9p+bQ67rY1VzbWqGzJZnL5Rlv9mTSTmgnPs04RiMadt8MyLYGblPnpEVwIpcugVsyJZ1ovbF0aQKzvcwS4g/IKUi9NGaFw/sh9O3plb1rb42h/iMa6mntcuZemUxYVbqEtQ=; npii=btguid/3972b0401710a9e4859d75e9ffb4ecb26247e666^cguid/3972b68c1710a9b13a65cdd5fcda6fa86247e666^; ns1=BAQAAAXEjloDVAAaAANgATGBmsuZjNzJ8NjAxXjE1ODU4MDY3ODU3NzJeXjBeN3w1fDN8Mnw0fDExXjFeMl40XjNeMTNeMTJeMl4xXjFeMF4wXjBeMV42NDQyNDU5MDc1diGUW/DRN6B8RsJc6tnF2J3P2Uo*; dp1=bu1p/QEBfX0BAX19AQA**6247e666^bl/US6247e666^pbf/%23e000e000000000000000006066b2e6^; s=CgAD4ACBehtDmMzk3MmIwNDAxNzEwYTllNDg1OWQ3NWU5ZmZiNGVjYjK42kgd; nonsession=CgADLAAJehYZuMjIAygAgYkfmZjM5NzJiMDQwMTcxMGE5ZTQ4NTlkNzVlOWZmYjRlY2IyHd4FMg**; ebay=%5Esbf%3D%23d00000000060110%5Ejs%3D1%5Epsi%3DAd79Wud0*%5E; ds2=sotr/b8_5azzzzzzz^`;

  const request = new DvRequest({
    autoUserAgent: true,
    axiosOpt: {
      headers,
      timeout: 30 * 1000,
    },
    cookieJarString: undefined,
    proxy: proxy,
  });

  request.instance.interceptors.response.use(
    async (req) => {
      // currentCookie = JSON.stringify(cookieJar.serializeSync());
      // await redis.set("cookie_string", currentCookie);
      return req;
    },
    (err) => {
      // console.log(err);
      log.error("err when fetch (ebay)", { err });
      throw new Error(`err when fetch : ${err.message}`);
    }
  );

  return request;
};

export const wait = (time: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, time);
  });
};
