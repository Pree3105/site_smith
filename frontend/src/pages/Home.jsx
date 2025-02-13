import React from 'react'
import { FaHammer } from 'react-icons/fa'; 
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate=useNavigate();
  const onSubmit =data=>{
    navigate('/builder',{state: {prompt: data.prompt}})
    console.log(data);
  }
  
  return (
    <div className="min-h-screen bg-black flex text-white items-center justify-center "> 
      <div className='max-w-2xl w-full px-4'>
        <div className='text-center'>
        <div className='flex flex-col items-center mb-8 '>
          <FaHammer size={42} className='mb-4'/> 
        <div/>
        <div>
          <h1 className='text-3xl font-bold mb-2'>Website Builder AI</h1>
          <h2 className='text-2xl'>Imagine Your Perfect Website. We'll Make It Real</h2>
        </div>
        <form className='w-full' onSubmit={handleSubmit(onSubmit)} >
          <div className='p-4' >
            <textarea 
             className='w-full h-32 bg-gray-800 m-2 p-4 border-4 border-gray-700 rounded-md  errors.prompt ?"border-red-500":"border-gray-700"' 
             {...register("prompt", { required: true,
              minLength:{value:10, message:'Min length atleast 10'}
             })}
             placeholder='Describe your website here ...' />
             {errors.prompt && <span > {errors.prompt.message}</span> }
          </div>
          <button type='submit' className='w-full bg-blue-700 p-3 rounded-md' >Create your website</button>
        </form>
        </div>
        </div>
      </div>
      <div>
      </div>
    </div>
  )
}

export default Home
