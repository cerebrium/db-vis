import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";
import type { DBDetails } from "../../types";

// Define a type for the slice state
export interface CounterState {
  value: DBDetails | null;
}

type SelectSubtree = {
  table: string;
};

// Define the initial state using that type
const initialState: CounterState = {
  value: null,
};

export const db_viz_slice = createSlice({
  name: "db_viz_data",
  initialState,
  reducers: {
    // Use the PayloadAction type to declare the contents of `action.payload`
    update_data: (state, action: PayloadAction<DBDetails>) => {
      state.value = action.payload;
    },
  },
});

export const { update_data } = db_viz_slice.actions;

export const select_db_viz_data = (state: RootState) => state.db_viz_data.value;

export default db_viz_slice.reducer;
