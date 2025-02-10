import { ReactFlow } from "@xyflow/react";
import { GraphData } from "../utils/format_column_data";
import type { ColumnSchema } from "../types";

export type ReactFlowComponentProps = {
  data: ColumnSchema[];
};

export const ReactFlowComponent: React.FC<ReactFlowComponentProps> = ({
  data,
}) => {
  new GraphData(data);
  return <ReactFlow />;
};
