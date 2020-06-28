import React from 'react';
import PropTypes from 'prop-types';
import Spiner from '@atlaskit/spinner';

const LoadingWithTitle = ({ name }) => {
    return (
        <div className=" flex w-full justify-center ">
            <div
                className="bg-white text-xs loading shadow flex flex-row items-center font-medium"
                style={{
                    background: '#fff',
                    padding: '4px 8px',
                    borderRadius: '8px',
                    color: '#0bb783',
                }}
            >
                <div className="pr-2">{name}</div>
                <Spiner size={12} />
            </div>
        </div>
    );
};
LoadingWithTitle.propTypes = {
    name: PropTypes.string,
};
export default LoadingWithTitle;
