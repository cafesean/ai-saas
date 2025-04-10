import React from "react";
import type { TemplateBlockView } from "@/framework/types/template";

interface BlockListProps {
  blocks: TemplateBlockView[];
  onSelect?: (block: TemplateBlockView) => void;
}

const BlockList: React.FC<BlockListProps> = ({ blocks, onSelect }) => {
  return (
    <div className="grid grid-cols-4 gap-16">
      {blocks.map((block) => (
        <div
          key={block.uuid}
          className="p-4 bg-white shadow rounded-lg w-[200px] h-[200px] cursor-pointer"
          onClick={() => onSelect?.(block)}
        >
          <h3 className="text-lg font-semibold text-gray-900">{block.name}</h3>
          <p className="text-gray-600">{block.description}</p>
        </div>
      ))}
    </div>
  );
};

export default BlockList;
