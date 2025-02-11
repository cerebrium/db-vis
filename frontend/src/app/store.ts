import { configureStore, createListenerMiddleware } from "@reduxjs/toolkit";
import type { CounterState } from "../features/db_viz_data/db_viz_slice";
import db_viz_slice, {
  update_table,
} from "../features/db_viz_data/db_viz_slice";
import { find_subtree } from "../features/db_viz_data/dfs";

const listenerMiddleware = createListenerMiddleware();

listenerMiddleware.startListening({
  actionCreator: update_table,
  effect: (action, listenerApi) => {
    const state = listenerApi.getState() as RootState;

    if (!state.db_viz_data.value || !action.payload.id) {
      return;
    }

    // We want to find the nested subtree
    const res = find_subtree(state.db_viz_data.value!, action.payload.id);
    if (!res) {
      return;
    }

    const [subtree, path] = res;

    console.log("subtree: ", subtree, "\n path: ", path);

    state.db_viz_data.current_sub_tree = subtree;
    state.db_viz_data.current_sub_tree_path = path;
  },
});

export const store = configureStore({
  reducer: {
    db_viz_data: db_viz_slice,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().prepend(listenerMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
