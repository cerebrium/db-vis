import { useDispatch } from "react-redux";
import dbimg from "../../public/dbimg.svg";
import { update_table } from "../features/db_viz_data/db_viz_slice";
import { Link } from "react-router";

export type HeaderProps = {
  dbname: string;
};

export const Header: React.FC<HeaderProps> = ({ dbname }) => {
  const dispatch = useDispatch();

  const reset_to_main = () => {
    dispatch(update_table({ id: "" }));
  };

  return (
    <nav className="header">
      <section className="image_title_container">
        <img src={dbimg} className="dbimg_header" onClick={reset_to_main} />
        <h1>
          {dbname.split("").map((v, i) => (!i ? v.toLocaleUpperCase() : v))}
        </h1>
        <section className="links_container">
          <span className="link">
            <Link to="/table">Table</Link>
          </span>
          <span className="link">
            <Link to="/graph">Graph</Link>
          </span>
        </section>
      </section>

      <span className="reset">
        <button onClick={reset_to_main}>reset</button>
      </span>
    </nav>
  );
};
