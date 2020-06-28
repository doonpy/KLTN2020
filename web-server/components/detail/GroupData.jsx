import React from 'react';
import useGroupedData from '../../hooks/use-grouped-data';

const GroupData = ({ id }) => {
    const { data } = useGroupedData(id);

    return <div>1</div>;
};

export default GroupData;
