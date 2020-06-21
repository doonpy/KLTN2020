import React from 'react';
import PropTypes from 'prop-types';

const Select = ({ className, options }) => {
    return (
        <div className={`relative ${className}`}>
            <select className="appearance-none w-full bg-grey py-2 px-4 pr-16 m-mb:pr-3 rounded-full leading-tight m-mb:text-11">
                {options.map((opt) => (
                    <option key={opt}>{opt}</option>
                ))}
            </select>
            <div className="pointer-events-none absolute top-8 bottom-8x m-mb:bottom-0 m-mb:top-33 right-0 flex items-center px-2 text-gray-700 m-mb:hidden">
                <svg
                    className="fill-current h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                >
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
            </div>
        </div>
    );
};
Select.propTypes = {
    className: PropTypes.string,
    options: PropTypes.arrayOf(PropTypes.any),
};
export default Select;
