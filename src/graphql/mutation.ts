import gql from "graphql-tag";

export const INSERT_DEFINED_LIST = gql`
  mutation insertDefinedList(
    $item: [defined_list_insert_input!]!
    $on_confict: defined_list_on_conflict
  ) {
    insert_defined_list(objects: $item, on_conflict: $on_confict) {
      returning {
        id
        keyword
      }
    }
  }
`;

export const DELETE_DEFINED_LIST = gql`
  mutation deleteDefinedList($idDefinedList: String!) {
    delete_defined_list(where: { id: { _eq: $idDefinedList } }) {
      affected_rows
    }
  }
`;

export const UPDATE_DATE_DEFINED_LIST = gql`
  mutation updateDefinedList(
    $idDefinedList: String!
    $data: defined_list_set_input
  ) {
    update_defined_list(where: { id: { _eq: $idDefinedList } }, _set: $data) {
      affected_rows
    }
  }
`;

export const DELETE_ITEM = gql`
  mutation deleteItem($id: bigint!) {
    delete_item(where: { id: { _eq: $id } }) {
      affected_rows
    }
    delete_defined_list_item(where: { item_id: { _eq: $id } }) {
      affected_rows
    }
  }
`;

export const DELETE_REQUESTION = gql`
  mutation deleteItem($id: bigint!) {
    delete_delete_requestion(where: { item_id: { _eq: $id } }) {
      affected_rows
    }
  }
`;

export const UPDATE_EXCLUDE_WORD_BY_TYPE = gql`
  mutation updateExclude(
    $type: String!
    $data: common_exclude_list_set_input!
  ) {
    update_common_exclude_list(where: { type: { _eq: $type } }, _set: $data) {
      affected_rows
    }
  }
`;
