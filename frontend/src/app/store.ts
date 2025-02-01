import { configureStore } from "@reduxjs/toolkit";
import db_viz_slice from "../features/db_viz_data/db_viz_slice";

export const store = configureStore({
  reducer: {
    db_viz_data: db_viz_slice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
