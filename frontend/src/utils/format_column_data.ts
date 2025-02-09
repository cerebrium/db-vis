import { ColumnSchema } from "../App";

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

export type ColumnSchemaAdjList = Map<string, [string, FlowNode[], string][]>;

export class GraphData {
  data: ColumnSchema[];
  adj_list: ColumnSchemaAdjList;
  parent_list: FlowNode[] = [];
  groupings: Map<
    string,
    {
      nodes: number;
      group_radius: number;
      middle: [number, number]; // x, y coordinates of the center of the group
    }
  > = new Map();
  sub_node_radius: number = 40;
  sub_node_spacing: number = this.sub_node_radius * 2 + 20;
  top_sorted_groupings: string[] = [];
  sub_node_gap: number = 150;

  constructor(data: ColumnSchema[]) {
    this.data = data;

    if (!this.data.length) {
      throw new Error("There is no data");
    }

    this.adj_list = this.create_adj_list();

    if (!this.adj_list) {
      throw new Error();
    }

    this.init();
  }

  private init() {
    /*

      1. Top sort the adj_list, create our ordering of nodes -> this is not done 
      becuase when I did it, i realized that i think its is redundant. but leaving 
      it in because when I thought of it, it seemed correct.

      2. Reconfigure the x,y coordinates of the groups to be 
      in the top order, decending from [0, 0]

     TODO:
      3. Loop through each node in the group and arrange their 
      centers to be equadistant from the center of the group. 
      And in alternating groupings of 4 around the center.

      4. Create the edges. 
        - there should be id's of the nodes that connect to the 
        other groupings. As the third argument in the tuples in 
        the adj_list

      5. loop through all the nodes and write them to the final 
      nodes array. 
      6. Return the nodes and edges
     
     */

    // 2. Recofigure the middles
    this.rework_middles_of_nodes();
  }

  private rework_middles_of_nodes() {
    /*
     
     We want to walk from the beggining to the end of the top sort. 
     But, we want to establish node precedence based on children, in 
     that way we can place the nodes that need to come next based 
     relatively on their parent.
    
    */
    let node_que_idx = 0;
    const node_que = [this.data[0].table];

    // Make the first grouping
    const root_node = this.groupings.get(node_que[0])!;
    const roo_x_y =
      Math.floor(root_node.nodes / 4) * this.sub_node_spacing + 20;
    root_node.middle = [roo_x_y, roo_x_y];

    while (node_que_idx < node_que.length) {
      const parent_node = node_que[node_que_idx];
      const children = this.adj_list.get(parent_node);
      const parent = this.groupings.get(parent_node)!;

      if (!children || !children.length) {
        node_que_idx++;
        continue;
      }

      // For these on each one we eant to make a spanning effect.
      // We can start in the middle, then go left and right.
      //
      // If there are more than a couple children this breaks.
      //
      //TODO: make the fanning work for multiple nodes (increase the gap)
      for (let i = 0; i < children.length; i++) {
        const [child, _, __] = children[i];

        const child_node = this.groupings.get(child)!;

        // This should always exist because we add empty nodes
        // to the adjacency list
        if (!child_node) {
          throw new Error("Child node does not exist");
        }

        child_node.middle = this.find_correct_spacing(i, parent, child_node);

        node_que.push(child);
      }
    }
  }

  private get_subnode_centers(
    middle: [number, number],
    idx: number,
  ): [
    [number, number],
    [number, number],
    [number, number],
    [number, number],
    [number, number],
    [number, number],
    [number, number],
    [number, number],
  ] {
    const child_centers: [
      [number, number],
      [number, number],
      [number, number],
      [number, number],
      [number, number],
      [number, number],
      [number, number],
      [number, number],
    ] = [
      [0, 0],
      [0, 0],
      [0, 0],
      [0, 0],
      [0, 0],
      [0, 0],
      [0, 0],
      [0, 0],
    ];

    const [x, y] = middle;

    // We will go top, right, bottom, left
    child_centers[0] = [x, y - this.sub_node_spacing * idx]; // top
    child_centers[1] = [x + this.sub_node_spacing * idx, y]; // right
    child_centers[2] = [x, y + this.sub_node_spacing * idx]; // bottom
    child_centers[3] = [x - this.sub_node_spacing * idx, y]; // left

    // Diagonals
    child_centers[4] = [child_centers[0][0], child_centers[1][1]];
    child_centers[5] = [child_centers[2][0], child_centers[1][1]];
    child_centers[6] = [child_centers[2][0], child_centers[3][1]];
    child_centers[7] = [child_centers[0][0], child_centers[3][1]];

    return child_centers;
  }

  private find_correct_spacing(
    idx: number,
    parent: {
      nodes: number;
      group_radius: number;
      middle: [number, number];
    },
    child: {
      nodes: number;
      group_radius: number;
      middle: [number, number];
    },
  ): [number, number] {
    const middles = [1, 4, 7];
    const lefts = [2, 5, 8];
    // const rights = [3, 6, 9]; for posterity

    if (middles.includes(idx)) {
      const x_y =
        parent.middle[0] +
        this.sub_node_gap +
        parent.group_radius +
        child.group_radius;

      return [x_y, x_y];
    }

    if (lefts.includes(idx)) {
      // left
      const x = parent.middle[0] + 10; // Match the parent x

      const y =
        parent.middle[1] +
        this.sub_node_gap +
        parent.group_radius +
        child.group_radius;

      return [x, y];
    }

    // right
    const y = parent.middle[1] + 10; // Match the parent x

    const x =
      parent.middle[0] +
      this.sub_node_gap +
      parent.group_radius +
      child.group_radius;

    return [x, y];
  }

  /*

    This only works if there aren't circular references. There cannot 
    be because we handled that on the backend, therefore this is a 
    DAG.

   */
  private top_sort_node_groupings(curr_node: string) {
    // We want to start at the table that was queried

    const children = this.adj_list.get(curr_node);
    if (!children) {
      this.top_sorted_groupings.push(curr_node);
      return;
    }

    for (const [child, _, __] of children) {
      this.top_sort_node_groupings(child);
    }

    this.top_sorted_groupings.push(curr_node);
  }

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

    adj_list.set(this.data[0].table, []);

    for (let i = 0; i < this.data.length; i++) {
      const new_node = {
        id: `${this.data[i].table}_${i}`,
        data: { label: `${this.data[i].column_name}` },
        position: { x: 0, y: 0 },
      };

      this.parent_list.push(new_node);

      if (this.data[i].children && this.data[i].children!.length > 0) {
        const curr_list = adj_list.get(this.data[i].table)!;

        // Pre set the initial child of this so that we can have a count
        // at the end of the number of nodes.
        adj_list.set(this.data[i].children![0].table, []);

        curr_list.push([
          this.data[i].children![0].table,
          this.create_adj_list_helper(
            adj_list,
            this.data[i].children!,
            this.data[i].children![0].table,
          ),
          `${new_node.id}++${this.data[i].children![0].table}_0`,
        ]);
      }
    }

    return adj_list;
  }

  private create_adj_list_helper(
    adj_list: ColumnSchemaAdjList,
    columns: ColumnSchema[],
    table_name: string,
  ): FlowNode[] {
    const flow_nodes: FlowNode[] = [];

    for (let i = 0; i < columns.length; i++) {
      const new_node = {
        id: `${table_name}_${i}`,
        data: { label: `${this.data[i].column_name}` },
        position: { x: 0, y: 0 },
      };

      flow_nodes.push(new_node);

      if (columns[i].children && columns[i].children!.length > 0) {
        const curr_list = adj_list.get(columns[i].table)!;

        // Before looking at more children add this ones label
        // to the set as a parent
        adj_list.set(columns[i].children![0].table, []);

        curr_list.push([
          columns[i].children![0].table,
          this.create_adj_list_helper(
            adj_list,
            columns[i].children!,
            columns[i].children![0].table,
          ),
          `${new_node.id}++${columns[i].children![0].table}_0`,
        ]);

        adj_list.set(columns[i].table, curr_list);
      }
    }

    this.groupings.set(table_name, {
      nodes: flow_nodes.length,
      group_radius: Math.floor(flow_nodes.length / 4) * this.sub_node_radius,
      middle: [0, 0], // We will top sort then create these
    });

    return flow_nodes;
  }
}
