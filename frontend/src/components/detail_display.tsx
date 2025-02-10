type DetailDisplayProps = {
  column_name: string;
  data_type: string;
  is_nullable: string;
};

export const DetailDisplay: React.FC<DetailDisplayProps> = ({
  column_name,
  data_type,
  is_nullable,
}) => {
  return (
    <tr className="detail_display">
      <td>{column_name.split("_").join(" ").toLocaleUpperCase()}</td>
      <td className="left_border">
        {data_type
          .split(" ")
          .map((w) => {
            return w
              .split("")
              .map((v, i) => (!i ? v.toLocaleUpperCase() : v))
              .join("");
          })
          .join("")}
      </td>
      <td className={`${is_nullable === "true" ? "red" : ""} left_border`}>
        {is_nullable
          .split("")
          .map((l, i) => (i === 0 ? l.toLocaleUpperCase() : l))
          .join("")}
      </td>
    </tr>
  );
};
