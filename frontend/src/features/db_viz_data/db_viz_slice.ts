import { createSlice } from "@reduxjs/toolkit";

import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";
import type { ColumnSchema, DBDetails } from "../../types";

export interface CounterState {
  value: DBDetails | null;
  nested_id: string | null;
  current_sub_tree: ColumnSchema | null;
  current_sub_tree_path: Array<[string, string | null]> | null;
}

export type UpdateFieldPayload = { id: string };

export type UpdatePathAndSubTree = {
  path: Array<[string, string | null]> | null;
  subtree: ColumnSchema | null;
};

const initialState: CounterState = {
  value: null,
  nested_id: null,
  current_sub_tree: null,
  current_sub_tree_path: null,
};

export const db_viz_slice = createSlice({
  name: "db_viz_data",
  initialState,
  reducers: {
    update_data: (state, action: PayloadAction<DBDetails>) => {
      state.value = action.payload;
    },
    update_table: (state, action: PayloadAction<UpdateFieldPayload>) => {
      state.nested_id = action.payload.id;
    },
    update_path_and_sub_tree: (
      state,
      action: PayloadAction<UpdatePathAndSubTree>,
    ) => {
      state.current_sub_tree = action.payload.subtree;
      state.current_sub_tree_path = action.payload.path;
    },
  },
});

export const { update_data, update_table, update_path_and_sub_tree } =
  db_viz_slice.actions;

export const select_db_viz_data = (state: RootState) => state.db_viz_data.value;

export default db_viz_slice.reducer;
