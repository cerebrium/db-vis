import { useAppSelector } from "../../app/hooks.ts";

export function useDbVizDataMethods() {
  const db_viz_data = useAppSelector((state) => state.db_viz_data.value);

  return [db_viz_data];
}
