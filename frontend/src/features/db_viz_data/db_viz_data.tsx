import { useAppSelector } from "../../app/hooks.ts";
import { find_subtree } from "./dfs.ts";

export function useDbVizDataMethods(table: string | null) {
  if (table) {
    const subtree = useAppSelector(
      (state) => find_subtree(state.db_viz_data.value!, table), // We can assume there is state, since this is only for on-click subtree
    );

    if (!subtree) {
      const db_viz_data = useAppSelector((state) => state.db_viz_data.value);

      return [db_viz_data];
    }

    return subtree;
  } else {
    const db_viz_data = useAppSelector((state) => state.db_viz_data.value);

    return [db_viz_data];
  }
}
