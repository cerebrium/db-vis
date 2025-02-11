import { configureStore, createListenerMiddleware } from "@reduxjs/toolkit";
import db_viz_slice, {
  update_table,
  update_path_and_sub_tree,
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

    listenerApi.dispatch(update_path_and_sub_tree({ path, subtree }));
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
