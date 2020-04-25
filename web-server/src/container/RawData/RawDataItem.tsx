import React, { useState } from 'react';
import { FaRegArrowAltCircleDown, FaRegArrowAltCircleUp } from 'react-icons/fa';

interface Props {
    raw: any;
}
export const RawDataItem: React.FC<Props> = props => {
    const { raw } = props;
    const [isOther, setOther] = useState(false);
    const onClickOther = () => {
        setOther(!isOther);
    };
    return (
        <>
            <tr>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <div className="flex items-center">{raw.title}</div>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <div className="text-gray-900 whitespace-no-wrap">
                        <div className="flex">
                            <p>{`${raw.price.value} ${raw.price.currency} `} </p>
                        </div>
                    </div>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <p className="text-gray-900 whitespace-no-wrap">{`${raw.acreage.value} ${raw.acreage.measureUnit} `}</p>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <span className="relative inline-block px-3 py-1 font-semibold text-orange-900 leading-tight">
                        <span aria-hidden className="absolute inset-0 bg-orange-200 opacity-50 rounded-full" />
                        <span className="relative">{raw.address}</span>
                    </span>
                </td>
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                    <div
                        role="presentation"
                        onClick={() => {
                            onClickOther();
                        }}
                    >
                        {!isOther ? <FaRegArrowAltCircleDown /> : <FaRegArrowAltCircleUp />}
                    </div>
                </td>
            </tr>
            {isOther ? (
                <tr className=" border-b border-gray-200">
                    {raw.others.map((other: { value: any; name: any }) =>
                        other.value ? (
                            <div className="flex">
                                <div className="px-5 py-2 font-semibold  text-sm">{other.value && other.name}:</div>
                                <div className="px-5 py-2  text-sm">{other.value && other.value}</div>
                            </div>
                        ) : null
                    )}
                </tr>
            ) : null}
        </>
    );
};

export default RawDataItem;
