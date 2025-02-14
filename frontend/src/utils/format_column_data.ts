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
  root: string;

  constructor(
    data: ColumnSchema | DBDetails,
    max_width: number,
    max_height: number,
    canvas: CanvasRenderingContext2D,
  ) {
    this.max_width = max_width;
    this.max_height = max_height;
    this.canvas = canvas;

    this.root = data.table;

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

    this.draw_canvas_nodes();
  }

  private draw_canvas_nodes() {
    // We can go in columns based off the max width
    const rows = this.create_rows_to_write();

    /*
     
      Go to the middle (x) of the page. Start with the parent
      node. Then fan out by a set distance based off the largest
      set of children

     */

    const height = rows.length;
    let max_width = 0;

    for (const row of rows) {
      max_width = Math.max(max_width, row.length);
    }

    const y_spacing = Math.floor(this.max_height / height);
    const x_spacing = Math.floor(this.max_width / max_width);
    const radius = Math.floor(x_spacing / 3);

    const middle = Math.floor(this.max_width / 2);

    let current_x = 1;
    let row_idx = 1;

    for (const row of rows) {
      for (const item of row) {
        this.canvas.fillRect(
          current_x * x_spacing,
          row_idx * y_spacing,
          radius,
          radius,
        );
      }

      current_x = 1;
    }
  }

  private create_rows_to_write(): Array<string[]> {
    const rows: Array<string[]> = [[]];
    if (!this.adj_list?.size) {
      return rows;
    }

    const top_level = this.adj_list.get(this.root);

    if (!top_level) {
      return rows;
    }

    const que: string[][] = [[]];
    let curr_q_idx: number = 0;

    for (let i = 0; i < top_level.length; i++) {
      que[0].push(top_level[i]);
      rows[0].push(top_level[i]);
    }

    // Loop through and get all decendents in a breadth first search
    while (curr_q_idx < que.length) {
      const next_column: string[] = [];
      const current_column = que[curr_q_idx];

      for (let i = 0; i < current_column.length; i++) {
        const has_children = this.adj_list.get(current_column[i])!;
        if (has_children.length) {
          for (const child of has_children) {
            next_column.push(child);
          }
        }
      }

      que.push(next_column);
      rows.push(next_column);

      curr_q_idx++;
    }

    return rows;
  }

  /**
   *
   * Loop over all sthe nodes, transform them into the shape for the
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

    adj_list.set(this.root, child_nodes);

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
