import { WsNode } from "../server";

const getConnectedNodeWs = (
  nodeId: string,
  allNodes: WsNode[]
): WsNode | null => {
  for (let individualNode of allNodes) {
    if (individualNode.id === nodeId) {
      return individualNode;
    }
  }

  return null;
};

export default getConnectedNodeWs;
