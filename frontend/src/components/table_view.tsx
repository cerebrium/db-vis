import { useDispatch } from "react-redux";
import { useDbVizDataMethods } from "../features/db_viz_data/db_viz_data";
import { MainView } from "./main_view";
import { update_table } from "../features/db_viz_data/db_viz_slice";
import type { ColumnSchema } from "../types";
import { Rows } from "./rows";
import { DetailDisplay } from "./detail_display";
import { useNavigate } from "react-router";
import { useEffect } from "react";

export const TableView: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [data, path] = useDbVizDataMethods();

  useEffect(() => {
    if (!data) {
      navigate("/");
    }
  }, [data]);

  if (!data) {
    return null;
  }

  if ("schema" in data) {
    return <MainView data={data} />;
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
    <>
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
      <div className="chart_container chart_container--with-navigation">
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
    </>
  );
};
