import { useEffect, useState } from "react";
import "./App.css";
import { get } from "./requests/get";
import { Rows } from "./components/rows";

export type ColumnSchema = {
  column_name: string;
  data_type: string;
  is_nullable: string;
  references_another_table: boolean;
  referenced_table_name?: string | null; // Optional and can be null
  children?: ColumnSchema[]; // Optional recursive array of ColumnSchema
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
  const [data, setData] = useState<DBDetails | null>(null);

  useEffect(() => {
    get("get_data").then((res) => {
      if (res) {
        setData(res);
        console.log("what is the res: ", res);
      }
    });
  }, []);

  if (!data) return <div>Loading...</div>;
  return (
    <main className="main">
      <h3>Displaying DB: {data.name}</h3>
      <h4>Displaying DB: {data.table}</h4>
      <ul>
        {data.schema.map((el) => {
          console.log("what is the el: ", el);
          return <Rows col={el} />;
        })}
      </ul>
    </main>
  );
}

export default App;
