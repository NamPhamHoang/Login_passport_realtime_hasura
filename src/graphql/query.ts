import gql from "graphql-tag";

export const FETCH_DEFINED_LIST = gql`
  query fetchDefinedList($limit: Int!, $offset: Int!) {
    defined_list(limit: $limit, offset: $offset) {
      id
      keyword
      syncedAt
      exclusion
      psa_link
      psa_line
    }
  }
`;

export const FETCH_TOTAL_DEFINED_LIST = gql`
  query fetchTotalDefinedList {
    defined_list_aggregate {
      aggregate {
        count
      }
    }
  }
`;

export const FETCH_DELETE_REQUESTION = gql`
  query fetchDeteteRequestion {
    delete_requestion(order_by: { id: desc }) {
      id
      item_id
      item {
        bids
        offerPrice
        shipping
        offerPrice
        shipping
        price
        soldDate
        soldType
        _data
      }
    }
  }
`;
