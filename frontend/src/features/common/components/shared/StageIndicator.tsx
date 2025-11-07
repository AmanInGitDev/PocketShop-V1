import React from 'react';

interface StageIndicatorProps {
  currentStage: number;
  totalStages: number;
  stageLabels: string[];
}

export const StageIndicator: React.FC<StageIndicatorProps> = ({
  currentStage,
  totalStages,
  stageLabels,
}) => {
  return (
    <div className="w-full mb-8">
      <div className="flex items-center justify-between mb-4">
        {Array.from({ length: totalStages }).map((_, index) => (
          <React.Fragment key={index}>
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center font-bold
                transition-all duration-200
                ${index + 1 <= currentStage
                  ? 'bg-[#EF4F5F] text-white'
                  : 'bg-[#E8E8E8] text-[#7E8C97]'
                }
              `}
            >
              {index + 1}
            </div>
            {index < totalStages - 1 && (
              <div
                className={`
                  flex-1 h-1 mx-2 transition-all duration-200
                  ${index + 1 < currentStage ? 'bg-[#EF4F5F]' : 'bg-[#E8E8E8]'}
                `}
              />
            )}
          </React.Fragment>
        ))}
      </div>
      <div className="flex justify-between text-xs font-medium text-[#7E8C97]">
        {stageLabels.map((label, index) => (
          <span key={index}>{label}</span>
        ))}
      </div>
    </div>
  );
};

