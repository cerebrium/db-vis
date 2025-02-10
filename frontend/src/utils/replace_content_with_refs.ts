import type { ColumnSchema, DBDetails } from "../types";

/**
 *
 * The backend will not allow for the same table to be parsed twice.
 * If we make the references to the same table, then there are circular
 * issues. Instead, we will do a once through here, and add all nodes
 * with children to a map, then replace nodes that aren't the correct
 * foreign keys with the nested structures.
 *
 * This mutates in place
 *
 */
export function replace_content_with_refs(data: DBDetails): void {
  let que = [...data.schema];
  let curr_q_idx: number = 0;

  const nested_ref_map: Map<string, ColumnSchema> = new Map();

  while (curr_q_idx < que.length) {
    const val = que[curr_q_idx];

    const ref = nested_ref_map.get(val.column_name);

    if (!ref && val.children) {
      nested_ref_map.set(val.table, val);

      que = [...que, ...val.children];

      curr_q_idx++;
      continue;
    }

    curr_q_idx++;
  }

  // Create a list of all the possible nodes

  const all_nodes: ColumnSchema[] = [];
  get_all_nodes(data, all_nodes);

  // With all nodes, replace those that should have children
  for (let i = 0; i < all_nodes.length; i++) {
    const ref = nested_ref_map.get(all_nodes[i].column_name);

    if (ref && !all_nodes[i].children) {
      all_nodes[i] = ref;
    }
  }

  // data.schema = all_nodes;
  console.log("is finished: ", nested_ref_map);
}

function get_all_nodes(data: DBDetails, all_nodes: ColumnSchema[]) {
  for (let i = 0; i < data.schema.length; i++) {
    all_nodes.push(data.schema[i]);

    if (data.schema[i].children) {
      get_all_nodes_helper(data.schema[i], all_nodes);
    }
  }
}

function get_all_nodes_helper(
  data: ColumnSchema,
  all_nodes: ColumnSchema[],
): void {
  for (let i = 0; i < data.children!.length; i++) {
    all_nodes.push(data.children![i]);

    if (data.children![i].children) {
      get_all_nodes_helper(data.children![i], all_nodes);
    }
  }
}
