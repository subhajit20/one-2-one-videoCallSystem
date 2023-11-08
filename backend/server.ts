import express, { Application, Response, Request, NextFunction } from "express";
import { WebSocketServer } from "ws";
import { randomUUID } from "crypto";
import getConnectedNodeWs from "./controller/User.controller";
import global from "./types/custom";

const PORT = 3000;
const app: Application = express();

const wss = new WebSocketServer({
  port: 8080,
});

app.use(express.json());
app.use(
  express.urlencoded({
    extended: false,
  })
);

export interface WsNode extends WebSocketServer {
  id?: string;
  send?: any;
}

const allNodes: WsNode[] = [];

wss.on("connection", (ws: WsNode, req) => {
  console.log("Connected...");
  ws.id = randomUUID();
  allNodes.push(ws);

  ws.send(
    JSON.stringify({
      id: ws.id,
      message: "Connected",
    })
  );

  ws.on("message", (data) => {
    console.log(JSON.parse(data));
    const nodeId = JSON.parse(data).id;
    const inComingData = JSON.parse(data);
    // for incoming message from the user
    if (inComingData.message) {
      const node = getConnectedNodeWs(nodeId, allNodes);
      if (node?.id) {
        node.send(
          JSON.stringify({
            message: JSON.parse(data).message,
          })
        );
      }
    } else if (inComingData.sdpOffer) {
      // for sending offer to the remote user
      console.log(JSON.parse(data).sdpOffer);
      const node = getConnectedNodeWs(nodeId, allNodes);

      if (node?.id) {
        let offer = JSON.parse(data).sdpOffer;
        node.send(
          JSON.stringify({
            sdpOffer: offer,
          })
        );
      }
    } else if (inComingData.answer) {
      const node = getConnectedNodeWs(nodeId, allNodes);
      if (node?.id) {
        let answer = inComingData.answer;

        node.send(
          JSON.stringify({
            sdpAnswer: answer,
          })
        );
      }
    } else if (inComingData["new-ice-candidate"]) {
      const node = getConnectedNodeWs(nodeId, allNodes);
      if (node?.id) {
        console.log(inComingData["new-ice-candidate"]);
        node.send(
          JSON.stringify({
            iceCandidate: inComingData["new-ice-candidate"],
          })
        );
      }
    }
  });
});

interface bodyInteface {
  name: string;
  message: string;
}

app.use((_req: Request, _res: Response, _next: NextFunction) => {
  if (allNodes.length > 0) {
    _req.connectedNodes = allNodes;
  }
  _next();
});

app.get("/", (_req: Request, _res: Response) => {
  console.log(_req.connectedNodes);
  _res.status(200).json({
    msg: "Hello World",
  });
});

app.post("/", (_req: Request, res: Response) => {
  const { name, message }: bodyInteface = _req.body;
  console.log(_req.connectedNodes);
  try {
    if (!name || !message) {
      throw "Invalid name and message";
    }
    const responseBody: bodyInteface = {
      name: name,
      message: message,
    };

    res.status(200).json({
      responseBody,
    });
  } catch (e) {
    res.status(404).json({
      error: e,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running at http://locahost:${PORT}`);
});
