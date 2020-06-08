import React from 'react';
import PropTypes from 'prop-types';
import PageHeader from './page-header';

const PageLayout = (props) => {
    return (
        <div className="max-h-screen bg-gray-200 dark:bg-dark">
            <PageHeader />
            {props.children}
        </div>
    );
};

PageLayout.propTypes = {
    children: PropTypes.node.isRequired,
};
export default PageLayout;
