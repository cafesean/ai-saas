import { SampleInput } from "@/components/ui/sample-input";
import { Label } from "@/components/ui/label";

export const WhatsAppNodePropertiesPanel = ({
  node,
  updateNodeData,
}: {
  node: any;
  updateNodeData: (key: string, value: any) => void;
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="whatsapp-label">Label</Label>
        <SampleInput
          id="whatsapp-label"
          value={node.data.label}
          onChange={(e) => updateNodeData("label", e.target.value)}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="whatsapp-from">From</Label>
        <SampleInput
          id="whatsapp-from"
          value={node.data.from}
          onChange={(e) => updateNodeData("from", e.target.value)}
          disabled
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="whatsapp-message-field">Message Filed Name</Label>
        <SampleInput
          id="whatsapp-message-field"
          value={node.data.msgFieldName}
          onChange={(e) => updateNodeData("msgFieldName", e.target.value)}
        />
      </div>
    </div>
  );
};
