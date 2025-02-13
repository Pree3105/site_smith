import React,{useState} from 'react';
import { CheckCircle, Circle, Clock } from 'lucide-react';

export function StepsList({steps, currentStep, onStepClick}){
  return(
    <div className='bg-gray-900 rounded-lg shadow-lg p-4 h-full overflow-auto'>
      <h2 className='text-lg font-semibold mb-4 flex items-center gap-2 text-gray-100'>
        Steps List:
      </h2>
      <div>
        {steps.map((step)=>(
          <div
            key={step.id}
            className={
            currentStep===step.id
            ? ("p-1 rounded-lg transition-colors bg-gray-800 border border-gray-700"):("p-1 rounded-lg transition-colors  border hover:bg-gray-800")
            }
            onClick={()=>onStepClick(step.id)}
          > 
          <div className='flex items-center gap-2'>
            {step.status==='completed'? (<CheckCircle className='w-5 h-5 text-green-500'/>)
            : step.status==='in-progress'?(<Clock className='w-5 h-5'/>)
            :(<Circle className='w-5 h-5 text-gray-600'/>)
            }
            <h3 className='text-gray-100'>{step.title}</h3>
          </div>
          <p className='text-sm text-gray-400'>{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}



export default StepsList
