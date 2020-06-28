import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// @material-ui/core components
import { makeStyles } from '@material-ui/core/styles';
import { Error } from '@material-ui/icons';
// core components
import GridItem from 'components/Grid/GridItem.js';
import GridContainer from 'components/Grid/GridContainer.js';
import Card from 'components/Card/Card.js';
import CardHeader from 'components/Card/CardHeader.js';
import CardBody from 'components/Card/CardBody.js';
import Primary from '../../components/Typography/Primary';
import { useRouteMatch } from 'react-router-dom';
import { getApiServer, getData } from '../../services/ApiService';
import Snackbar from '../../components/Snackbar/Snackbar';

const styles = {
    cardCategoryWhite: {
        color: 'rgba(255,255,255,.62)',
        margin: '0',
        fontSize: '14px',
        marginTop: '0',
        marginBottom: '0',
    },
    cardTitleWhite: {
        color: '#FFFFFF',
        marginTop: '0px',
        minHeight: 'auto',
        fontWeight: '300',
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
        marginBottom: '3px',
        textDecoration: 'none',
    },
};

const useStyles = makeStyles(styles);

export default function PatternDetail() {
    const classes = useStyles();
    const [pattern, setCatalog] = useState({
        id: NaN,
        sourceUrl: '',
        mainLocator: {
            postDate: { locator: '', delimiter: '', format: '' },
            propertyType: '',
            title: '',
            describe: '',
            price: '',
            acreage: '',
            address: '',
        },
        subLocator: [{ name: '', value: '' }],
    });
    const [failedNotification, setFailedNotification] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const patternId = useRouteMatch().params.id;
    const showErrorNotification = () => {
        setFailedNotification(true);
        setTimeout(() => setFailedNotification(false), 5000);
    };

    useEffect(() => {
        (async () => {
            const { pattern, error } = await getData(`pattern/${patternId}`);
            if (error) {
                setErrorMessage(error.cause);
                showErrorNotification();
                window.location.href = '/admin/catalog';
                return;
            }
            setCatalog(pattern);
        })();
    }, [patternId]);
    return (
        <Card>
            <CardHeader color="primary">
                <h4 className={classes.cardTitleWhite}>Chi tiết mẫu dữ liệu</h4>
            </CardHeader>
            <CardBody>
                <Snackbar
                    place="tc"
                    color="danger"
                    icon={Error}
                    message={errorMessage}
                    open={failedNotification}
                    closeNotification={() => setFailedNotification(false)}
                    close
                />
                <GridContainer>
                    <GridItem xs={12} sm={12} md={1}>
                        <h4>
                            <Primary>ID:</Primary> {pattern.id}
                        </h4>
                    </GridItem>
                    <GridItem xs={12} sm={12} md={11}>
                        <h4>
                            <Primary>URL nguồn:</Primary> {pattern.sourceUrl}
                        </h4>
                    </GridItem>
                    <GridItem xs={12} sm={12} md={6}>
                        <h4>
                            <Primary>Ngày tạo:</Primary>{' '}
                            {new Date(pattern.createAt).toLocaleString()}
                        </h4>
                    </GridItem>
                    <GridItem xs={12} sm={12} md={6}>
                        <h4>
                            <Primary>Ngày chỉnh sửa cuối:</Primary>{' '}
                            {new Date(pattern.updateAt).toLocaleString()}
                        </h4>
                    </GridItem>
                    <GridItem xs={12} sm={12} md={12}>
                        <h4>
                            <Primary>Live view:</Primary>
                            <iframe
                                src={`${getApiServer()}/api/v1/patterns/get-pattern-view?id=${
                                    pattern.id
                                }`}
                                width={'100%'}
                                height={'600px'}
                            />
                        </h4>
                    </GridItem>
                </GridContainer>
            </CardBody>
        </Card>
    );
}
