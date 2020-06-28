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
        <div className="w-3/12 bg-white mr-6 mt-8 border border-solid border-light-primary dark:border-primary rounded-sm">
            <style jsx>{`
                .input-box {
                    color: #3f4254;
                    background-color: #fff;
                    background-clip: padding-box;
                    border: 1px solid #e4e6ef;
                    outline: '#0bb783';
                    border-radius: 0.42rem;
                }
                .input:focus {
                    border-color: #0bb783;
                }
                .text-label {
                    font-weight: 500;
                    color: #3f4254;
                }
                .shadow-box {
                    box-shadow: 0 0 30px 0 rgba(82, 63, 105, 0.05);
                    border: 0;
                }
            `}</style>
            <div className="w-full p-4 h-full shadow-box">
                <div className="p-4 border border-solid border-light-primary dark:border-primary">
                    <div className="text-xs">
                        <div className="pt-4">
                            <label htmlFor="time" className="text-label">
                                Thời gian:
                            </label>
                            <div className="relative mt-2">
                                <select
                                    value={time}
                                    id="time"
                                    name="time"
                                    className="appearance-none w-full py-2 px-4 pr-16 m-mb:pr-3  leading-tight input-box"
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
                                className="text-label"
                            >
                                Loại giao dịch:
                            </label>
                            <div className="relative mt-2">
                                <select
                                    id="transactionType"
                                    className="appearance-none w-full input-box py-2 px-4 pr-16 m-mb:pr-3 leading-tight m-mb:text-11"
                                    onChange={onChange}
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
                            <label className="text-label" htmlFor="property">
                                Loại bất động sản:
                            </label>
                            <div className="relative mt-2">
                                <select
                                    id="property"
                                    value={propertyType}
                                    onChange={onChange}
                                    name="propertyType"
                                    className="appearance-none w-full input-box py-2 px-4 pr-16 m-mb:pr-3 leading-tight m-mb:text-11 focus:border focus:border-green-light"
                                >
                                    {PROPERTY_TYPE_NUMBER.map((opt) => (
                                        <option key={opt.id} value={opt.id}>
                                            {opt.wording[0]}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalysticsSelect;
