import type { ColumnSchema, DBDetails } from "../../types";

/**
 *
 * @param state WritableDraft<CounterState>
 * @param table string
 *
 * This will search the nested structure trying to find
 * the sub-tree that we want to adopt as the main tree.
 *
 * We will need to also return the path from where we
 * are to the node so that we can make breadcrumbs.
 *
 * @returns [subtree: WritableDraft<ColumnSchema>, [tables: string]]
 *
 */

export type DFSRes = [ColumnSchema, string[]];

export function find_subtree(state: DBDetails, id: string): DFSRes | null {
  // Table names are unique, so we can just traverse down from the root
  const path: string[] = [];
  let subtree: ColumnSchema | null = null;
  const visited: Set<string> = new Set();

  for (let i = 0; i < state.schema.length; i++) {
    if (!state.schema[i].references_another_table) {
      continue;
    }

    subtree = dfs_helper(state.schema[i], id, path, visited);
    if (subtree) {
      break;
    }
  }

  if (!path.length || !subtree) {
    return null;
  }

  path.unshift("res_users");

  return [subtree!, path];
}

function dfs_helper(
  curr_node: ColumnSchema,
  id: string,
  path: string[],
  visited: Set<string>,
): null | ColumnSchema {
  if (curr_node.id === id) {
    return curr_node;
  }

  if (visited.has(curr_node.id)) {
    return null;
  }

  visited.add(curr_node.id);

  if (!curr_node.references_another_table) {
    return null;
  }

  // If not the node we are looking for, and is a terminal
  // than remove from the path
  if (!curr_node.children) {
    return null;
  }

  // pre
  path.push(curr_node.column_name);

  for (let i = 0; i < curr_node.children.length; i++) {
    const found_node = dfs_helper(curr_node.children[i], id, path, visited);
    if (found_node) {
      return found_node;
    }
  }

  path.pop();

  return null;
}
