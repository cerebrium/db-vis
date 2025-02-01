import { ReactFlow } from "@xyflow/react";
import { ColumnSchema } from "../App";
import { GraphData } from "../utils/format_column_data";

export type ReactFlowComponentProps = {
  data: ColumnSchema[];
};

export const ReactFlowComponent: React.FC<ReactFlowComponentProps> = ({
  data,
}) => {
  new GraphData(data);
  return <ReactFlow />;
};
