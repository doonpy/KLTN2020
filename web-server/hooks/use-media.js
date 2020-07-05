import { useEffect, useState } from 'react';

export function useMedia(queries, values, defaultValue) {
    let mediaQueryLists;
    if (typeof window !== 'undefined') {
        mediaQueryLists = queries.map((q) => window.matchMedia(q));
    } else {
        mediaQueryLists = [];
    }
    const getValue = () => {
        const index = mediaQueryLists.findIndex((mql) => mql.matches);
        return typeof values[index] !== 'undefined'
            ? values[index]
            : defaultValue;
    };
    const [value, setValue] = useState(getValue);

    useEffect(() => {
        const handler = () => setValue(getValue);

        mediaQueryLists.forEach((mql) => mql.addListener(handler));

        return () =>
            mediaQueryLists.forEach((mql) => mql.removeListener(handler));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return value;
}
