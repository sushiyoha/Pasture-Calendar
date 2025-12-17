import { TimeUnit, GridItemData } from '../types';

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const generateGridItems = (major: TimeUnit, minor: TimeUnit, baseDate: Date): GridItemData[] => {
  const items: GridItemData[] = [];
  const start = new Date(baseDate);

  // Helper to clone date
  const d = (date: Date) => new Date(date);

  if (major === TimeUnit.Year) {
    if (minor === TimeUnit.Month) {
      // 12 Months
      start.setMonth(0, 1);
      for (let i = 0; i < 12; i++) {
        const current = d(start);
        current.setMonth(i);
        items.push({
          id: `y${start.getFullYear()}-m${i}`,
          label: MONTH_NAMES[i],
          fullDateLabel: `${MONTH_NAMES[i]} ${start.getFullYear()}`,
          date: current
        });
      }
    } else if (minor === TimeUnit.Day) {
      // 365 Days
      start.setMonth(0, 1);
      const year = start.getFullYear();
      while (start.getFullYear() === year) {
        items.push({
          id: start.toISOString().split('T')[0],
          label: `${start.getDate()}`,
          fullDateLabel: start.toDateString(),
          date: d(start)
        });
        start.setDate(start.getDate() + 1);
      }
    } else if (minor === TimeUnit.Quarter) {
        // 4 Quarters
        for(let i=0; i<4; i++) {
             items.push({
                id: `y${start.getFullYear()}-q${i+1}`,
                label: `Q${i+1}`,
                fullDateLabel: `Q${i+1} ${start.getFullYear()}`,
                date: new Date(start.getFullYear(), i * 3, 1)
             });
        }
    }
  } 
  
  else if (major === TimeUnit.Month) {
    if (minor === TimeUnit.Day) {
        // Days in Month
        start.setDate(1);
        const month = start.getMonth();
        while(start.getMonth() === month) {
            items.push({
                id: start.toISOString().split('T')[0],
                label: `${start.getDate()}`,
                fullDateLabel: start.toDateString(),
                date: d(start)
            });
            start.setDate(start.getDate() + 1);
        }
    } else if (minor === TimeUnit.Week) {
        // Approximate weeks (starts of weeks)
        start.setDate(1);
        const month = start.getMonth();
        let weekCount = 1;
        // Back up to Sunday
        const day = start.getDay();
        start.setDate(start.getDate() - day);
        
        // Render 5 or 6 weeks to cover the month view
        for(let i=0; i<6; i++) {
             // Only include if the week overlaps the target month significantly, or simplified: just show 5 weeks starting from first sunday
             const idDate = d(start);
             items.push({
                 id: `w${weekCount}-${idDate.getTime()}`,
                 label: `W${weekCount}`,
                 fullDateLabel: `Week of ${idDate.toLocaleDateString()}`,
                 date: idDate
             });
             start.setDate(start.getDate() + 7);
             weekCount++;
             if (start.getMonth() !== month && start.getDate() > 7) break; 
        }
    }
  }

  else if (major === TimeUnit.Week) {
      if (minor === TimeUnit.Day) {
          // 7 Days
          const day = start.getDay(); // 0 is Sunday
          start.setDate(start.getDate() - day); // Go to Sunday
          for(let i=0; i<7; i++) {
              items.push({
                  id: start.toISOString().split('T')[0],
                  label: DAY_NAMES[start.getDay()],
                  fullDateLabel: start.toDateString(),
                  date: d(start)
              });
              start.setDate(start.getDate() + 1);
          }
      }
  }

  // Fallback for unimplemented combinations or edge cases
  if (items.length === 0) {
      items.push({
          id: 'default',
          label: 'View',
          fullDateLabel: 'Current Selection',
          date: baseDate
      });
  }

  return items;
};

export const getValidMinorUnits = (major: TimeUnit): TimeUnit[] => {
    switch(major) {
        case TimeUnit.Year: return [TimeUnit.Quarter, TimeUnit.Month, TimeUnit.Day];
        case TimeUnit.HalfYear: return [TimeUnit.Month, TimeUnit.Day];
        case TimeUnit.Quarter: return [TimeUnit.Month, TimeUnit.Week];
        case TimeUnit.Month: return [TimeUnit.Week, TimeUnit.Day];
        case TimeUnit.Week: return [TimeUnit.Day];
        case TimeUnit.Day: return []; 
        default: return [];
    }
};