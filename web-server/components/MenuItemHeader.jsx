import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const MenuItem = ({ children, href }) => {
    const router = useRouter();

    return (
        <li className="mr-6 my-2 md:my-0">
            <Link href={href}>
                <div
                    className={`font-medium cursor-pointer flex items-center justify-center py-1 md:py-3 pl-1 align-middle text-gray-500 no-underline hover:text-primary hover:border-green-light ${
                        router.pathname === href
                            ? 'dark:border-blue-400 border-b-2 text-primary dark:text-blue-400 border-green-light'
                            : ''
                    }`}
                >
                    {children}
                </div>
            </Link>
        </li>
    );
};
export default MenuItem;
