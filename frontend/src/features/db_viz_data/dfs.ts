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

  for (let i = 0; i < state.schema.length; i++) {
    if (!state.schema[i].children) {
      continue;
    }

    dfs_helper(state.schema[i], id, path, subtree);
  }

  if (!path.length || !subtree) {
    return null;
  }

  return [subtree!, path];
}

function dfs_helper(
  curr_node: ColumnSchema,
  id: string,
  path: string[],
  subtree: null | ColumnSchema,
): boolean {
  // pre
  path.push(curr_node.table);

  if (curr_node.id === id) {
    subtree = curr_node;
    return true;
  }

  // If not the node we are looking for, and is a terminal
  // than remove from the path
  if (!curr_node.children) {
    return false;
  }

  for (let i = 0; i < curr_node.children.length; i++) {
    if (dfs_helper(curr_node.children[i], id, path, subtree)) {
      return true;
    }
  }

  path.pop();
  return false;
}
