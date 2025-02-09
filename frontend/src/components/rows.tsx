import { ColumnSchema } from "../App";
import { DetailDisplay } from "./detail_display";

type colProps = {
  col: ColumnSchema[];
};

export const Rows: React.FC<colProps> = ({ col }) => {
  return (
    <section className="nested_children">
      {col.map((nested_col) => {
        if (nested_col.column_name === "title") {
          console.log(nested_col);
        }
        if (nested_col.children) {
          return (
            <details className="details_container">
              <summary>
                {nested_col.column_name
                  .split("_")
                  .join(" ")
                  .toLocaleUpperCase()}
              </summary>
              <Rows col={nested_col.children} />
            </details>
          );
        } else {
          return (
            <DetailDisplay
              column_name={nested_col.column_name}
              data_type={nested_col.data_type}
              is_nullable={nested_col.is_nullable}
            />
          );
        }
      })}
    </section>
  );
};
