import React from 'react';
import PropTypes from 'prop-types';
import { useMedia } from '../hooks/use-media';
import Error from '../components/Error';
import PageHeader from './page-header';

const PageLayout = (props) => {
    const media = useMedia(
        ['(min-width: 1280px)', '(min-width: 1000px)', '(min-width: 600px)'],
        [5, 4, 3],
        2
    );

    return (
        <div className="bg-gray-200 dark:bg-dark">
            <PageHeader />
            {props.children}
        </div>
    );
};

PageLayout.propTypes = {
    children: PropTypes.node.isRequired,
};
export default PageLayout;
