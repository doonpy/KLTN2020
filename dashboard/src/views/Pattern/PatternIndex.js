import React, { useState, useEffect } from 'react';
import { useRouteMatch, Route, Switch, Redirect } from 'react-router-dom';
import { confirmAlert } from 'react-confirm-alert'; // Import
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
// react plugin for creating charts
// @material-ui/core
import { makeStyles } from '@material-ui/core/styles';
// @material-ui/icons
import { AddAlert, CheckCircle, Delete, Info } from '@material-ui/icons';
import { Edit } from '@material-ui/icons';
import { Add } from '@material-ui/icons';
// core components
import GridContainer from '../../components/Grid/GridContainer';
import GridItem from '../../components/Grid/GridItem';
import Card from '../../components/Card/Card';
import CardHeader from '../../components/Card/CardHeader';
import CardBody from '../../components/Card/CardBody';
import Table from '../../components/Table/Table';
import Button from 'components/CustomButtons/Button.js';
import CardFooter from '../../components/Card/CardFooter';
import { Link } from 'react-router-dom';
// services
import { deleteData, getData } from '../../services/ApiService';
import Snackbar from '../../components/Snackbar/Snackbar';
import PatternDetail from './PatternDetail';
import PatternEdit from './PatternEdit';

const styles = {
    cardCategoryWhite: {
        '&,& a,& a:hover,& a:focus': {
            color: 'rgba(255,255,255,.62)',
            margin: '0',
            fontSize: '14px',
            marginTop: '0',
            marginBottom: '0',
        },
        '& a,& a:hover,& a:focus': {
            color: '#FFFFFF',
        },
    },
    cardTitleWhite: {
        color: '#FFFFFF',
        marginTop: '0px',
        minHeight: 'auto',
        fontWeight: '300',
        fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
        marginBottom: '3px',
        textDecoration: 'none',
        '& small': {
            color: '#777',
            fontSize: '65%',
            fontWeight: '400',
            lineHeight: '1',
        },
    },
    actionButton: {
        marginRight: '10px',
    },
};
const useStyles = makeStyles(styles);
const LIMIT = 10;
const ROOT_PATH = '/admin/pattern';
const ADD_PATH = '/admin/pattern/create';
const DETAIL_PATH = '/admin/pattern/detail';
const EDIT_PATH = '/admin/pattern/edit';
const notificationType = {
    SUCCESS: 0,
    FAILED: 1,
};

export default function HostIndex() {
    const match = useRouteMatch();
    const classes = useStyles();
    const [successNotification, setSuccessNotification] = useState(false);
    const [failedNotification, setFailedNotification] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [patterns, setPatterns] = useState({ patterns: [], hasNext: false });
    const [pageNumber, setPageNumber] = useState(0);

    const showNotification = (type) => {
        if (type === notificationType.SUCCESS) {
            setFailedNotification(false);
            setSuccessNotification(true);
            setTimeout(() => setSuccessNotification(false), 5000);
        } else {
            setSuccessNotification(false);
            setFailedNotification(true);
            setTimeout(() => setFailedNotification(false), 5000);
        }
    };
    const handlePreviousPageChange = () => {
        setPageNumber(pageNumber - 1);
    };
    const handleNextPageChange = () => {
        setPageNumber(pageNumber + 1);
    };

    useEffect(() => {
        const handleDelete = async (id) => {
            try {
                confirmAlert({
                    customUI: ({ onClose }) => {
                        return (
                            <Card>
                                <CardHeader color={'primary'}>
                                    <h3>Bạn có chắc?</h3>
                                </CardHeader>
                                <CardBody>
                                    <p>Bạn có chắc muốn xóa mẫu này?</p>
                                </CardBody>
                                <CardFooter>
                                    <Button
                                        color={'danger'}
                                        onClick={async () => {
                                            onClose();
                                            const { error } = await deleteData(
                                                `pattern/${id}`
                                            );
                                            if (error) {
                                                setErrorMessage(error.cause);
                                                showNotification(
                                                    notificationType.FAILED
                                                );
                                                return;
                                            }
                                            showNotification(
                                                notificationType.SUCCESS
                                            );
                                            window.location.href = ROOT_PATH;
                                        }}
                                    >
                                        Xác nhận
                                    </Button>
                                    <Button
                                        color={'primary'}
                                        onClick={onClose}
                                        className={classes.actionButton}
                                    >
                                        Thoát
                                    </Button>
                                </CardFooter>
                            </Card>
                        );
                    },
                });
            } catch (error) {
                setErrorMessage(error.message);
                showNotification(notificationType.FAILED);
            }
        };
        const truncateSourceUrl = (url, num = 70) => {
            if (url.length <= num) {
                return url;
            }
            return url.slice(0, num) + '...';
        };

        (async () => {
            let { patterns, hasNext } = await getData(
                'patterns',
                {
                    key: 'offset',
                    value: pageNumber * LIMIT,
                },
                { key: 'limit', value: LIMIT }
            );
            patterns = patterns.map(({ id, sourceUrl }) => [
                id,
                truncateSourceUrl(sourceUrl),
                <GridContainer>
                    <GridItem xs={12} sm={12} md={4}>
                        <Link to={`${DETAIL_PATH}/${id}`}>
                            <Button color={'info'} size={'sm'}>
                                <Info />
                            </Button>
                        </Link>
                    </GridItem>
                    <GridItem xs={12} sm={12} md={4}>
                        <Link to={`${EDIT_PATH}/${id}`}>
                            <Button color={'warning'} size={'sm'}>
                                <Edit />
                            </Button>
                        </Link>
                    </GridItem>
                    <GridItem xs={12} sm={12} md={4}>
                        <Button
                            color={'danger'}
                            size={'sm'}
                            onClick={() => handleDelete(id)}
                        >
                            <Delete />
                        </Button>
                    </GridItem>
                </GridContainer>,
            ]);
            setPatterns({ patterns: patterns, hasNext });
        })();
    }, [pageNumber, classes]);

    return (
        <GridContainer>
            <Snackbar
                place="tc"
                color="success"
                icon={CheckCircle}
                message="Thành công"
                open={successNotification}
                closeNotification={() => setSuccessNotification(false)}
                close
            />
            <Snackbar
                place="tc"
                color="danger"
                icon={AddAlert}
                message={errorMessage}
                open={failedNotification}
                closeNotification={() => setFailedNotification(false)}
                close
            />
            <GridItem xs={12} sm={12} md={6}>
                <Card>
                    <CardHeader color="primary">
                        <h4 className={classes.cardTitleWhite}>
                            Danh sách mẫu dữ liệu
                        </h4>
                        <p className={classes.cardCategoryWhite}>
                            Danh sách các mẫu để xác định vị trí dữ liệu cần rút
                            trích
                        </p>
                    </CardHeader>
                    <CardBody>
                        <Link to={ADD_PATH}>
                            <Button color={'info'}>
                                <Add />
                            </Button>
                        </Link>
                        <Table
                            tableHeaderColor="primary"
                            tableHead={['ID', 'URL nguồn', '']}
                            tableData={patterns.patterns}
                        />
                    </CardBody>
                    <CardFooter>
                        <Button
                            type="button"
                            color="primary"
                            onClick={handlePreviousPageChange}
                            disabled={pageNumber === 0}
                        >
                            Trang trước
                        </Button>
                        <Button
                            type="button"
                            color="primary"
                            onClick={handleNextPageChange}
                            disabled={!patterns.hasNext}
                        >
                            Trang sau
                        </Button>
                    </CardFooter>
                </Card>
            </GridItem>
            <GridItem xs={12} sm={12} md={6}>
                <Switch>
                    <Route
                        path={`${match.path}/detail/:id`}
                        component={PatternDetail}
                    />
                    <Route
                        path={`${match.path}/edit/:id`}
                        component={PatternEdit}
                    />
                    <Route
                        path={`${match.path}/create`}
                        component={() => <PatternEdit isCreate={true} />}
                    />
                    <Redirect from={`${ROOT_PATH}/`} to={ROOT_PATH} />
                </Switch>
            </GridItem>
        </GridContainer>
    );
}
