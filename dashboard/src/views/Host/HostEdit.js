import React, { useEffect, useState } from 'react';
import { useParams, useRouteMatch } from 'react-router-dom';
// @material-ui/core components
import { makeStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
// core components
import GridItem from 'components/Grid/GridItem.js';
import GridContainer from 'components/Grid/GridContainer.js';
import CustomInput from 'components/CustomInput/CustomInput.js';
import Button from 'components/CustomButtons/Button.js';
import Card from 'components/Card/Card.js';
import CardHeader from 'components/Card/CardHeader.js';
import CardBody from 'components/Card/CardBody.js';
import CardFooter from 'components/Card/CardFooter.js';
import { createData, getData, updateData } from '../../services/ApiService';
import { AddAlert, CheckCircle, Error } from '@material-ui/icons';
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
const notificationType = {
    SUCCESS: 0,
    FAILED: 1,
};

export default function HostEdit({ isCreate }) {
    const classes = useStyles();
    const [host, setHost] = useState({ domain: '', name: '' });
    const [successNotification, setSuccessNotification] = useState(false);
    const [failedNotification, setFailedNotification] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const cardTitle = isCreate ? 'Thêm máy chủ' : 'Chỉnh sửa máy chủ';
    const hostId = useRouteMatch().params.id;

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
    const handleSaveButton = async () => {
        try {
            const { error } = isCreate
                ? await createData(`hosts`, host)
                : await updateData(`host/${host.id}`, host);

            if (error) {
                setErrorMessage(error.message);
                showNotification(notificationType.FAILED);
            } else {
                showNotification(notificationType.SUCCESS);
                window.location.href = `/admin/host/detail/${host.id}`;
            }
        } catch (error) {
            setErrorMessage(error.message);
            showNotification(notificationType.FAILED);
        }
    };
    const handleNameChange = (event) => {
        setHost({ ...host, name: event.target.value });
    };
    const handleDomainChange = (event) => {
        setHost({ ...host, domain: event.target.value });
    };

    useEffect(() => {
        if (isCreate) return;
        (async () => {
            const { host, error } = await getData(`host/${hostId}`);
            if (error) {
                setErrorMessage(error.cause);
                showNotification(notificationType.FAILED);
                window.location.href = '/admin/host';
                return;
            }
            setHost(host);
        })();
    }, [hostId]);

    return (
        <div>
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
            <Card>
                <CardHeader color="primary">
                    <h4 className={classes.cardTitleWhite}>{cardTitle}</h4>
                </CardHeader>
                <CardBody>
                    <GridContainer>
                        <GridItem xs={12} sm={12} md={6}>
                            <CustomInput
                                labelText="Tên"
                                id="name"
                                formControlProps={{
                                    fullWidth: true,
                                }}
                                inputProps={{
                                    value: host.name,
                                    onChange: handleNameChange,
                                }}
                            />
                        </GridItem>
                        <GridItem xs={12} sm={12} md={6}>
                            <CustomInput
                                labelText="Tên miền"
                                id="domain"
                                formControlProps={{
                                    fullWidth: true,
                                }}
                                inputProps={{
                                    value: host.domain,
                                    onChange: handleDomainChange,
                                }}
                            />
                        </GridItem>
                    </GridContainer>
                </CardBody>
                <CardFooter>
                    <Button color="primary" onClick={handleSaveButton}>
                        Lưu
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}
