import { createListenerMiddleware, createSlice } from "@reduxjs/toolkit";
import { find_subtree } from "./dfs";

import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";
import type { ColumnSchema, DBDetails } from "../../types";

// Define a type for the slice state
export interface CounterState {
  value: DBDetails | null;
  nested_id: string | null;
  current_sub_tree: ColumnSchema | null;
  current_sub_tree_path: null | string[];
}

export type UpdateFieldPayload = { id: string };

// Define the initial state using that type
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
    // Use the PayloadAction type to declare the contents of `action.payload`
    update_data: (state, action: PayloadAction<DBDetails>) => {
      state.value = action.payload;
    },
    update_table: (state, action: PayloadAction<UpdateFieldPayload>) => {
      state.nested_id = action.payload.id;
    },
  },
});

const listenerMiddleware = createListenerMiddleware();
listenerMiddleware.startListening({
  actionCreator: db_viz_slice.actions.update_table,
  effect: (action, listenerApi) => {
    const state = listenerApi.getState() as CounterState;
    if (!state.value || action.payload.id) {
      return;
    }
    // We want to find the nested subtree
    const res = find_subtree(state.value!, action.payload.id);
    if (!res) {
      return;
    }

    const [subtree, path] = res;

    state.current_sub_tree = subtree;
    state.current_sub_tree_path = path;
  },
});

export const { update_data } = db_viz_slice.actions;

export const select_db_viz_data = (state: RootState) => state.db_viz_data.value;

export default db_viz_slice.reducer;
