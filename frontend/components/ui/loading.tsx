import { Dot } from 'lucide-react';

const LoadingDots = () => {
  return (
    <div className="flex items-center space-x-2 text-gray-700 font-medium">
      <span>Loading</span>
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s] bg-darkslateblue-300"></div>
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s] bg-slateblue-300"></div>
        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce bg-slateblue-100"></div>
      </div>
    </div>
  );
};


export { LoadingDots };
