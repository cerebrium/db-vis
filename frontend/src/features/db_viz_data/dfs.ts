import type { ColumnSchema, DBDetails } from "../../types";

export type DFSRes = [ColumnSchema, Array<[string, string | null]>];
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
 * @returns [subtree: WritableDraft<ColumnSchema>, [path: [string, string]] // path is 'column name', id
 *
 */
export function find_subtree(state: DBDetails, id: string): DFSRes | null {
  // Table names are unique, so we can just traverse down from the root
  const path: Array<[string, string | null]> = [];
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

  // Innefficient to use unshift. But this array's length
  // should never be significantly large enough to matter.
  path.unshift(["res_users", null]);

  return [subtree!, path];
}

function dfs_helper(
  curr_node: ColumnSchema,
  id: string,
  path: Array<[string, string | null]>,
  visited: Set<string>,
): null | ColumnSchema {
  // Pre
  if (curr_node.id === id) {
    path.push([curr_node.column_name, curr_node.id]);
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

  path.push([curr_node.column_name, curr_node.id]);

  // Recurse
  for (let i = 0; i < curr_node.children.length; i++) {
    const found_node = dfs_helper(curr_node.children[i], id, path, visited);
    if (found_node) {
      return found_node;
    }
  }

  // Post
  path.pop();

  return null;
}
