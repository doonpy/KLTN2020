import React from 'react';
import PropTypes from 'prop-types';
import {
    PROPERTY_TYPE_NUMBER,
    TRANSATION_SELECT,
    TIME_SELECT,
} from '../../util/constants';

const Select = ({ className, options, title }) => {
    return (
        <React.Fragment>
            <div className="font-bold pt-4 ">{title}</div>
            <div className={`relative mt-2 ${className}`}>
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
        </React.Fragment>
    );
};
const AnalysticsSelect = () => {
    const onChange = (e) => {
        console.log(e);
    };
    return (
        <div className="w-3/12 mr-6 mt-8 dark:bg-gray-900 bg-white border border-solid border-light-primary dark:border-primary">
            <div className="w-full p-4 h-full ">
                <div className="p-4 border border-solid border-light-primary dark:border-primary">
                    <div className="text-xs">
                        <div>
                            <div className="font-bold pt-4">Thời gian</div>
                            <div
                                className="relative mt-2"
                                style={{ color: '#000' }}
                            >
                                <select
                                    style={{ outline: 'none' }}
                                    name="time"
                                    className="appearance-none w-full bg-grey py-2 px-4 pr-16 m-mb:pr-3 rounded-full leading-tight m-mb:text-11"
                                    onChange={onChange}
                                >
                                    {TIME_SELECT.map((opt) => (
                                        <option key={opt.id} value={opt.id}>
                                            {opt.time}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <div className="font-bold pt-4">Loại giao dịch</div>
                            <div
                                className="relative mt-2"
                                style={{ color: '#000' }}
                            >
                                <select
                                    className="appearance-none w-full bg-grey py-2 px-4 pr-16 m-mb:pr-3 rounded-full leading-tight m-mb:text-11"
                                    onChange={onChange}
                                    style={{ outline: 'none' }}
                                    name="transactionType"
                                >
                                    {TRANSATION_SELECT.map((opt) => (
                                        <option key={opt.id} value={opt.id}>
                                            {opt.type}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <div className="font-bold pt-4">
                                Loại bất động sản
                            </div>
                            <div
                                className="relative mt-2"
                                style={{ color: '#000' }}
                            >
                                <select
                                    style={{ outline: 'none' }}
                                    name="propertyType"
                                    className="appearance-none w-full bg-grey py-2 px-4 pr-16 m-mb:pr-3 rounded-full leading-tight m-mb:text-11"
                                >
                                    {PROPERTY_TYPE_NUMBER.map((opt) => (
                                        <option key={opt.id} value={opt.id}>
                                            {opt.wording[0]}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>{' '}
                    </div>
                </div>
            </div>
        </div>
    );
};
Select.propTypes = {
    className: PropTypes.string,
    options: PropTypes.arrayOf(PropTypes.any).isRequired,
    title: PropTypes.string.isRequired,
};
export default AnalysticsSelect;
