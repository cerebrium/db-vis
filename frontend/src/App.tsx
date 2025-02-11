import { Rows } from "./components/rows";
import { useDbVizData } from "./features/db_viz_data/db_viz_hook";
import { useDbVizDataMethods } from "./features/db_viz_data/db_viz_data";
import { DetailDisplay } from "./components/detail_display";
import { MainView } from "./components/main_view";

function App() {
  // Set up the websocket
  useDbVizData();

  const [data] = useDbVizDataMethods();

  if (!data)
    return (
      <main className="main">
        <div>Loading...</div>
      </main>
    );

  if ("schema" in data) {
    return (
      <main className="main">
        <h1>Displaying DB: {data.name}</h1>
        <MainView data={data} />
      </main>
    );
  }

  // Subtree
  return (
    <main className="main">
      <div className="chart_container">
        <details>
          <summary>
            {data.table.split("_").join(" ").toLocaleUpperCase()}
          </summary>
          {data.children!.map((el) => {
            if (el.children) {
              return (
                <details key={`${el.id}`}>
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
                  key={`${el.id}`}
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
