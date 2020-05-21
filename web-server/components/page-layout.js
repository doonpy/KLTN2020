import React from 'react';
import PropTypes from 'prop-types';
import PageHeader from './page-header';

const PageLayout = (props) => {
    return (
        <div className="bg-black-alt max-h-screen">
            <PageHeader />
            {props.children}
        </div>
    );
};

PageLayout.propTypes = {
    children: PropTypes.node.isRequired,
};
export default PageLayout;
