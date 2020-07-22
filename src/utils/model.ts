import hsrClient from "./hasura";
import gql from "graphql-tag";
import _ from "lodash";
import { SoldType } from "./crawler";
export const bulkUpsertItems = async (items) => {
  return hsrClient.mutate({
    mutation: gql`
      mutation upsertItems($items: [item_insert_input!]!) {
        insert_item(
          objects: $items
          on_conflict: { constraint: item_pkey, update_columns: [] }
        ) {
          affected_rows
        }
      }
    `,
    variables: {
      items,
    },
  });
};

export const updateItemOfferPrice = async (itemId, offerPrice) => {
  const {
    data: { returning: item },
  } = await hsrClient.mutate({
    mutation: gql`
      mutation updateItemOfferPrice($itemId: bigint!, $offerPrice: Float!) {
        update_item(
          where: { id: { _eq: $itemId } }
          _set: { offerPrice: $offerPrice }
        ) {
          returning {
            id
            bids
            offerPrice
            price
            shipping
            soldDate
            soldType
            title: _data(path: "title")
            link: _data(path: "link")
            pic: _data(path: "pic")
          }
        }
      }
    `,
    variables: {
      itemId,
      offerPrice,
    },
  });
  return item;
};

export const getItemById = async (itemId) => {
  const {
    data: { item: items },
  } = await hsrClient.query({
    query: gql`
      query checkIfItemIsExist($itemId: bigint!) {
        item(where: { id: { _eq: $itemId } }) {
          id
          bids
          offerPrice
          price
          shipping
          soldDate
          soldType
          title: _data(path: "title")
          link: _data(path: "link")
          pic: _data(path: "pic")
        }
      }
    `,
    variables: {
      itemId,
    },
  });
  return items[0] || null;
};

export const getProxies = async () => {
  const {
    data: { setting: settings },
  } = await hsrClient.query({
    query: gql`
      query fetchProxy {
        setting {
          proxy
        }
      }
    `,
  });
  if (settings.length === 0) {
    throw new Error("setting missing");
  }
  const setting = settings[0];
  const { proxy } = setting;
  if (proxy.length <= 0) {
    return [];
  }
  const proxies = proxy.split(/\n/);
  return _.shuffle(
    proxies.map((proxy) => {
      const data = proxy.split(":");
      const host = data[0];
      const port = Number(data[1]);
      const type = data[2];
      let auth = undefined;
      if (data[3] && data[4]) {
        auth = {
          username: data[3],
          password: data[4],
        };
      }
      return {
        host,
        port,
        type,
        auth,
      };
    })
  );
};

export const getItemNeedBestOffer = async () => {
  const {
    data: { item: items },
  } = await hsrClient.query({
    query: gql`
      query fetchItemByType($type: String!) {
        item(
          where: { isSyncBestOffer: { _eq: false }, soldType: { _eq: $type } }
          limit: 10
        ) {
          id
          offerPrice
          _data
        }
      }
    `,
    variables: {
      type: SoldType.OFFER,
    },
  });
  return items;
};

export const updateBestOfferById = async (id: number, offerPrice: number) => {
  return hsrClient.mutate({
    mutation: gql`
      mutation updateBestOffer($id: bigint!, $offerPrice: Float!) {
        update_item_by_pk(
          pk_columns: { id: $id }
          _set: { isSyncBestOffer: true, offerPrice: $offerPrice }
        ) {
          id
        }
      }
    `,
    variables: {
      id,
      offerPrice,
    },
  });
};
