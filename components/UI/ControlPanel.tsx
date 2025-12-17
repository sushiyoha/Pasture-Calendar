import React from 'react';
import { TimeUnit } from '../../types';
import { getValidMinorUnits } from '../../services/timeService';
import { Settings, Calendar as CalendarIcon } from 'lucide-react';

interface ControlPanelProps {
  major: TimeUnit;
  minor: TimeUnit;
  onMajorChange: (u: TimeUnit) => void;
  onMinorChange: (u: TimeUnit) => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({ major, minor, onMajorChange, onMinorChange }) => {
  
  const validMinors = getValidMinorUnits(major);

  return (
    <div className="absolute top-4 left-4 bg-white/70 backdrop-blur-md p-4 rounded-2xl shadow-xl z-10 border border-white/50 w-64">
      <div className="flex items-center gap-2 mb-4 text-slate-700">
        <Settings size={20} />
        <h2 className="font-bold text-lg">View Settings</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Container (Major)</label>
          <div className="flex flex-wrap gap-2">
            {[TimeUnit.Year, TimeUnit.Month, TimeUnit.Week].map((u) => (
              <button
                key={u}
                onClick={() => onMajorChange(u)}
                className={`px-3 py-1 rounded-full text-sm transition-all ${
                  major === u 
                    ? 'bg-green-500 text-white shadow-md' 
                    : 'bg-white text-slate-600 hover:bg-green-100'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Grid Item (Minor)</label>
          <div className="flex flex-wrap gap-2">
            {validMinors.length > 0 ? (
                validMinors.map((u) => (
                <button
                    key={u}
                    onClick={() => onMinorChange(u)}
                    className={`px-3 py-1 rounded-full text-sm transition-all ${
                    minor === u 
                        ? 'bg-blue-500 text-white shadow-md' 
                        : 'bg-white text-slate-600 hover:bg-blue-100'
                    }`}
                >
                    {u}
                </button>
                ))
            ) : (
                <span className="text-xs text-slate-400 italic">No valid sub-units</span>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-200">
        <p className="text-xs text-slate-500 flex items-center gap-1">
          <CalendarIcon size={12} />
          <span>Showing {major} → {minor}</span>
        </p>
      </div>
    </div>
  );
};

export default ControlPanel;