import { ReactFlow } from "@xyflow/react";
import { ColumnSchema } from "../App";
import { format_column_data_for_graph_representation } from "../utils/format_column_data";

export type ReactFlowComponentProps = {
  data: ColumnSchema[];
};

export const ReactFlowComponent: React.FC<ReactFlowComponentProps> = ({
  data,
}) => {
  const formatted_data = format_column_data_for_graph_representation(data);
  return <ReactFlow />;
};
