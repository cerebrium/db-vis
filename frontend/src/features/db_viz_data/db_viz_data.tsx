import { useAppSelector } from "../../app/hooks.ts";
import { find_subtree } from "./dfs.ts";

export function useDbVizDataMethods() {
  const db_viz_data = useAppSelector((state) => {
    if (!state.db_viz_data.current_sub_tree) {
      return state.db_viz_data.value;
    }

    return state.db_viz_data.current_sub_tree;
  });

  return [db_viz_data];
}
