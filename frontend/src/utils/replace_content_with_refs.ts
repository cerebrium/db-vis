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

  // With all nodes, replace those that should have children
  // We need to do this df style, and check for back references.
  for (let i = 0; i < data.schema.length; i++) {
    if (data.schema[i].column_name === "res_users") {
      continue;
    }

    if (!data.schema[i].referenced_table_name) {
      continue;
    }

    const ref_val = nested_ref_map.get(data.schema[i].referenced_table_name!);
    if (!data.schema[i].children && ref_val) {
      replace_nested_nodes(
        ["res_users"],
        data.schema[i],
        nested_ref_map,
        ref_val,
      );
    }
  }
}

function replace_nested_nodes(
  current_used_list: string[],
  curr_node: ColumnSchema,
  nested_ref_map: Map<string, ColumnSchema>,
  replacment: ColumnSchema,
): void {
  if (current_used_list.includes(curr_node.referenced_table_name!)) {
    return;
  }

  current_used_list.push(curr_node.referenced_table_name!);

  curr_node.children = replacment.children;

  const children = curr_node.children;
  if (!children) {
    return;
  }

  for (let i = 0; i < children.length; i++) {
    if (!children[i].referenced_table_name) {
      continue;
    }
    const ref_val = nested_ref_map.get(children[i].referenced_table_name!);
    if (!children[i].children && ref_val) {
      replace_nested_nodes(
        current_used_list,
        children[i],
        nested_ref_map,
        ref_val,
      );
    }
  }
}
