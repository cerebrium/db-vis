import { useAppSelector } from "../../app/hooks.ts";
import type { ColumnSchema, DBDetails } from "../../types.ts";

export type UseDbVizDataMethodsReturn = [
  ColumnSchema | (DBDetails | null),
  Array<[string, string | null]> | null,
];

export function useDbVizDataMethods(): UseDbVizDataMethodsReturn {
  const db_viz_data = useAppSelector((state) => {
    if (!state.db_viz_data.current_sub_tree) {
      return [state.db_viz_data.value, null];
    }

    return [
      state.db_viz_data.current_sub_tree,
      state.db_viz_data.current_sub_tree_path,
    ];
  });

  // TODO: Fix this type
  // @ts-ignore -> For now, this is being odd
  return db_viz_data;
}
