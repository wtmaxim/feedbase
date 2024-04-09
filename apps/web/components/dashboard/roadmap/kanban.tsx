import React, { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { Button } from '@feedbase/ui/components/button';
import { ChevronUp, LayoutGrid, LucideIcon, Plus } from 'lucide-react';
import { STATUS_OPTIONS } from '@/lib/constants';
import { FeedbackWithUserProps } from '@/lib/types';
import { FeedbackSheet } from '../feedback/feedback-sheet';
import { Draggable } from './draggable';
import { Droppable } from './droppable';

// Card component for draggable feedback items
function FeedbackCard({ feedback }: { feedback: FeedbackWithUserProps }) {
  return (
    <>
      {/* Status, Title, Upvotes */}
      <div className='flex h-fit items-center justify-between gap-1'>
        <div className='flex w-full items-center gap-2'>
          {/* Status Icon */}
          {(() => {
            if (feedback.status) {
              const currentStatus =
                STATUS_OPTIONS.find(
                  (option) => option.label.toLowerCase() === feedback.status?.toLowerCase()
                ) || STATUS_OPTIONS[0];

              return <currentStatus.icon className='text-foreground/60 h-3.5 w-3.5 shrink-0' />;
            }
            return null;
          })()}
          <span className='w-full text-start text-sm'>{feedback.title}</span>
        </div>

        {/* Upvotes */}
        <div className='flex h-full items-center gap-0.5'>
          <ChevronUp className='text-muted-foreground h-3.5 w-3.5' />
          <span className='text-muted-foreground text-xs'>{feedback.upvotes}</span>
        </div>
      </div>

      {/* Board Combobox & Tags */}
      <div className='flex flex-wrap items-center gap-2'>
        {/* Board Combobox */}
        <Button
          variant='outline'
          size='icon'
          className='text-foreground/60 hover:text-foreground/80  hover:border-foreground/20 h-6 w-6'>
          <LayoutGrid className='h-3.5 w-3.5' />
        </Button>

        {/* Tags */}
        {feedback.tags && feedback.tags.length > 0
          ? feedback.tags.map((tag) => (
              <button
                className='bg-background group/tag hover:border-foreground/20 hover:bg-accent hidden h-6 flex-shrink-0 flex-wrap items-center gap-2 rounded-lg border px-2 transition-colors hover:cursor-pointer md:flex'
                key={tag.name.toLowerCase()}
                type='button'>
                {/* Tag color */}
                <div className='h-2 w-2 rounded-full' style={{ backgroundColor: tag.color }} />
                {/* Tag name */}
                <div className='text-foreground/60 group-hover/tag:text-foreground/80 text-xs  transition-colors'>
                  {tag.name}
                </div>
              </button>
            ))
          : null}
      </div>
    </>
  );
}

export default function FeedbackKanban({
  columns,
  data,
}: {
  columns: { label: string; icon: LucideIcon }[];
  data: Record<string, FeedbackWithUserProps[]>;
}) {
  const [activeItem, setActiveItem] = useState<FeedbackWithUserProps | null>(null);
  const [dataState, setDataState] = useState(data);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    })
  );

  // Get item by id
  function getItemById(id: string) {
    for (const key in dataState) {
      const item = dataState[key].find((item) => item.id === id);
      if (item) return item;
    }
    return null;
  }

  return (
    <div className='flex h-full w-full overflow-y-auto'>
      <DndContext onDragStart={onDragStart} onDragEnd={onDragEnd} sensors={sensors}>
        <div className='flex h-full w-full gap-3 overflow-x-auto p-5'>
          {columns.map(({ label, icon: Icon }) => (
            // We updated the Droppable component so it would accept an `id`
            // prop and pass it to `useDroppable`
            <div
              className='bg-root flex h-full w-full min-w-[300px] flex-col gap-3 rounded-md p-3 brightness-110'
              key={label}>
              {/* Header Row */}
              <div className='flex items-center justify-between  brightness-90'>
                <div className='flex items-center gap-2'>
                  <Icon className='text-muted-foreground h-4 w-4' />
                  <span className='text-sm'>{label}</span>
                  <span className='text-muted-foreground text-sm'>
                    {dataState[label.toLowerCase()]?.length}
                  </span>
                </div>
                <Button
                  variant='ghost'
                  size='icon'
                  className='text-muted-foreground hover:text-foreground h-6 w-6'>
                  <Plus className='h-3.5 w-3.5' />
                </Button>
              </div>

              {/* Feedback Items */}
              <Droppable
                key={label}
                id={label.toLowerCase()}
                className='no-scrollbar flex h-full w-full flex-col gap-3 overflow-y-auto rounded-md brightness-90'
                isOverOverlay={
                  <div className='bg-root absolute left-0 top-0 z-10 flex h-full w-full flex-col items-center justify-center rounded-md border opacity-90'>
                    <span className='text-lg font-semibold'>Drop here</span>
                    <span className='text-foreground/60 text-sm'>Items are sorted by priority</span>
                  </div>
                }>
                {dataState[label.toLowerCase()]?.map((item) => (
                  <FeedbackSheet
                    key={item.id}
                    initialFeedback={item}
                    feedback={dataState[label.toLowerCase()]}>
                    <Draggable
                      key={item.id}
                      id={item.id}
                      className='bg-root z-50 flex h-fit w-full flex-col gap-3 rounded-md border p-3'>
                      <FeedbackCard feedback={item} />
                    </Draggable>
                  </FeedbackSheet>
                ))}
              </Droppable>
            </div>
          ))}
        </div>

        <DragOverlay
          style={{
            transition: 'transform 0.1s cubic-bezier(0.54, 1.5, 0.38, 1.11)',
            cursor: 'grabbing',
            zIndex: 9999,
          }}>
          {activeItem ? (
            <div className='bg-root flex h-fit w-full flex-col gap-3 rounded-md border p-3'>
              <FeedbackCard feedback={activeItem} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );

  function onDragStart(event: DragStartEvent) {
    // Set active draggable id
    setActiveItem(getItemById(event.active.id as string));
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    // Find where active item is currently in
    const currentContainer = Object.entries(dataState).find(([key, items]) =>
      // For each item, check if the id is equal to the active id
      items.find((item) => item.id === active.id)
    )?.[0];
    if (!currentContainer || !over || over.id === currentContainer) return;

    // Update data state object
    const newData: Record<string, FeedbackWithUserProps[]> = {
      ...dataState,
      [currentContainer]: dataState[currentContainer].filter((item) => item.id !== active.id),
      [over.id]: [
        ...(dataState[over.id] || []),
        dataState[currentContainer].find((item) => item.id === active.id),
      ].filter(Boolean) as FeedbackWithUserProps[],
    };

    setDataState(newData);
    setActiveItem(null);
  }
}
