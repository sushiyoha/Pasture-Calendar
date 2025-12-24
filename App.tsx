// import React, { useState, useMemo } from 'react';
// import Scene from './components/Scene';
// import ControlPanel from './components/UI/ControlPanel';
// import TaskModal from './components/UI/TaskModal';
// import { TimeUnit, TasksMap, Task } from './types';
// import { generateGridItems, getValidMinorUnits } from './services/timeService';
// import { nanoid } from 'nanoid';

// // Helper to parse Grid IDs into time components for aggregation
// const parseKey = (key: string) => {
//   const dayMatch = key.match(/^(\d{4})-(\d{2})-(\d{2})$/);
//   if (dayMatch) return { type: 'day', year: parseInt(dayMatch[1]), month: parseInt(dayMatch[2]) - 1, day: parseInt(dayMatch[3]) };

//   const monthMatch = key.match(/^y(\d{4})-m(\d{1,2})$/);
//   if (monthMatch) return { type: 'month', year: parseInt(monthMatch[1]), month: parseInt(monthMatch[2]) };

//   const quarterMatch = key.match(/^y(\d{4})-q(\d{1})$/);
//   if (quarterMatch) return { type: 'quarter', year: parseInt(quarterMatch[1]), quarter: parseInt(quarterMatch[2]) };
  
//   return null;
// };

// const App: React.FC = () => {
//   // State: View Configuration
//   const [majorUnit, setMajorUnit] = useState<TimeUnit>(TimeUnit.Year);
//   const [minorUnit, setMinorUnit] = useState<TimeUnit>(TimeUnit.Month);
//   const [baseDate] = useState<Date>(new Date());

//   // State: Tasks
//   const [tasksMap, setTasksMap] = useState<TasksMap>({});

//   // State: Selection
//   const [selectedGridId, setSelectedGridId] = useState<string | null>(null);

//   // Derived: Grid Items
//   const gridItems = useMemo(() => {
//     return generateGridItems(majorUnit, minorUnit, baseDate);
//   }, [majorUnit, minorUnit, baseDate]);

//   // Derived: Selected Item Data
//   const selectedGridData = useMemo(() => {
//     if (!selectedGridId) return null;
//     return gridItems.find(item => item.id === selectedGridId) || null;
//   }, [selectedGridId, gridItems]);


//   // Handlers
//   const handleMajorChange = (newMajor: TimeUnit) => {
//     setMajorUnit(newMajor);
//     // Reset minor to a valid default if necessary
//     const validMinors = getValidMinorUnits(newMajor);
//     if (!validMinors.includes(minorUnit)) {
//       setMinorUnit(validMinors[0]);
//     }
//     setSelectedGridId(null);
//   };

//   const handleMinorChange = (newMinor: TimeUnit) => {
//     setMinorUnit(newMinor);
//     setSelectedGridId(null);
//   };

//   const handleGridClick = (id: string) => {
//     setSelectedGridId(id === selectedGridId ? null : id);
//   };

//   // Task Operations
//   const handleAddTask = (title: string) => {
//     if (!selectedGridId) return;

//     const newTask: Task = {
//       id: nanoid(),
//       title,
//       completed: false,
//       createdAt: Date.now()
//     };

//     setTasksMap(prev => ({
//       ...prev,
//       [selectedGridId]: [...(prev[selectedGridId] || []), newTask]
//     }));
//   };

//   // Improved Delete: Finds task anywhere (handling aggregation case)
//   const handleDeleteTask = (taskId: string) => {
//     setTasksMap(prev => {
//         const newMap = { ...prev };
//         let found = false;
        
//         for (const key in newMap) {
//             const idx = newMap[key].findIndex(t => t.id === taskId);
//             if (idx !== -1) {
//                 newMap[key] = [...newMap[key]];
//                 newMap[key].splice(idx, 1);
//                 found = true;
//                 break; // Assuming unique IDs
//             }
//         }
//         return found ? newMap : prev;
//     });
//   };

//   // Improved Toggle: Finds task anywhere
//   const handleToggleTask = (taskId: string) => {
//     setTasksMap(prev => {
//         const newMap = { ...prev };
//         let found = false;
        
//         for (const key in newMap) {
//             const idx = newMap[key].findIndex(t => t.id === taskId);
//             if (idx !== -1) {
//                 const task = newMap[key][idx];
//                 newMap[key] = [...newMap[key]];
//                 newMap[key][idx] = { ...task, completed: !task.completed };
//                 found = true;
//                 break;
//             }
//         }
//         return found ? newMap : prev;
//     });
//   };

//   // --- Aggregation Logic ---
//   // Calculates which tasks belong to which grid item, including rolling up days into months/quarters/weeks
//   const aggregatedTasksMap = useMemo(() => {
//     const aggregated: TasksMap = {};
    
//     // Helper to store unique tasks per grid
//     const addUniqueTasks = (gridId: string, tasksToAdd: Task[]) => {
//         if (!aggregated[gridId]) aggregated[gridId] = [];
//         const existingIds = new Set(aggregated[gridId].map(t => t.id));
//         tasksToAdd.forEach(t => {
//             if (!existingIds.has(t.id)) {
//                 aggregated[gridId].push(t);
//                 existingIds.add(t.id);
//             }
//         });
//     };

//     gridItems.forEach(grid => {
//         const gridInfo = parseKey(grid.id);
//         const isWeek = grid.id.startsWith('w');
        
//         // 1. Always include tasks explicitly assigned to this ID
//         if (tasksMap[grid.id]) {
//             addUniqueTasks(grid.id, tasksMap[grid.id]);
//         }

//         // 2. Aggregate logic
//         (Object.entries(tasksMap) as [string, Task[]][]).forEach(([taskKey, tasks]) => {
//             // Skip if same key (already added)
//             if (taskKey === grid.id) return;

//             const taskKeyInfo = parseKey(taskKey);
//             if (!taskKeyInfo) return;

//             let match = false;

//             // Week Grid: Aggregate Days in that week range
//             if (isWeek) {
//                 if (taskKeyInfo.type === 'day') {
//                     // Check if day is within the week grid's date range (grid.date is start of week)
//                     const taskDate = new Date(taskKeyInfo.year, taskKeyInfo.month, taskKeyInfo.day);
//                     const weekStart = new Date(grid.date);
//                     weekStart.setHours(0,0,0,0);
                    
//                     const weekEnd = new Date(weekStart);
//                     weekEnd.setDate(weekEnd.getDate() + 7);

//                     if (taskDate >= weekStart && taskDate < weekEnd) {
//                         match = true;
//                     }
//                 }
//             }
//             // Month Grid: Aggregate Days in that month
//             else if (gridInfo && gridInfo.type === 'month') {
//                 if (taskKeyInfo.type === 'day' && 
//                     taskKeyInfo.year === gridInfo.year && 
//                     taskKeyInfo.month === gridInfo.month) {
//                     match = true;
//                 }
//             }
//             // Quarter Grid: Aggregate Days and Months in that quarter
//             else if (gridInfo && gridInfo.type === 'quarter') {
//                 // Determine Quarter of the task key
//                 let taskQ = -1;
//                 if (taskKeyInfo.type === 'month' || taskKeyInfo.type === 'day') {
//                     taskQ = Math.floor(taskKeyInfo.month / 3) + 1;
//                 }
                
//                 if (taskKeyInfo.year === gridInfo.year && taskQ === gridInfo.quarter) {
//                     match = true;
//                 }
//             }

//             if (match) {
//                 addUniqueTasks(grid.id, tasks);
//             }
//         });
//     });

//     return aggregated;
//   }, [tasksMap, gridItems]);

//   // Filter for Scene (only show incomplete sheep)
//   const sceneTasksMap = useMemo(() => {
//       const map: TasksMap = {};
//       (Object.entries(aggregatedTasksMap) as [string, Task[]][]).forEach(([key, tasks]) => {
//           map[key] = tasks.filter(t => !t.completed);
//       });
//       return map;
//   }, [aggregatedTasksMap]);

//   return (
//     <div className="relative w-full h-full font-sans text-slate-800">
      
//       {/* 3D Scene - uses filtered map (only living sheep) */}
//       <Scene 
//         items={gridItems} 
//         tasksMap={sceneTasksMap} 
//         onGridClick={handleGridClick} 
//         selectedId={selectedGridId} 
//       />

//       {/* Floating UI */}
//       <ControlPanel 
//         major={majorUnit} 
//         minor={minorUnit} 
//         onMajorChange={handleMajorChange} 
//         onMinorChange={handleMinorChange} 
//       />

//       {selectedGridData && (
//         <TaskModal 
//           gridData={selectedGridData}
//           // Modal shows ALL aggregated tasks (including completed)
//           tasks={aggregatedTasksMap[selectedGridData.id] || []}
//           onClose={() => setSelectedGridId(null)}
//           onAddTask={handleAddTask}
//           onDeleteTask={handleDeleteTask}
//           onToggleTask={handleToggleTask}
//         />
//       )}

//       {/* Hint/Footer */}
//       <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
//         <span className="bg-white/50 backdrop-blur px-4 py-2 rounded-full text-xs font-medium text-slate-500 shadow-sm">
//           Select a grass patch to add tasks. Zooming out aggregates your sheep!
//         </span>
//       </div>
//     </div>
//   );
// };

// export default App;

import React, { useState, useMemo, useEffect } from 'react';
import Scene from './components/Scene';
import ControlPanel from './components/UI/ControlPanel';
import TaskModal from './components/UI/TaskModal';
import { TimeUnit, TasksMap, Task } from './types';
import { generateGridItems, getValidMinorUnits } from './services/timeService';
import { taskService } from './services/taskService'; // 引入新服务
import { nanoid } from 'nanoid';

// Helper to parse Grid IDs
const parseKey = (key: string) => {
  const dayMatch = key.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dayMatch) return { type: 'day', year: parseInt(dayMatch[1]), month: parseInt(dayMatch[2]) - 1, day: parseInt(dayMatch[3]) };

  const monthMatch = key.match(/^y(\d{4})-m(\d{1,2})$/);
  if (monthMatch) return { type: 'month', year: parseInt(monthMatch[1]), month: parseInt(monthMatch[2]) };

  const quarterMatch = key.match(/^y(\d{4})-q(\d{1})$/);
  if (quarterMatch) return { type: 'quarter', year: parseInt(quarterMatch[1]), quarter: parseInt(quarterMatch[2]) };
  
  return null;
};

const App: React.FC = () => {
  // State: View Configuration
  const [majorUnit, setMajorUnit] = useState<TimeUnit>(TimeUnit.Year);
  const [minorUnit, setMinorUnit] = useState<TimeUnit>(TimeUnit.Month);
  const [baseDate] = useState<Date>(new Date());

  // State: Tasks (Local + Remote synced)
  const [tasksMap, setTasksMap] = useState<TasksMap>({});
  const [loading, setLoading] = useState(true);

  // State: Selection
  const [selectedGridId, setSelectedGridId] = useState<string | null>(null);

  // Derived: Grid Items
  const gridItems = useMemo(() => {
    return generateGridItems(majorUnit, minorUnit, baseDate);
  }, [majorUnit, minorUnit, baseDate]);

  // Derived: Selected Item Data
  const selectedGridData = useMemo(() => {
    if (!selectedGridId) return null;
    return gridItems.find(item => item.id === selectedGridId) || null;
  }, [selectedGridId, gridItems]);

  // --- INIT: Load Data from Supabase ---
  useEffect(() => {
    const initData = async () => {
      try {
        const fetchedTasks = await taskService.fetchAll();
        
        // Transform flat list to Map structure: { [gridId]: Task[] }
        const newMap: TasksMap = {};
        fetchedTasks.forEach((t: any) => {
          const gId = t.gridId; // Use the extra prop we added in service
          if (!newMap[gId]) newMap[gId] = [];
          
          // Clean task object for state
          const cleanTask: Task = {
            id: t.id,
            title: t.title,
            completed: t.completed,
            createdAt: t.createdAt
          };
          newMap[gId].push(cleanTask);
        });
        
        setTasksMap(newMap);
      } catch (error) {
        console.error("Failed to load sheep:", error);
      } finally {
        setLoading(false);
      }
    };

    initData();
  }, []);

  // Handlers
  const handleMajorChange = (newMajor: TimeUnit) => {
    setMajorUnit(newMajor);
    const validMinors = getValidMinorUnits(newMajor);
    if (!validMinors.includes(minorUnit)) {
      setMinorUnit(validMinors[0]);
    }
    setSelectedGridId(null);
  };

  const handleMinorChange = (newMinor: TimeUnit) => {
    setMinorUnit(newMinor);
    setSelectedGridId(null);
  };

  const handleGridClick = (id: string) => {
    setSelectedGridId(id === selectedGridId ? null : id);
  };

  // --- Task Operations (Optimistic Updates) ---

  const handleAddTask = async (title: string) => {
    if (!selectedGridId) return;

    // 1. Create a temporary task for instant UI feedback
    const tempId = nanoid();
    const tempTask: Task = {
      id: tempId,
      title,
      completed: false,
      createdAt: Date.now()
    };

    // Optimistic Update
    setTasksMap(prev => ({
      ...prev,
      [selectedGridId]: [...(prev[selectedGridId] || []), tempTask]
    }));

    try {
      // 2. Save to Supabase
      const savedTask = await taskService.add(title, selectedGridId);

      // 3. Replace temp task with real task (with real DB ID)
      setTasksMap(prev => {
        const list = prev[selectedGridId] || [];
        return {
          ...prev,
          [selectedGridId]: list.map(t => t.id === tempId ? savedTask : t)
        };
      });
    } catch (error) {
      console.error("Failed to add task", error);
      // Rollback on error
      setTasksMap(prev => ({
        ...prev,
        [selectedGridId]: (prev[selectedGridId] || []).filter(t => t.id !== tempId)
      }));
      alert("Could not save task. Please check your connection.");
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    // We need to find which grid this task belongs to for optimistic update
    let targetGridId = '';
    let previousMap = { ...tasksMap };

    // Optimistic Delete
    setTasksMap(prev => {
      const newMap = { ...prev };
      let found = false;
      
      for (const key in newMap) {
        const idx = newMap[key].findIndex(t => t.id === taskId);
        if (idx !== -1) {
          targetGridId = key;
          newMap[key] = [...newMap[key]];
          newMap[key].splice(idx, 1);
          found = true;
          break;
        }
      }
      return found ? newMap : prev;
    });

    try {
      await taskService.delete(taskId);
    } catch (error) {
      console.error("Failed to delete", error);
      setTasksMap(previousMap); // Rollback
    }
  };

  const handleToggleTask = async (taskId: string) => {
    let targetTask: Task | undefined;
    
    // Optimistic Toggle
    setTasksMap(prev => {
      const newMap = { ...prev };
      let found = false;
      
      for (const key in newMap) {
        const idx = newMap[key].findIndex(t => t.id === taskId);
        if (idx !== -1) {
          const task = newMap[key][idx];
          targetTask = task;
          newMap[key] = [...newMap[key]];
          newMap[key][idx] = { ...task, completed: !task.completed };
          found = true;
          break;
        }
      }
      return found ? newMap : prev;
    });

    if (targetTask) {
      try {
        await taskService.toggle(taskId, !targetTask.completed);
      } catch (error) {
        console.error("Failed to toggle", error);
        // We could define a more complex rollback here, but usually toggles are safe
      }
    }
  };

  // --- Aggregation Logic (Unchanged) ---
  const aggregatedTasksMap = useMemo(() => {
    const aggregated: TasksMap = {};
    const addUniqueTasks = (gridId: string, tasksToAdd: Task[]) => {
        if (!aggregated[gridId]) aggregated[gridId] = [];
        const existingIds = new Set(aggregated[gridId].map(t => t.id));
        tasksToAdd.forEach(t => {
            if (!existingIds.has(t.id)) {
                aggregated[gridId].push(t);
                existingIds.add(t.id);
            }
        });
    };

    gridItems.forEach(grid => {
        const gridInfo = parseKey(grid.id);
        const isWeek = grid.id.startsWith('w');
        
        if (tasksMap[grid.id]) {
            addUniqueTasks(grid.id, tasksMap[grid.id]);
        }

        (Object.entries(tasksMap) as [string, Task[]][]).forEach(([taskKey, tasks]) => {
            if (taskKey === grid.id) return;
            const taskKeyInfo = parseKey(taskKey);
            if (!taskKeyInfo) return;
            let match = false;
            if (isWeek) {
                if (taskKeyInfo.type === 'day') {
                    const taskDate = new Date(taskKeyInfo.year, taskKeyInfo.month, taskKeyInfo.day);
                    const weekStart = new Date(grid.date);
                    weekStart.setHours(0,0,0,0);
                    const weekEnd = new Date(weekStart);
                    weekEnd.setDate(weekEnd.getDate() + 7);
                    if (taskDate >= weekStart && taskDate < weekEnd) match = true;
                }
            } else if (gridInfo && gridInfo.type === 'month') {
                if (taskKeyInfo.type === 'day' && 
                    taskKeyInfo.year === gridInfo.year && 
                    taskKeyInfo.month === gridInfo.month) match = true;
            } else if (gridInfo && gridInfo.type === 'quarter') {
                let taskQ = -1;
                if (taskKeyInfo.type === 'month' || taskKeyInfo.type === 'day') {
                    taskQ = Math.floor(taskKeyInfo.month / 3) + 1;
                }
                if (taskKeyInfo.year === gridInfo.year && taskQ === gridInfo.quarter) match = true;
            }
            if (match) addUniqueTasks(grid.id, tasks);
        });
    });
    return aggregated;
  }, [tasksMap, gridItems]);

  // Filter for Scene (only show incomplete sheep)
  const sceneTasksMap = useMemo(() => {
      const map: TasksMap = {};
      (Object.entries(aggregatedTasksMap) as [string, Task[]][]).forEach(([key, tasks]) => {
          map[key] = tasks.filter(t => !t.completed);
      });
      return map;
  }, [aggregatedTasksMap]);

  return (
    <div className="relative w-full h-full font-sans text-slate-800">
      
      {/* 3D Scene */}
      <Scene 
        items={gridItems} 
        tasksMap={sceneTasksMap} 
        onGridClick={handleGridClick} 
        selectedId={selectedGridId} 
      />

      {/* Floating UI */}
      <ControlPanel 
        major={majorUnit} 
        minor={minorUnit} 
        onMajorChange={handleMajorChange} 
        onMinorChange={handleMinorChange} 
      />

      {selectedGridData && (
        <TaskModal 
          gridData={selectedGridData}
          // Pass ALL tasks (including completed ones for the list)
          tasks={aggregatedTasksMap[selectedGridData.id] || []}
          onClose={() => setSelectedGridId(null)}
          onAddTask={handleAddTask}
          onDeleteTask={handleDeleteTask}
          onToggleTask={handleToggleTask}
        />
      )}

      {/* Loading Indicator */}
      {loading && (
         <div className="absolute top-4 right-4 bg-white/80 px-3 py-1 rounded text-xs">
            Loading Sheep...
         </div>
      )}

      {/* Footer */}
      <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
        <span className="bg-white/50 backdrop-blur px-4 py-2 rounded-full text-xs font-medium text-slate-500 shadow-sm">
          Select a grass patch to add tasks. Zooming out aggregates your sheep!
        </span>
      </div>
    </div>
  );
};

export default App;