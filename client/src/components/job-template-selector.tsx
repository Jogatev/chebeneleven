import React, { useState, useRef, useEffect } from "react";
import { jobResponsibilities, jobRequirements } from "@shared/job-templates";
import { Textarea } from "@/components/ui/textarea";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult
} from "@hello-pangea/dnd";
import { X, Grip, Info, ChevronDown, ChevronUp } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

interface TemplateItem {
  id: string;
  title: string;
  content: string;
}

interface JobTemplateSelectorProps {
  type: "responsibilities" | "requirements";
  value: string;
  onChange: (value: string) => void;
}

export default function JobTemplateSelector({
  type,
  value,
  onChange,
}: JobTemplateSelectorProps) {
  const [availableItems, setAvailableItems] = useState<TemplateItem[]>(
    type === "responsibilities" ? jobResponsibilities : jobRequirements
  );
  const [selectedItems, setSelectedItems] = useState<TemplateItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // When component first renders, parse the initial value if it exists
  useEffect(() => {
    if (value.trim()) {
      // We'll just use the initial value but won't try to map it to template items
      // because it might be custom text from previous edits
    }
  }, []);

  // Generate formatted text when selected items change
  useEffect(() => {
    if (selectedItems.length > 0) {
      const formattedText = selectedItems
        .map((item) => `${item.title}:\n${item.content}`)
        .join("\n\n");
      
      onChange(formattedText);
    }
  }, [selectedItems, onChange]);

  const handleDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    // Dropped outside the list
    if (!destination) {
      return;
    }

    // Moving within the same list
    if (source.droppableId === destination.droppableId) {
      if (source.droppableId === "selected") {
        const items = reorder(
          selectedItems,
          source.index,
          destination.index
        );
        setSelectedItems(items);
      } else if (source.droppableId === "available") {
        const items = reorder(
          availableItems,
          source.index,
          destination.index
        );
        setAvailableItems(items);
      }
    } else {
      // Moving from one list to another
      if (source.droppableId === "available" && destination.droppableId === "selected") {
        // Add item to selected
        const item = availableItems[source.index];
        setSelectedItems([...selectedItems, item]);
      } else if (source.droppableId === "selected" && destination.droppableId === "available") {
        // Remove item from selected
        const item = selectedItems[source.index];
        setSelectedItems(selectedItems.filter((_, index) => index !== source.index));
      }
    }
  };

  const removeItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const addItem = (item: TemplateItem) => {
    if (!selectedItems.find((selected) => selected.id === item.id)) {
      setSelectedItems([...selectedItems, item]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white p-4 rounded-md border border-gray-200">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter job ${type === "responsibilities" ? "duties and responsibilities" : "requirements and qualifications"} or select from templates below`}
          className="min-h-[150px]"
        />
      </div>

      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="bg-gray-50 p-4 rounded-md border border-gray-200"
      >
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-gray-700">
            Standard {type === "responsibilities" ? "Duties & Responsibilities" : "Requirements & Qualifications"}
          </h3>
          <div className="flex items-center space-x-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info size={16} className="text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs text-xs">
                    {type === "responsibilities"
                      ? "Drag items to your job description to quickly add standard responsibilities."
                      : "Drag items to your requirements list to quickly add standard qualifications."}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2">
                {isOpen ? 
                  <ChevronUp className="h-4 w-4 text-gray-600" /> : 
                  <ChevronDown className="h-4 w-4 text-gray-600" />
                }
                <span className="ml-2 text-xs text-gray-600">
                  {isOpen ? "Hide Templates" : "Show Templates"}
                </span>
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>

        <CollapsibleContent className="mt-4">
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Available Items */}
              <div>
                <h4 className="text-xs font-medium text-gray-500 mb-2">Available Templates</h4>
                <Droppable droppableId="available">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-2 min-h-[200px] bg-white p-2 rounded border border-gray-200"
                    >
                      {availableItems.map((item, index) => (
                        <Draggable key={item.id} draggableId={item.id} index={index}>
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className="p-2 bg-gray-50 rounded border border-gray-200 flex items-center gap-2"
                            >
                              <div {...provided.dragHandleProps} className="cursor-grab">
                                <Grip size={16} className="text-gray-400" />
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-sm">{item.title}</div>
                              </div>
                              <button
                                type="button"
                                onClick={() => addItem(item)}
                                className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                              >
                                Add
                              </button>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>

              {/* Selected Items */}
              <div>
                <h4 className="text-xs font-medium text-gray-500 mb-2">Selected Items</h4>
                <Droppable droppableId="selected">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="space-y-2 min-h-[200px] bg-white p-2 rounded border border-gray-200"
                    >
                      {selectedItems.length === 0 ? (
                        <div className="text-gray-400 text-sm p-4 text-center">
                          Drag items here or click "Add" to include them in your job description
                        </div>
                      ) : (
                        selectedItems.map((item, index) => (
                          <Draggable key={item.id} draggableId={`selected-${item.id}`} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className="p-2 bg-gray-50 rounded border border-gray-200 flex items-center gap-2"
                              >
                                <div {...provided.dragHandleProps} className="cursor-grab">
                                  <Grip size={16} className="text-gray-400" />
                                </div>
                                <div className="flex-1">
                                  <div className="font-medium text-sm">{item.title}</div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeItem(index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
          </DragDropContext>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

// Helper function to reorder items within a list
const reorder = <T,>(list: T[], startIndex: number, endIndex: number): T[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};