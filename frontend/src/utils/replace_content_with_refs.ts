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
    if (data.schema[i].column_name === data.table) {
      continue;
    }

    if (!data.schema[i].referenced_table_name) {
      continue;
    }

    const ref_val = nested_ref_map.get(data.schema[i].referenced_table_name!);
    if (!data.schema[i].children && ref_val) {
      replace_nested_nodes(
        [data.table],
        data.schema[i],
        nested_ref_map,
        ref_val,
      );
    }
  }

  // FIXME: this is terrible and innefficient. Find a better way to do this
  // The passing once all are done isn't so bad, its the overall strategy
  // here that seems non-ideal. Using just references instead of
  // structuredClone doesn't work, because of the id's the subtree view
  // (If you run it and then click in a sub-node on the tooltip zoom in)
  // it finds the first available path to that table, not the one clicked.
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

// This is still a wildly innefficient way of solving this problem. We would
// like to not have to replace the id's. We are cloning objects in the structuredClone
// call in replace_nested_nodes. For viewing subtrees we need to ensure that
// all id's are unique. Iterative > recursive for this, but not existing is
// better.
function give_new_ids(curr_node: DBDetails): void {
  const que: ColumnSchema[] = [...curr_node.schema];
  let current_q_idx: number = 0;
  const used_ids: Set<string> = new Set();

  while (current_q_idx < que.length) {
    if (used_ids.has(que[current_q_idx].id)) {
      que[current_q_idx].id = uuidv4();

      if (que[current_q_idx].children) {
        for (const child of que[current_q_idx].children!) {
          que.push(child);
        }
      }

      current_q_idx++;
      continue;
    }

    used_ids.add(que[current_q_idx].id);

    if (que[current_q_idx].children) {
      for (const child of que[current_q_idx].children!) {
        que.push(child);
      }
    }
    current_q_idx++;
  }
}
