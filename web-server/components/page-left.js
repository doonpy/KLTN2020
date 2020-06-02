import React from 'react';
import { FaMapMarkedAlt, FaMap, FaHandHoldingUsd } from 'react-icons/fa';

const PageLeft = ({ setTabmap, tabMap }) => {
    return (
        <div
            className="dark:bg-gray-900 bg-white border-r border-solid border-light-primary dark:border-primary flex items-center flex-col pt-10"
            style={{ width: '64px' }}
        >
            <FaMapMarkedAlt
                className={`mt-8 cursor-pointer shadow-sm ${tabMap === 0 ? 'text-blue-600' : ''}`}
                size={24}
                onClick={() => setTabmap(0)}
            />
            <FaMap
                size={24}
                className={`mt-8 cursor-pointer shadow-sm ${tabMap === 1 ? 'text-blue-600' : ''}`}
                onClick={() => setTabmap(1)}
            />
            <FaHandHoldingUsd size={24} className="mt-8 cursor-pointer" />
            <div />
        </div>
    );
};

export default PageLeft;
