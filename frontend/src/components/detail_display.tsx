export type DetailDisplayProps = {
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
    <section className="detail_display">
      <p>Column Name: {column_name.split("_").join(" ")}</p>
      <p>Data Type: {data_type}</p>
      <p>Nullable: {is_nullable}</p>
    </section>
  );
};
