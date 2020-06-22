import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import * as action from '../../store/analytics/actions';
import {
    PROPERTY_TYPE_NUMBER,
    TRANSATION_SELECT,
    TIME_SELECT,
} from '../../util/constants';

const AnalysticsSelect = () => {
    const dispatch = useDispatch();
    const { time, transactionType, propertyType } = useSelector(
        (state) => state.analytics
    );

    const onChange = async (e) => {
        await dispatch(
            action.getOptionAnalytics({
                [e.target.name]: Number(e.target.value),
            })
        );
    };

    return (
        <div className="w-3/12 mr-6 mt-8 dark:bg-gray-900 bg-white border border-solid border-light-primary dark:border-primary">
            <div className="w-full p-4 h-full ">
                <div className="p-4 border border-solid border-light-primary dark:border-primary">
                    <div className="text-xs">
                        <div className="pt-4">
                            <label htmlFor="time" className="font-semibold">
                                Thời gian:
                            </label>
                            <div
                                className="relative mt-2"
                                style={{ color: '#000' }}
                            >
                                <select
                                    value={time}
                                    id="time"
                                    style={{ outline: 'none' }}
                                    name="time"
                                    className="appearance-none w-full bg-grey py-2 px-4 pr-16 m-mb:pr-3 rounded-full leading-tight m-mb:text-11"
                                    onChange={onChange}
                                >
                                    {TIME_SELECT.map((opt) => (
                                        <option
                                            key={opt.value}
                                            value={opt.value}
                                        >
                                            {opt.time}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div className="pt-4">
                            <label
                                htmlFor="transactionType"
                                className="font-semibold"
                            >
                                Loại giao dịch:
                            </label>
                            <div
                                className="relative mt-2"
                                style={{ color: '#000' }}
                            >
                                <select
                                    id="transactionType"
                                    className="appearance-none w-full bg-grey py-2 px-4 pr-16 m-mb:pr-3 rounded-full leading-tight m-mb:text-11"
                                    onChange={onChange}
                                    style={{ outline: 'none' }}
                                    value={transactionType}
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
                        <div className="pt-4">
                            <label className="font-semibold" htmlFor="property">
                                Loại bất động sản:
                            </label>
                            <div
                                className="relative mt-2"
                                style={{ color: '#000' }}
                            >
                                <select
                                    id="property"
                                    value={propertyType}
                                    style={{ outline: 'none' }}
                                    onChange={onChange}
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

export default AnalysticsSelect;
