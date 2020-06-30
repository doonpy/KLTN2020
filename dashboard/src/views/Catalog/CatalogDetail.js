import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
// @material-ui/core components
import { makeStyles } from '@material-ui/core/styles';
import { Error, Link as LinkIcon } from '@material-ui/icons';
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
import LiveViewIframe from '../../components/LiveViewIframe/LiveViewIframe';

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
const DETAIL_HOST_PATH = '/admin/host/detail/';
const DETAIL_PATTERN_PATH = '/admin/pattern/detail/';

export default function CatalogDetail() {
    const classes = useStyles();
    const [catalog, setCatalog] = useState({
        id: NaN,
        title: '',
        url: '',
        host: { id: NaN },
        pattern: { id: NaN },
        locator: { detailUrl: '', pageNumber: '' },
        createAt: '',
        updateAt: '',
    });
    const [failedNotification, setFailedNotification] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const catalogId = useRouteMatch().params.id;
    const showErrorNotification = () => {
        setFailedNotification(true);
        setTimeout(() => setFailedNotification(false), 5000);
    };

    useEffect(() => {
        (async () => {
            const { catalog, error } = await getData(`catalog/${catalogId}`);
            if (error) {
                setErrorMessage(error.cause);
                showErrorNotification();
                window.location.href = '/admin/catalog';
                return;
            }
            setCatalog(catalog);
        })();
    }, [catalogId]);
    return (
        <Card>
            <CardHeader color="primary">
                <h4 className={classes.cardTitleWhite}>Chi tiết danh mục</h4>
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
                    <GridItem xs={12} sm={12} md={4}>
                        <h4>
                            <Primary>ID:</Primary> {catalog.id}
                        </h4>
                    </GridItem>
                    <GridItem xs={12} sm={12} md={4}>
                        <h4>
                            <Primary>ID máy chủ:</Primary>
                            {catalog.host.id}
                            <Link to={`${DETAIL_HOST_PATH}${catalog.host.id}`}>
                                <LinkIcon fontSize={'small'} />
                            </Link>
                        </h4>
                    </GridItem>
                    <GridItem xs={12} sm={12} md={4}>
                        <h4>
                            <Primary>ID mẫu:</Primary>
                            {catalog.pattern.id}
                            <Link
                                to={`${DETAIL_PATTERN_PATH}${catalog.pattern.id}`}
                            >
                                <LinkIcon fontSize={'small'} />
                            </Link>
                        </h4>
                    </GridItem>
                    <GridItem xs={12} sm={12} md={12}>
                        <h4>
                            <Primary>Tên:</Primary> {catalog.title}
                        </h4>
                    </GridItem>
                    <GridItem xs={12} sm={12} md={12}>
                        <h4>
                            <Primary>URL:</Primary> {catalog.url}
                        </h4>
                    </GridItem>
                    <GridItem xs={12} sm={12} md={6}>
                        <h4>
                            <Primary>Ngày tạo:</Primary>{' '}
                            {new Date(catalog.createAt).toLocaleString()}
                        </h4>
                    </GridItem>
                    <GridItem xs={12} sm={12} md={6}>
                        <h4>
                            <Primary>Ngày chỉnh sửa cuối:</Primary>{' '}
                            {new Date(catalog.updateAt).toLocaleString()}
                        </h4>
                    </GridItem>
                    <GridItem xs={12} sm={12} md={12}>
                        {catalog.id && (
                            <LiveViewIframe
                                src={`${getApiServer()}/api/v1/catalogs/get-catalog-view?id=${
                                    catalog.id
                                }`}
                            />
                        )}
                    </GridItem>
                </GridContainer>
            </CardBody>
        </Card>
    );
}
