import { createSlice } from "@reduxjs/toolkit";

import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";
import type { ColumnSchema, DBDetails } from "../../types";

export interface CounterState {
  value: DBDetails | null;
  nested_id: string | null;
  current_sub_tree: ColumnSchema | null;
  current_sub_tree_path: null | string[];
}

export type UpdateFieldPayload = { id: string };

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
      console.log("update table being called: ", action);
      state.nested_id = action.payload.id;
    },
  },
});

export const { update_data, update_table } = db_viz_slice.actions;

export const select_db_viz_data = (state: RootState) => state.db_viz_data.value;

export default db_viz_slice.reducer;
