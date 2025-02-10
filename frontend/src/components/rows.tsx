import type { ColumnSchema } from "../types";
import { DetailDisplay } from "./detail_display";

type colProps = {
  col: ColumnSchema[];
};

export const Rows: React.FC<colProps> = ({ col }) => {
  // We want to make coherent tables, seperate the non-nested from the nested
  const [non_nested, nested]: [ColumnSchema[], ColumnSchema[]] = [[], []];
  for (let i = 0; i < col.length; i++) {
    if (col[i].children) {
      nested.push(col[i]);
      continue;
    }

    non_nested.push(col[i]);
  }
  return (
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
  );
};
