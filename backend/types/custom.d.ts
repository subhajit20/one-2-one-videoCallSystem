import { WsNode } from "../server";
import { Request } from "express";

declare global {
  declare namespace Express {
    export interface Request extends Request {
      connectedNodes?: WsNode[];
    }
  }
}

export default global;
