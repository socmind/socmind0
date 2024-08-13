// src/components/ChatGraph.tsx
"use client";
import React, { useCallback, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useChatData } from "../hooks/useChatData";

const ForceGraph2D = dynamic(() => import("react-force-graph-2d"), {
  ssr: false,
});

interface Chat {
  id: string;
  name: string | null;
  context: string | null;
  creator: string | null;
  topic: string | null;
  conclusion: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface GraphData {
  nodes: { id: string; name: string; group: string }[];
  links: { source: string; target: string; type: string }[];
}

export const ChatGraph: React.FC = () => {
  const chats = useChatData();
  console.log("Chats data:", chats);
  const router = useRouter();
  const graphRef = useRef();

  const graphData: GraphData = useMemo(() => {
    const nodes: GraphData["nodes"] = [];
    const links: GraphData["links"] = [];
    const chatMap = new Map<string, Chat>();

    chats.forEach((chat) => {
      chatMap.set(chat.id, chat);

      // Add chat node
      nodes.push({ id: chat.id, name: chat.name || chat.id, group: "chat" });

      // Add links for creator relationships
      chats.forEach((chat) => {
        if (chat.creator && chatMap.has(chat.creator)) {
          links.push({
            source: chat.creator,
            target: chat.id,
            type: "creation",
          });
        }
      });

      // // Add member nodes and links
      // chat.members.forEach((member) => {
      //   const memberId = `${chat.id}-${member}`;
      //   nodes.push({ id: memberId, name: member, group: "member" });
      //   links.push({ source: chat.id, target: memberId });
      // });
    });

    return { nodes, links };
  }, [chats]);

  const handleNodeClick = useCallback(
    (node: any) => {
      if (node.group === "chat") {
        const distance = 40;
        const distRatio = 1 + distance / Math.hypot(node.x, node.y, node.z);

        const newPos =
          node.x || node.y || node.z
            ? {
                x: node.x * distRatio,
                y: node.y * distRatio,
                z: node.z * distRatio,
              }
            : { x: 0, y: 0, z: distance }; // special case if node is in (0,0,0)

        // @ts-ignore (graphRef.current doesn't have type information)
        graphRef.current.cameraPosition(
          newPos, // new position
          node, // lookAt ({ x, y, z })
          3000 // ms transition duration
        );

        // Wait for the zoom animation to finish before navigating
        setTimeout(() => {
          router.push(`/chat/${node.id}`);
        }, 3000);
      }
    },
    [router]
  );

  return (
    <div style={{ width: "800px", height: "600px" }}>
      {typeof window !== "undefined" && (
        <ForceGraph2D
          graphData={graphData}
          nodeLabel="name"
          nodeColor={(node: any) => (node.group === "chat" ? "red" : "blue")}
          linkColor={(link: any) =>
            link.type === "creation" ? "green" : "gray"
          }
          linkWidth={(link: any) => (link.type === "creation" ? 2 : 1)}
          onNodeClick={handleNodeClick}
          width={800}
          height={600}
        />
      )}
    </div>
  );
};
