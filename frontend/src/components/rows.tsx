import { ColumnSchema } from "../App";

type colProps = {
  col: ColumnSchema;
};

export const Rows: React.FC<colProps> = ({ col }) => {
  return (
    <section className="sect">
      <div className="text_box">
        <h4>Name: {col.column_name}</h4>
        <h4>Type: {col.data_type}</h4>
      </div>
      {col.children ? (
        <div className="nested_chart_container">
          {col.children &&
            col.children.map((el) => {
              return <Rows col={el} />;
            })}
        </div>
      ) : (
        <></>
      )}
    </section>
  );
};
