import React, { useState, useEffect } from 'react';
import { useRouteMatch, Route, Switch } from 'react-router-dom';
// react plugin for creating charts
// @material-ui/core
import { makeStyles } from '@material-ui/core/styles';
// @material-ui/icons
import { CheckCircle, Delete, Error, Info } from '@material-ui/icons';
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
import {
    createData,
    deleteData,
    getData,
    updateData,
} from '../../services/ApiService';
import HostEdit from './HostEdit';
import HostDetail from './HostDetail';
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
const ADD_PATH = '/admin/host/create';
const DETAIL_PATH = '/admin/host/detail';
const EDIT_PATH = '/admin/host/edit';
const notificationType = {
    SUCCESS: 0,
    FAILED: 1,
};

export default function HostIndex() {
    const match = useRouteMatch();
    const classes = useStyles();
    const [hosts, setHosts] = useState({ hosts: [], hasNext: false });
    const [host, setHost] = useState(false);
    const [hostId, setHostId] = useState(NaN);
    const [pageNumber, setPageNumber] = useState(0);
    const [successNotification, setSuccessNotification] = useState(false);
    const [failedNotification, setFailedNotification] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const showNotification = (type) => {
        if (type === notificationType.SUCCESS) {
            setSuccessNotification(true);
            setTimeout(() => setSuccessNotification(false), 5000);
        } else {
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
    const handleShowDetail = (id) => {
        if (!id) return;
        setHostId(id);
    };
    const handleDelete = async () => {
        const result = window.confirm('Bạn chắc chắn muốn xóa máy chủ này?');
        if (result) {
            const { error } = await deleteData(`host/${host.id}`);
            if (error) {
                window.alert(error.cause);
            }
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
                    <Button
                        color={'info'}
                        size={'sm'}
                        className={classes.actionButton}
                        onClick={() => handleShowDetail(id)}
                    >
                        <Info />
                    </Button>
                    <Link to={`${EDIT_PATH}/${host.id}`}>
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
                        onClick={handleDelete}
                    >
                        <Delete />
                    </Button>
                </div>,
            ]);
            setHosts({ hosts, hasNext });
        })();
    }, [pageNumber]);

    useEffect(() => {
        (async () => {
            const { host } = await getData(`host/${hostId}`);
            if (!host) {
                return;
            }
            setHost(host);
        })();
    }, [hostId]);

    return match.isExact ? (
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
                icon={Error}
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
                <HostDetail host={host} />
            </GridItem>
        </GridContainer>
    ) : (
        <Switch>
            <Route
                path={`${match.path}/detail/:hostId`}
                component={() => <HostDetail />}
            />
            <Route
                path={`${match.path}/edit/:hostId`}
                component={() => <HostEdit isCreate={false} />}
            />
            <Route
                path={`${match.path}/create`}
                component={() => <HostEdit isCreate={true} />}
            />
        </Switch>
    );
}
