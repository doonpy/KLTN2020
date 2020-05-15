import React from 'react';
import Spinner from '@atlaskit/spinner';

const Loading = () => {
    return (
        <div className="flex justify-center items-center h-full">
            <Spinner size="large" />
        </div>
    );
};

export default Loading;
