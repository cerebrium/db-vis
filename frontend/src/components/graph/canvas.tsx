import { useRef, useEffect, useState } from "react";
import { GraphData } from "../../utils/format_column_data";
import { useDbVizDataMethods } from "../../features/db_viz_data/db_viz_data";
import { useNavigate } from "react-router";
import { make_capital } from "../../utils/make_capital";

export const Canvas: React.FC = () => {
  const [currNode, setCurrNode] = useState("");
  const canvas_ref = useRef<HTMLCanvasElement | null>(null);
  const navigate = useNavigate();

  const [data] = useDbVizDataMethods();

  useEffect(() => {
    const canvas = canvas_ref.current;

    if (!canvas) {
      throw new Error("there is no canvas");
    }

    const ctx = canvas.getContext("2d");

    canvas.width = screen.width * 0.8;
    canvas.height = screen.height * 0.8;

    if (!ctx) {
      throw new Error("There is no ctx element");
    }

    if (!data) {
      navigate("/");
      return;
    }

    new GraphData(data, canvas.width, canvas.height, ctx, canvas, setCurrNode);
  }, [data]);

  return (
    <section className="canvas_container">
      <h3>{currNode ? currNode : make_capital(data?.table)}</h3>
      <canvas ref={canvas_ref} />
    </section>
  );
};
