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
  sub_node_radius: number = 20;
  top_sorted_groupings: string[] = [];

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

     TODO:
      1. Top sort the adj_list, create our ordering of nodes 
      2. Reconfigure the x,y coordinates of the groups to be 
      in the top order, decending from [0, 0]
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

    // Create the top sort
    this.top_sort_node_groupings(this.data[0].table);

    // Recofigure the middles
    this.rework_middles_of_nodes();
  }

  private rework_middles_of_nodes() {
    for (let i = 0; i < this.top_sorted_groupings.length; i++) {}
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
