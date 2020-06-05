import { useEffect, useRef } from 'react';

function useEventListener(eventName, handler, element = window) {
    // Create a ref that stores handler
    const savedHandler = useRef();
    useEffect(() => {
        savedHandler.current = handler;
    }, [handler]);

    useEffect(() => {
        const isSupported = element && element.addEventListener;
        if (!isSupported) return;
        const eventListener = (event) => savedHandler.current(event);
        element.addEventListener(eventName, eventListener);
        // eslint-disable-next-line consistent-return
        return () => {
            element.removeEventListener(eventName, eventListener);
        };
    }, [eventName, element]);
}
export default useEventListener;
