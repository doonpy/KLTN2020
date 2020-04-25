import React from 'react';
import Nav from './nav';

interface Props {
    children: JSX.Element[] | JSX.Element;
}
const Layout = (props: Props) => {
    const { children } = props;
    return (
        <div className="flex flex-row h-screen">
            <Nav />
            <main className="w-full h-screen ml-32">{children}</main>
        </div>
    );
};
export default Layout;
