import "./App.css";
import { Rows } from "./components/rows";
import { useDbVizData } from "./features/db_viz_data/db_viz_hook";
import { useDbVizDataMethods } from "./features/db_viz_data/db_viz_data";
import { DetailDisplay } from "./components/detail_display";

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
      <h1>Displaying DB: {data.name}</h1>
      <div className="chart_container">
        <details>
          <summary>
            {data.table.split("_").join(" ").toLocaleUpperCase()}
          </summary>
          {data.schema.map((el) => {
            if (el.children) {
              return (
                <details>
                  <summary>
                    {el.column_name.split("_").join(" ").toLocaleUpperCase()}
                  </summary>
                  <Rows col={el.children} />
                </details>
              );
            } else {
              return (
                <DetailDisplay
                  column_name={el.column_name}
                  data_type={el.data_type}
                  is_nullable={el.is_nullable}
                />
              );
            }
          })}
        </details>
      </div>
    </main>
  );
}

export default App;
