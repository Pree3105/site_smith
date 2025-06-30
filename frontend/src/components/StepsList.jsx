import React,{useState} from 'react';
import { CheckCircle, Circle, Clock } from 'lucide-react';

export function StepsList({steps, currentStep, onStepClick}){
  return(
    <div className='bg-gray-900 rounded-xl shadow-2xl p-6 space-y-2 h-full overflow-auto'>
      <h2 className='text-xl font-semibold mb-4 flex items-center gap-2 text-white'>
        Steps List:
      </h2>
      <div className='space-y-2'>
        {steps.map((step)=>{
          console.log('rendering id:', step.id);
          return(
          <div
            key={step.id}
            className={`rounded-xl border transition-all duration-200 cursor-pointer ${
            currentStep===step.id
            ? ("p-3 rounded-lg transition-colors bg-gray-800 border border-gray-700 hover:shadow-md"):("p-1 rounded-lg transition-all  border hover:bg-gray-800")}`}
            onClick={()=>onStepClick(step.id)}
          > 
          <div className='flex items-center gap-3'>
            {step.status==='completed'? (<CheckCircle className='w-5 h-5 text-green-500'/>)
            : step.status==='in-progress'?(<Clock className='w-5 h-5'/>)
            :(<Circle className='w-5 h-5 text-gray-600'/>)
            }
            <h3 className='text-gray-100 text-base font-medium'>{step.title}</h3>
          </div>
          <p className='text-sm text-gray-400 mt-1'>{step.description}</p>
          </div>
        )})}
      </div>
    </div>
  );
}



export default StepsList
