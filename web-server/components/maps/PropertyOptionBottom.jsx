import React from 'react';
import PropTypes from 'prop-types';
import Carousel from 'nuka-carousel';
import { PROPERTY_TYPE_NUMBER } from '../../util/constants';

const PropertyOptionBottom = ({
    isDensityMode,
    onClickProperty,
    propertyStage,
}) => {
    return (
        <div
            className={
                isDensityMode
                    ? `bottom-0 left-0 w-full absolute  bg-white`
                    : 'hidden'
            }
            style={{ height: '80px' }}
        >
            <div
                className="flex items-center justify-around pt-2 h-full"
                style={{ borderTop: '1px solid #ebedf3' }}
            >
                <Carousel
                    slidesToShow={8}
                    slidesToScroll={7}
                    withoutControls
                    cellSpacing={10}
                    slideIndex={propertyStage}
                    className="outline-none"
                >
                    {PROPERTY_TYPE_NUMBER.map((property) => (
                        <div
                            style={{
                                backgroundImage: `url(${property.img})`,
                                backgroundColor: 'gray',
                                height: '60px',
                                outline: 'none',
                                opacity: 0.9,
                            }}
                            className={`bg-opacity-0 mx-2 py-1 cursor-pointer text-center bg-cover bg-no-repeat h-full rounded-md flex justify-center items-center text-xs shadow ${
                                propertyStage === property.id
                                    ? 'border-2 border-green-light border-solid'
                                    : ''
                            }`}
                            key={property.id}
                            role="presentation"
                            onClick={() => onClickProperty(property.id)}
                        >
                            <h1
                                className="font-bold text-xs text-white px-4"
                                style={{ textShadow: '2px 2px 4px #000000' }}
                            >
                                {property.wording[0]}
                            </h1>
                        </div>
                    ))}
                </Carousel>
            </div>
        </div>
    );
};

PropertyOptionBottom.propTypes = {
    isDensityMode: PropTypes.bool,
    onClickProperty: PropTypes.func,
    propertyStage: PropTypes.number,
};
export default PropertyOptionBottom;
