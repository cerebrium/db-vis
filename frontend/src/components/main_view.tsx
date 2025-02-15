import { useDispatch } from "react-redux";
import { update_table } from "../features/db_viz_data/db_viz_slice";
import type { ColumnSchema, DBDetails } from "../types";
import { DetailDisplay } from "./detail_display";
import { Rows } from "./rows";

export type MainViewProps = {
  data: DBDetails;
};

export const MainView: React.FC<MainViewProps> = ({ data }) => {
  const dispatch = useDispatch();

  // We want to make coherent tables, seperate the non-nested from the nested
  const [non_nested, nested]: [ColumnSchema[], ColumnSchema[]] = [[], []];
  for (let i = 0; i < data.schema.length; i++) {
    if (data.schema[i].children) {
      nested.push(data.schema[i]);
      continue;
    }

    non_nested.push(data.schema[i]);
  }

  const update_main_view = (
    e: React.MouseEvent<HTMLSpanElement>,
    id: string,
  ) => {
    e.stopPropagation();
    e.preventDefault();

    if (!id) {
      throw new Error("No id for element. System is busted.");
    }

    dispatch(update_table({ id: id }));
  };

  // Is the main data
  return (
    <div className="chart_container">
      <details>
        <summary>{data.table.split("_").join(" ").toLocaleUpperCase()}</summary>
        <section className="nested_data">
          {nested.map((el) => {
            return (
              <details key={`${el.id}`}>
                <summary>
                  <span
                    className="tooltip"
                    onClick={(e) => update_main_view(e, el.id)}
                  >
                    Zoom in
                  </span>

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
      </details>
    </div>
  );
};
