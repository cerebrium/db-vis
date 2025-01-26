import { ColumnSchema } from "../App";

type colProps = {
  col: ColumnSchema;
};

export const Rows: React.FC<colProps> = ({ col }) => {
  return (
    <section className="sect">
      <h4>{col.column_name}</h4>
      <h4>{col.data_type}</h4>
      {col.children ? (
        <ul>
          {col.children &&
            col.children.map((el) => {
              return <Rows col={el} />;
            })}
        </ul>
      ) : (
        <></>
      )}
    </section>
  );
};
