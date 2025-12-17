import React, { useMemo } from 'react';
import { GridItemData, Task, TasksMap } from '../types';
import GrassPatch from './GrassPatch';
import { TILE_SIZE, TILE_GAP } from '../constants';

interface CalendarGridProps {
  items: GridItemData[];
  tasksMap: TasksMap;
  onGridClick: (id: string) => void;
  selectedId: string | null;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({ items, tasksMap, onGridClick, selectedId }) => {
  
  // Calculate grid layout positions
  const gridLayout = useMemo(() => {
    const total = items.length;
    // Aim for a roughly square aspect ratio, or slightly wider landscape
    const columns = Math.ceil(Math.sqrt(total * 1.5)); 
    
    return items.map((item, index) => {
      const row = Math.floor(index / columns);
      const col = index % columns;
      
      const x = (col - columns / 2) * (TILE_SIZE + TILE_GAP);
      const z = (row - (total / columns) / 2) * (TILE_SIZE + TILE_GAP);
      
      return { ...item, position: [x, 0, z] as [number, number, number] };
    });
  }, [items]);

  return (
    <group>
      {gridLayout.map((item) => (
        <GrassPatch
          key={item.id}
          data={item}
          position={item.position}
          tasks={tasksMap[item.id] || []}
          onClick={onGridClick}
          isSelected={selectedId === item.id}
        />
      ))}
    </group>
  );
};

export default CalendarGrid;