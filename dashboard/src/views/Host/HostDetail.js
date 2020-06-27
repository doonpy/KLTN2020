import React, { useEffect, useState } from 'react';
// @material-ui/core components
import { makeStyles } from '@material-ui/core/styles';
// core components
import GridItem from 'components/Grid/GridItem.js';
import GridContainer from 'components/Grid/GridContainer.js';
import Card from 'components/Card/Card.js';
import CardHeader from 'components/Card/CardHeader.js';
import CardBody from 'components/Card/CardBody.js';
import Primary from '../../components/Typography/Primary';
import { AddAlert } from '@material-ui/icons';
import { useRouteMatch } from 'react-router-dom';
import { getData } from '../../services/ApiService';
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

export default function HostDetail() {
    const classes = useStyles();
    const [host, setHost] = useState({ domain: '', name: '' });
    const [failedNotification, setFailedNotification] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const hostId = useRouteMatch().params.id;
    const showErrorNotification = () => {
        setFailedNotification(true);
        setTimeout(() => setFailedNotification(false), 5000);
    };

    useEffect(() => {
        (async () => {
            const { host, error } = await getData(`host/${hostId}`);
            if (error) {
                setErrorMessage(error.cause);
                showErrorNotification();
                window.location.href = '/admin/host';
                return;
            }
            setHost(host);
        })();
    }, [hostId]);
    return (
        <div>
            <Card>
                <CardHeader color="primary">
                    <h4 className={classes.cardTitleWhite}>Chi tiết máy chủ</h4>
                </CardHeader>
                <CardBody>
                    <Snackbar
                        place="tc"
                        color="danger"
                        icon={AddAlert}
                        message={errorMessage}
                        open={failedNotification}
                        closeNotification={() => setFailedNotification(false)}
                        close
                    />
                    <GridContainer>
                        <GridItem xs={12} sm={12} md={6}>
                            <h4>
                                <Primary>ID:</Primary> {host.id}
                            </h4>
                        </GridItem>
                        <GridItem xs={12} sm={12} md={6}>
                            <h4>
                                <Primary>Tên miền:</Primary> {host.domain}
                            </h4>
                        </GridItem>
                        <GridItem xs={12} sm={12} md={12}>
                            <h4>
                                <Primary>Tên:</Primary> {host.name}
                            </h4>
                        </GridItem>
                        <GridItem xs={12} sm={12} md={6}>
                            <h4>
                                <Primary>Ngày tạo:</Primary>{' '}
                                {new Date(host.createAt).toLocaleString()}
                            </h4>
                        </GridItem>
                        <GridItem xs={12} sm={12} md={6}>
                            <h4>
                                <Primary>Ngày chỉnh sửa cuối:</Primary>{' '}
                                {new Date(host.updateAt).toLocaleString()}
                            </h4>
                        </GridItem>{' '}
                    </GridContainer>
                </CardBody>
            </Card>
        </div>
    );
}
