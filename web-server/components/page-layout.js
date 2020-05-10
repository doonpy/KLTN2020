import React from 'react';
import PropTypes from 'prop-types';
import PageHeader from './page-header';

const PageLayout = (props) => {
    return (
        <div className="h-screen flex flex-col bg-black-alt">
            <PageHeader />
            {props.children}
        </div>
    );
};

PageLayout.propTypes = {
    children: PropTypes.node.isRequired,
};
export default PageLayout;
