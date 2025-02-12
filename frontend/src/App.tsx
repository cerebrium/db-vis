import { Rows } from "./components/rows";
import { useDbVizData } from "./features/db_viz_data/db_viz_hook";
import { useDbVizDataMethods } from "./features/db_viz_data/db_viz_data";
import { DetailDisplay } from "./components/detail_display";
import { MainView } from "./components/main_view";
import { useState, useEffect } from "react";
import type { ColumnSchema } from "./types";
import { useDispatch } from "react-redux";
import { update_table } from "./features/db_viz_data/db_viz_slice";

function App() {
  const [db, setDb] = useState("");

  const dispatch = useDispatch();
  // Set up the websocket
  useDbVizData();

  const [data, path] = useDbVizDataMethods();

  useEffect(() => {
    if (!data) {
      return;
    }

    if ("schema" in data) {
      if (data) {
        setDb(() => data.name);
      }
    }
  }, [data]);

  if (!data) {
    return (
      <main className="main">
        <div>Loading...</div>
      </main>
    );
  }

  if ("schema" in data) {
    return (
      <main className="main">
        <h1>
          Displaying DB: {data.name}
          <span className="reset">
            <button>reset</button>
          </span>
        </h1>
        <MainView data={data} />
      </main>
    );
  }

  const reset_to_main = () => {
    dispatch(update_table({ id: "" }));
  };

  const set_breadcrumb_id = (
    e: React.MouseEvent<HTMLSpanElement>,
    id: string | null,
  ) => {
    e.stopPropagation();
    e.preventDefault();

    if (!id) {
      reset_to_main();
      return;
    }

    dispatch(update_table({ id: id }));
  };

  // We want to make coherent tables, seperate the non-nested from the nested
  const [non_nested, nested]: [ColumnSchema[], ColumnSchema[]] = [[], []];
  for (let i = 0; i < data.children!.length; i++) {
    if (data.children![i].children) {
      nested.push(data.children![i]);
      continue;
    }

    non_nested.push(data.children![i]);
  }

  // Subtree
  return (
    <main className="main">
      <h1>
        Displaying DB: {db}{" "}
        <span className="reset">
          <button onClick={reset_to_main}>reset</button>
        </span>
      </h1>
      <h2 className="path_container">
        {path
          ? path.map((val, i) => {
              const end_char = i !== path.length - 1 ? "/" : "";

              const name = val[0];
              const id = val[1];

              return (
                <span
                  onClick={(e) => set_breadcrumb_id(e, id)}
                  className="breadcrumb"
                >
                  {name
                    .split("_")
                    .map((v, _) =>
                      v
                        .split("")
                        .map((v, i) => (i === 0 ? v.toLocaleUpperCase() : v))
                        .join(""),
                    )
                    .join(" ")}{" "}
                  <span className="slash">{end_char}</span>{" "}
                </span>
              );
            })
          : ""}
      </h2>
      <div className="chart_container">
        <section className="nested_children">
          <section className="nested_data">
            {nested.map((el) => {
              return (
                <details key={`${el.id}`}>
                  <summary>
                    {el.column_name.split("_").join(" ").toLocaleUpperCase()}
                  </summary>
                  <Rows col={el.children!} />
                </details>
              );
            })}

            <table>
              <thead>
                <tr>
                  <th>column Name</th>
                  <th>Data Type</th>
                  <th>Is Nullable</th>
                </tr>
              </thead>
              <tbody>
                {non_nested.map((el) => {
                  return (
                    <DetailDisplay
                      column_name={el.column_name}
                      data_type={el.data_type}
                      is_nullable={el.is_nullable}
                      key={`${el.id}`}
                    />
                  );
                })}
              </tbody>
            </table>
          </section>
        </section>
      </div>
    </main>
  );
}

export default App;
