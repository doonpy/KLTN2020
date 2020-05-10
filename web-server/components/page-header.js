import React from 'react';

const HambugerButton = () => {
    return (
        <div className="block">
            <button
                type="button"
                className="flex items-center px-3 py-2 border rounded text-white border-text-white hover:text-white hover:border-white"
            >
                <svg className="fill-current h-3 w-3" viewBox="0 0 20 20" xmlsns="http://www.w3.org/2000/svg">
                    <title>Menu</title>
                    <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
                </svg>
            </button>
        </div>
    );
};
const PageHeader = () => {
    return (
        <nav className="w-full bg-gray-900 border-b border-solid border-primay shadow-md" style={{ height: '10%' }}>
            <div className="w-full container mx-auto flex flex-wrap items-center mt-0 pt-3 pb-3 md:pb-0">
                <div className="w-1/2 pl-2 md:pl-0">
                    <a
                        className="text-gray-100 text-base xl:text-xl no-underline hover:no-underline font-bold"
                        href="/#"
                    >
                        Real Estate Data Visualization
                    </a>
                </div>
            </div>
        </nav>
    );
};

export default PageHeader;
