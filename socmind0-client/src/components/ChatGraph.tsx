// src/components/ChatGraph.tsx
"use client";
import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import { useChatData } from "../hooks/useChatData";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

interface GraphData {
  nodes: { id: string; name: string; group: string }[];
  links: { source: string; target: string }[];
}

export const ChatGraph: React.FC = () => {
  const chats = useChatData();

  const graphData: GraphData = useMemo(() => {
    const nodes: GraphData["nodes"] = [];
    const links: GraphData["links"] = [];

    chats.forEach((chat) => {
      // Add chat node
      nodes.push({ id: chat.id, name: chat.name, group: "chat" });

      // Add member nodes and links
      chat.members.forEach((member) => {
        const memberId = `${chat.id}-${member}`;
        nodes.push({ id: memberId, name: member, group: "member" });
        links.push({ source: chat.id, target: memberId });
      });
    });

    return { nodes, links };
  }, [chats]);

  const handleNodeClick = (node: any) => {
    if (node.group === "chat") {
      // Navigate to chat page or open chat interface
      console.log(`Navigate to chat: ${node.id}`);
    }
  };

  return (
    <div style={{ width: "800px", height: "600px" }}>
      {typeof window !== "undefined" && (
        <ForceGraph2D
          graphData={graphData}
          nodeLabel="name"
          nodeColor={(node: any) => (node.group === "chat" ? "red" : "blue")}
          onNodeClick={handleNodeClick}
          width={800}
          height={600}
        />
      )}
    </div>
  );
};
