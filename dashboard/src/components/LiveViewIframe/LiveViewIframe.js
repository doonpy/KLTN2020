import React, { useEffect, useState } from 'react';
import Primary from '../Typography/Primary';
import { CircularProgress } from '@material-ui/core';

export default function LiveViewIframe({ src }) {
    const [iframeDisplay, setIframeDisplay] = useState(false);
    const [loadingDisplay, setLoadingDisplay] = useState(true);
    const onIframeLoad = () => {
        setIframeDisplay(true);
        setLoadingDisplay(false);
    };

    useEffect(() => {
        setIframeDisplay(false);
        setLoadingDisplay(true);
    }, [src]);

    return (
        <div>
            <Primary>Live view:</Primary>
            {loadingDisplay && <CircularProgress />}
            {
                <iframe
                    hidden={!iframeDisplay}
                    title={'Live view'}
                    src={src}
                    width={'100%'}
                    height={'600px'}
                    onLoad={onIframeLoad}
                />
            }
        </div>
    );
}
