import { useEffect, useState } from "react";
import { Header } from "../components/header";
import { useDbVizDataMethods } from "../features/db_viz_data/db_viz_data";
import { Outlet } from "react-router";

export const Layout: React.FC = () => {
  const [db, setDb] = useState("");

  const [data] = useDbVizDataMethods();

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

  return (
    <main className="main">
      <Header dbname={db} />
      <Outlet />
    </main>
  );
};
