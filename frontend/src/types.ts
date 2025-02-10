export type ColumnSchema = {
  column_name: string;
  data_type: string;
  is_nullable: string;
  references_another_table: boolean;
  referenced_table_name?: string | null; // Optional and can be null
  children?: ColumnSchema[]; // Optional recursive array of ColumnSchema
  table: string;
  id: string;
};

export type DBDetails = {
  name: string;
  table: string;
  isSchema: boolean;
  userName: string;
  visitedTables: string[];
  schema: ColumnSchema[];
};
