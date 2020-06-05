import React from 'react';

const Loading = () => {
    return (
        <div className="flex justify-center items-center h-full">
            <div className="lds-facebook">
                <div />
                <div />
                <div />
            </div>
        </div>
    );
};

export default Loading;
