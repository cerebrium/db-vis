import type { ColumnSchema, DBDetails } from "../types";
import { v4 as uuidv4 } from "uuid";

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
  // Don't want to mutate yet
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

  // Mutate now
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

  // FIXME: this is terrible and innefficient. Find a better way to do this
  console.log("triggering review?");
  give_new_ids(data);
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

  // We are making references to the same underlying objects
  // here. This is leading to the id's being duplicated, and
  // trying to just update the id's is updating the underlying
  // val.
  // FIXME: this is the root of the id problem
  curr_node.children = structuredClone(replacment.children!);

  // We have to give everything that is nested here new ids

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

function give_new_ids(curr_node: DBDetails) {
  for (let i = 0; i < curr_node.schema.length; i++) {
    give_new_ids_helper(curr_node.schema, curr_node.schema[i], i);
  }
}

function give_new_ids_helper(
  parent_arr: ColumnSchema[],
  curr_node: ColumnSchema,
  idx: number,
) {
  parent_arr[idx].id = uuidv4();
  if (curr_node.children) {
    for (let i = 0; i < curr_node.children.length; i++) {
      give_new_ids_helper(curr_node.children, curr_node.children[i], i);
    }
  }
}
