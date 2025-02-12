import { useDispatch } from "react-redux";
import type { ColumnSchema } from "../types";
import { DetailDisplay } from "./detail_display";
import { update_table } from "../features/db_viz_data/db_viz_slice";

type colProps = {
  col: ColumnSchema[];
};

export const Rows: React.FC<colProps> = ({ col }) => {
  const dispatch = useDispatch();
  // We want to make coherent tables, seperate the non-nested from the nested
  const [non_nested, nested]: [ColumnSchema[], ColumnSchema[]] = [[], []];
  for (let i = 0; i < col.length; i++) {
    if (col[i].children) {
      nested.push(col[i]);
      continue;
    }

    non_nested.push(col[i]);
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

  return (
    <section className="nested_children">
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
                {/*

                  For the nested components with children, we want to be 
                  able to make them the top level component

                  Update the redux state to have the id of the element 

                */}
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
  );
};
