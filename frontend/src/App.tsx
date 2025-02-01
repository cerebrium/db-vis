import "./App.css";
import { Rows } from "./components/rows";
import { useDbVizData } from "./features/db_viz_data/db_viz_hook";
import { useDbVizDataMethods } from "./features/db_viz_data/db_viz_data";

export type ColumnSchema = {
  column_name: string;
  data_type: string;
  is_nullable: string;
  references_another_table: boolean;
  referenced_table_name?: string | null; // Optional and can be null
  children?: ColumnSchema[]; // Optional recursive array of ColumnSchema
  table: string;
};

export type DBDetails = {
  name: string;
  table: string;
  isSchema: boolean;
  userName: string;
  visitedTables: string[];
  schema: ColumnSchema[];
};

function App() {
  // Set up the websocket
  useDbVizData();

  const [data, _, __] = useDbVizDataMethods();

  if (!data) return <div>Loading...</div>;
  return (
    <main className="main">
      <h3>Displaying DB: {data.name}</h3>
      <h4>Displaying DB: {data.table}</h4>
      <div className="chart_container">
        {data.schema.map((el) => {
          return <Rows col={el} />;
        })}
      </div>
    </main>
  );
}

export default App;
