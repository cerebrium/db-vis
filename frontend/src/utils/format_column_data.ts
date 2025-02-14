import type { ColumnSchema, DBDetails } from "../types";

/*
 *
 * FILE NOT IN USE at the moment. Will be making a graph
 * view later for a nice visualization, but right now is
 * just a wip. Focusing on the table view.
 *
 */
export type FlowNode = {
  id: string;
  type?: string;
  data: { label: string };
  position: { x: number; y: number };
};

export type Edge = {
  id: string;
  source: string;
  target: string;
};

export type ColumnSchemaAdjList = Map<string, string[]>;

export class GraphData {
  data: ColumnSchema[];
  adj_list: ColumnSchemaAdjList;
  number_of_nodes: number = 0;
  max_width: number;
  max_height: number;
  canvas: CanvasRenderingContext2D;

  constructor(
    data: ColumnSchema | DBDetails,
    max_width: number,
    max_height: number,
    canvas: CanvasRenderingContext2D,
  ) {
    this.max_width = max_width;
    this.max_height = max_height;
    this.canvas = canvas;

    // Allows for subtree view or tree view
    if ("schema" in data) {
      this.data = [...data.schema];
    } else {
      // We can only ever allow a ColumnSchema with children
      if (!data.children) {
        throw new Error("The data has no children. Invalid graph view");
      }

      // Shallow copies, will need to shallow copy in adj list as well
      // for nesting
      this.data = [...data.children];
    }

    if (!this.data.length) {
      throw new Error("There is no data");
    }

    this.adj_list = this.create_adj_list();
    this.number_of_nodes = this.adj_list.size;

    // We can space the nodes based on the screen size
    // and the number of overall nodes.

    if (!this.adj_list) {
      throw new Error();
    }

    // Draw the nodes

    console.log("what is this", this);
  }

  private draw_canvas_nodes() {
    // We can go in columns based off the max width
  }

  private create_columns_to_write(): {};

  /**
   *
   * Loop over all the nodes, transform them into the shape for the
   * display library.
   *
   * We also create an adjacency list of tablename, [childTableName, FlowNode[]]
   *
   * The child nodes are all next to the refs in the adj_list, except
   * for the top level which is kept in the parent list.
   *
   * We have cases where in the backend we have not fetched circularly
   * referenced tables. The children array then does not exist, however
   * the 'references_another_table' does exist. This is perhaps information
   * that could be useful.
   *
   * TODO: Add a circular dependency check for the references another table
   * property.
   *
   */
  private create_adj_list(): ColumnSchemaAdjList {
    const adj_list: ColumnSchemaAdjList = new Map();

    const child_nodes: string[] = [];

    for (let i = 0; i < this.data.length; i++) {
      // Only looking at nodes with children, or the child
      if (!this.data[i].children || !this.data[i].references_another_table) {
        continue;
      }

      child_nodes.push(this.data[i].column_name);

      const visited: Set<string> = new Set();
      visited.add(this.data[0].table);

      this.create_adj_list_helper(adj_list, this.data[i], this.data[0].table);
    }

    adj_list.set(this.data[0].table, child_nodes);

    return adj_list;
  }

  private create_adj_list_helper(
    adj_list: ColumnSchemaAdjList,
    curr_node: ColumnSchema,
    prefix: string,
  ): void {
    // The node already exists, we are therefore nested in a different
    // parents tree. We need to now append the current_column_name
    // to the nodes name

    const child_nodes: string[] = [];

    for (let i = 0; i < curr_node.children!.length; i++) {
      if (
        !curr_node.children![i].children ||
        !curr_node.children![i].references_another_table
      ) {
        continue;
      }

      child_nodes.push(curr_node.children![i].column_name);

      this.create_adj_list_helper(
        adj_list,
        curr_node.children![i],
        prefix + curr_node.children![0].table,
      );
    }

    adj_list.set(prefix, child_nodes);
  }
}
