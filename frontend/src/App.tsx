import { useNavigate } from "react-router";
import { useDbVizDataMethods } from "./features/db_viz_data/db_viz_data";
import { useDbVizData } from "./features/db_viz_data/db_viz_hook";
import { useEffect } from "react";

function App() {
  // Set up the websocket
  useDbVizData();

  const navigate = useNavigate();

  const [data] = useDbVizDataMethods();

  if (!data) {
    return (
      <main className="main">
        <div>Loading... some stuff</div>
      </main>
    );
  }

  navigate("/table");
}

export default App;
