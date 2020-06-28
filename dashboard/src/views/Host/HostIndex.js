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
import HostEdit from './HostEdit';
import HostDetail from './HostDetail';
import { win } from 'leaflet/src/core/Browser';
import Snackbar from '../../components/Snackbar/Snackbar';

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
const LIMIT = 100;
const ROOT_PATH = '/admin/host';
const ADD_PATH = '/admin/host/create';
const DETAIL_PATH = '/admin/host/detail';
const EDIT_PATH = '/admin/host/edit';
const notificationType = {
    SUCCESS: 0,
    FAILED: 1,
};

export default function HostIndex() {
    const match = useRouteMatch();
    console.log(match);
    const classes = useStyles();
    const [successNotification, setSuccessNotification] = useState(false);
    const [failedNotification, setFailedNotification] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [hosts, setHosts] = useState({ hosts: [], hasNext: false });
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
    const handleDelete = async (id) => {
        try {
            confirmAlert({
                customUI: ({ onClose }) => {
                    return (
                        <Card>
                            <CardHeader color={'info'}>
                                <h2>Bạn có chắc?</h2>
                            </CardHeader>
                            <CardBody>
                                <p>Bạn có chắc muốn xóa máy chủ này?</p>
                            </CardBody>
                            <CardFooter>
                                <Button
                                    color={'danger'}
                                    onClick={async () => {
                                        onClose();
                                        const { error } = await deleteData(
                                            `host/${id}`
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

    useEffect(() => {
        (async () => {
            let { hosts, hasNext } = await getData('hosts', {
                key: 'offset',
                value: pageNumber * LIMIT,
            });
            hosts = hosts.map(({ id, name, domain }) => [
                id,
                name,
                domain,
                <div>
                    <Link to={`${DETAIL_PATH}/${id}`}>
                        <Button
                            color={'info'}
                            size={'sm'}
                            className={classes.actionButton}
                        >
                            <Info />
                        </Button>
                    </Link>
                    <Link to={`${EDIT_PATH}/${id}`}>
                        <Button
                            color={'warning'}
                            size={'sm'}
                            className={classes.actionButton}
                        >
                            <Edit />
                        </Button>
                    </Link>
                    <Button
                        color={'danger'}
                        size={'sm'}
                        className={classes.actionButton}
                        onClick={() => handleDelete(id)}
                    >
                        <Delete />
                    </Button>
                </div>,
            ]);
            setHosts({ hosts, hasNext });
        })();
    }, [pageNumber]);

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
            <GridItem xs={12} sm={12} md={8}>
                <Card>
                    <CardHeader color="primary">
                        <h4 className={classes.cardTitleWhite}>
                            Danh sách máy chủ
                        </h4>
                        <p className={classes.cardCategoryWhite}>
                            Danh sách các máy chủ để thu thập dữ liệu bất động
                            sản
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
                            tableHead={['ID', 'Tên', 'Tên miền', '']}
                            tableData={hosts.hosts}
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
                            disabled={!hosts.hasNext}
                        >
                            Trang sau
                        </Button>
                    </CardFooter>
                </Card>
            </GridItem>
            <GridItem xs={12} sm={12} md={4}>
                <Switch>
                    <Route
                        path={`${match.path}/detail/:id`}
                        component={HostDetail}
                    />
                    <Route
                        path={`${match.path}/edit/:id`}
                        component={HostEdit}
                    />
                    <Route
                        path={`${match.path}/create`}
                        component={() => <HostEdit isCreate={true} />}
                    />
                    <Redirect from={`${ROOT_PATH}/`} to={ROOT_PATH} />
                </Switch>
            </GridItem>
        </GridContainer>
    );
}
