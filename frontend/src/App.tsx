import { useEffect, useState } from "react";
import "./App.css";
import { get } from "./requests/get";

function App() {
  const [name, setName] = useState("");
  useEffect(() => {
    console.log("the use effect is running");
    get("get_data").then((res) => {
      console.log("what is the res: ", res);
      if (res) {
        setName(res.Name);
      }
    });
  }, []);

  return <>{name}</>;
}

export default App;
