import React from 'react';
import PropTypes from 'prop-types';
import { TRANSATION_TYPE } from '../../util/constants';

const ButtonTransaction = ({ onClick, isActive, title }) => (
    <button
        className={`py-2 px-8 rounded-sm  ${
            isActive ? 'bg-green-light text-white' : ''
        } `}
        onClick={onClick}
        style={{ outline: 'none' }}
    >
        {title}
    </button>
);

ButtonTransaction.propTypes = {
    onClick: PropTypes.func,
    title: PropTypes.string,
    isActive: PropTypes.bool,
};
const TransactionOptionBottom = ({ setTransaction, transactionStage }) => {
    return (
        <h1
            className="text-center text-xs flex justify-center absolute font-normal bottom-0 right-0"
            style={{ zIndex: 800, left: '35px', marginBottom: '10px' }}
        >
            <div
                className="bg-white shadow rounded-sm"
                style={{ width: '354px' }}
            >
                <div className="flex justify-around py-1">
                    <ButtonTransaction
                        title="Tổng"
                        onClick={() => setTransaction(TRANSATION_TYPE.TOTAL)}
                        isActive={transactionStage === TRANSATION_TYPE.TOTAL}
                    />
                    <ButtonTransaction
                        title="Bán"
                        onClick={() => setTransaction(TRANSATION_TYPE.SALE)}
                        isActive={transactionStage === TRANSATION_TYPE.SALE}
                    />
                    <ButtonTransaction
                        title="Thuê"
                        onClick={() => setTransaction(TRANSATION_TYPE.RENT)}
                        isActive={transactionStage === TRANSATION_TYPE.RENT}
                    />
                </div>
            </div>
        </h1>
    );
};
TransactionOptionBottom.propTypes = {
    setTransaction: PropTypes.func,
    transactionStage: PropTypes.any,
};
export default TransactionOptionBottom;
