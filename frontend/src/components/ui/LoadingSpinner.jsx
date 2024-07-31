import React from 'react';

const LoadingSpinner = () => {
    return (
        <div className="flex items-center justify-center ">
            <div className="h-8 w-8 border-4 border-indigo-800 border-b-slate-600 rounded-full animate-spin"></div>
        </div>
    );
};

export default LoadingSpinner;
