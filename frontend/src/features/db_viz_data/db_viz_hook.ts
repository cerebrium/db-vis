import { useEffect, useRef } from "react";
import { useAppDispatch } from "../../app/hooks";
import { update_data } from "./db_viz_slice";
import type { DBDetails } from "../../types";
import { replace_content_with_refs } from "../../utils/replace_content_with_refs";

export const useDbVizData = () => {
  const dispatch = useAppDispatch();
  const ws = useRef<WebSocket | null>(null);

  let current_domain = "http://localhost:42069" + "/api/get_data";
  current_domain = current_domain.replace("http", "ws");

  useEffect(() => {
    ws.current = new WebSocket(current_domain);

    ws.current.onopen = function () {
      ws.current?.send("hello");
    };

    ws.current.onmessage = function (event: MessageEvent) {
      if (event.data && event.data === "Fetching data") {
        console.log("Cli fetching new table");
        return;
      }
      try {
        const parsed_data = JSON.parse(event.data) as DBDetails;
        if (!parsed_data || !update_data) {
          throw new Error("No parsed data");
        }

        // Mutate the incoming data to replace visited nodes
        // with their correct children. Also, change all the
        // duplicated id's by the ref replacment process.
        replace_content_with_refs(parsed_data);
        dispatch(update_data(parsed_data));
      } catch (e) {
        console.log(e);
        console.error("Error parsing data from websocket");
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
  }, []);

  return ws.current;
};
