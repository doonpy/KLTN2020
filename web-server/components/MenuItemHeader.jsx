import React from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const MenuItem = ({ children, href }) => {
    const router = useRouter();

    return (
        <li className="mr-6 my-2 md:my-0">
            <Link href={href}>
                <div
                    className={`font-medium cursor-pointer flex items-center justify-center py-1 md:py-3 pl-1 align-middle text-gray-500 no-underline hover:text-gray-100 hover:border-pink-400 ${
                        router.pathname === href
                            ? 'dark:border-blue-400 border-b-2 text-orange-700 dark:text-blue-400 border-orange-700'
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
