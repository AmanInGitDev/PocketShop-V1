import React from 'react';

interface StageIndicatorProps {
  currentStage: number;
  totalStages: number;
  stageLabels?: string[];
}

export const StageIndicator: React.FC<StageIndicatorProps> = ({
  currentStage,
  totalStages,
}) => {
  return (
    <div className="flex justify-center items-center gap-2">
      {Array.from({ length: totalStages }).map((_, index) => (
        <div
          key={index}
          className={`
            h-1.5 w-6 rounded-full transition-all duration-200
            ${index + 1 <= currentStage
              ? 'bg-[#5522E2]'
              : 'bg-[#E5E7EB]'
            }
          `}
        />
      ))}
    </div>
  );
};

