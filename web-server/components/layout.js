import React from 'react';
import Nav from './nav';

function Layout(props) {
    return (
        <div className="flex flex-col min-h-screen bg-black-alt font-sans leading-normal tracking-normal">
            <Nav />
            <main className="pt-20">{props.children}</main>
        </div>
    );
}

export default Layout;
