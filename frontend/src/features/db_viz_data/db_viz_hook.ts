import { useEffect, useRef } from "react";
import type { DBDetails } from "../../App";
import { useAppDispatch } from "../../app/hooks";
import { update_data } from "./db_viz_slice";

export const useDbVizData = () => {
  const dispatch = useAppDispatch();
  const ws = useRef<WebSocket | null>(null);
  let current_domain = window.location.origin + "/api/get_data";
  current_domain = current_domain.replace("http", "ws");

  useEffect(() => {
    ws.current = new WebSocket(current_domain);

    ws.current.onopen = function () {
      console.log("Websocket is opened");
      ws.current?.send("hello");
    };

    ws.current.onmessage = function (event: MessageEvent) {
      console.log("What is the message: ", event.data);
      if (event.data === "Fetching data") {
        alert("Data is being fetched");
      } else {
        try {
          const parsed_data = JSON.parse(event.data) as DBDetails;
          if (!parsed_data || !update_data) {
            throw new Error("No parsed data");
          }
          dispatch(update_data(parsed_data));
        } catch (e) {
          console.error("Error parsing data from websocket");
        }
      }
    };

    ws.current.onerror = function (event) {
      console.error("Websocket error: ", event);
    };

    ws.current.onclose = function () {
      console.log("The connection was closed");
    };

    return () => {
      ws.current?.close();
    };
    // We shouldn't need this here
  }, [update_data]);

  return ws.current;
};
