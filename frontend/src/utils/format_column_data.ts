import type { ColumnSchema, DBDetails } from "../types";

/*
 *
 * FILE NOT IN USE at the moment. Will be making a graph
 * view later for a nice visualization, but right now is
 * just a wip. Focusing on the table view.
 *
 */

export type ColumnSchemaAdjList = Map<string, string[]>;

export type DrawableShape = {
  label: string;
  x: number;
  y: number;
};

export class GraphData {
  adj_list: ColumnSchemaAdjList;
  number_of_nodes: number = 0;
  max_width: number;
  max_height: number;
  canvas: CanvasRenderingContext2D;
  root: string;
  usedColors: Set<string> = new Set();
  drawable_shapes: null = null;

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
      this.adj_list = this.create_adj_list([...data.schema]);
    } else {
      // We can only ever allow a ColumnSchema with children
      if (!data.children) {
        throw new Error("The data has no children. Invalid graph view");
      }

      this.adj_list = this.create_adj_list([...data.children]);
    }

    this.number_of_nodes = this.adj_list.size;

    // We can space the nodes based on the screen size
    // and the number of overall nodes.

    if (!this.adj_list) {
      throw new Error();
    }

    // Draw the nodes
    this.draw_canvas_nodes();
  }

  // Chat gpt function here... going to use it to generate colors
  // that are slight variants of the lightseagreen to then color
  // code parent-child relationship
  // TODO: make private after use
  public getColorVariant(baseColor: string = "#20B2AA"): string {
    let variant: string;
    do {
      // Extract RGB from hex
      const r = parseInt(baseColor.substring(1, 3), 16);
      const g = parseInt(baseColor.substring(3, 5), 16);
      const b = parseInt(baseColor.substring(5, 7), 16);

      // Apply slight variation within a safe range
      const newR = Math.min(255, Math.max(0, r + (Math.random() * 20 - 10)));
      const newG = Math.min(255, Math.max(0, g + (Math.random() * 20 - 10)));
      const newB = Math.min(255, Math.max(0, b + (Math.random() * 20 - 10)));

      // Convert back to hex
      variant =
        `#${Math.round(newR).toString(16).padStart(2, "0")}` +
        `${Math.round(newG).toString(16).padStart(2, "0")}` +
        `${Math.round(newB).toString(16).padStart(2, "0")}`;
    } while (this.usedColors.has(variant)); // Ensure uniqueness

    this.usedColors.add(variant);
    return variant;
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
    const x_spacing = Math.floor(this.max_width / (max_width * 1.2));
    const radius = Math.floor(10);
    const middle = Math.floor(this.max_width / 2);

    /*
      
      We want to start with the middle node. If even we go left and right. 
      If odd we do the same. 

      x = the offset from center is (max_widht / 2) +/- (row_node_length / max_width) +/- idx (from middle)
      y = row * y_spacing 

    */

    this.canvas.fillStyle = "lightseagreen";

    let prev_nodes: Array<[number, number]> = [];
    let curr_nodes: Array<[number, number]> = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const y = i === 0 ? y_spacing * 0.2 : y_spacing * ((i + 1) * 0.7);
      let x = 0;

      let written_nodes = 0;
      const row_middle = Math.floor(rows[i].length / 2);
      let curr_node = Math.floor(rows[i].length / 2) - 1;

      // keep a ref to the previous array's x and y

      prev_nodes = curr_nodes;
      curr_nodes = new Array(rows[i].length);

      // TODO: ugly code, think of a better way to do this
      while (written_nodes < row.length) {
        let local_y = y;
        if (i !== 0) {
          if (written_nodes % 2 === 0) {
            local_y = y - Math.floor(y_spacing / 5);
          } else {
            local_y = y + Math.floor(y_spacing / 5);
          }
        }

        if (curr_node < row_middle) {
          x = middle - (row_middle - curr_node) * x_spacing;

          // TODO: see if this can be more optimized
          this.canvas.beginPath();
          this.canvas.arc(x, local_y, radius, 0, Math.PI * 2);
          this.canvas.fill();

          curr_nodes[written_nodes] = [x, local_y];
        } else {
          x = middle + (curr_node - row_middle) * x_spacing;

          // TODO: see if this can be more optimized
          this.canvas.beginPath();
          this.canvas.arc(x, local_y, radius, 0, Math.PI * 2);
          this.canvas.fill();

          curr_nodes[written_nodes] = [x, local_y];
        }

        // Write the connection to parent node
        if (i > 0) {
          let q = row[written_nodes].length;
          while (q > 0) {
            if (row[written_nodes][q] === "+") {
              break;
            }
            q--;
          }

          const parent_idx = rows[i - 1].indexOf(
            row[written_nodes].substring(0, q),
          );

          const [p_x, p_y] = prev_nodes[parent_idx];
          const [x, y] = curr_nodes[written_nodes];

          if (!p_x || !p_y || !x || !y) {
            throw new Error("Could not find parent: " + p_x + p_y + x + y);
          }

          // Draw from previous to current
          const cx = p_x,
            cy = y;

          this.canvas.beginPath();
          this.canvas.moveTo(p_x, p_y);
          this.canvas.quadraticCurveTo(cx, cy, x, y);
          this.canvas.strokeStyle = "lightseagreen"; // Change the curve color
          this.canvas.stroke();
        }

        if (curr_node === 0) {
          // TODO: might be an off by one issue here
          curr_node = Math.floor(rows[i].length / 2) + 1;
        } else if (curr_node < row_middle) {
          curr_node--;
        } else {
          curr_node++;
        }

        written_nodes++;
      }
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

      if (next_column.length) {
        que.push(next_column);
        rows.push(next_column);
      }

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
   *
   */
  private create_adj_list(data: ColumnSchema[]): ColumnSchemaAdjList {
    const adj_list: ColumnSchemaAdjList = new Map();

    const child_nodes: string[] = [];

    for (let i = 0; i < data.length; i++) {
      // Only looking at nodes with children, or the child
      if (!data[i].children || !data[i].references_another_table) {
        continue;
      }

      child_nodes.push(this.root + "+" + data[i].column_name);

      this.create_adj_list_helper(adj_list, data[i], this.root);
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

    let local_prefix = prefix + "+" + curr_node.column_name;

    if (!curr_node.children) {
      throw new Error("Does not have children");
    }

    for (let i = 0; i < curr_node.children.length; i++) {
      if (
        !curr_node.children[i].children ||
        !curr_node.children[i].references_another_table
      ) {
        continue;
      }

      child_nodes.push(local_prefix + "+" + curr_node.children[i].column_name);

      this.create_adj_list_helper(
        adj_list,
        curr_node.children![i],
        local_prefix,
      );
    }

    adj_list.set(local_prefix, child_nodes);
  }
}
