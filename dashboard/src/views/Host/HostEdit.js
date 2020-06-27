import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
import { CheckCircle, Error } from '@material-ui/icons';
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

export default function HostEdit({ host }) {
    const classes = useStyles();
    const cardTitle = host ? 'Thêm máy chủ' : 'Chỉnh sửa máy chủ';
    const [data, setData] = useState({});

    const handleNameChange = (event) => {
        setData({ ...data, name: event.target.value });
    };
    const handleDomainChange = (event) => {
        setData({ ...data, domain: event.target.value });
    };
    const handleSave = async () => {
        try {
            const { error, id } = isCreate
                ? await createData(`hosts`, data)
                : await updateData(`host/${hostId}`, data);
            console.log(error);
            if (error) {
                setErrorMessage(error.message);
                showNotification(notificationType.FAILED);
            } else {
                showNotification(notificationType.SUCCESS);
                window.location.href = `/admin/host/detail/${hostId || id}`;
            }
        } catch (error) {
            throw error;
        }
    };

    return (
        <div>
            <GridContainer>
                <GridItem xs={12} sm={12} md={12}>
                    <Card>
                        <CardHeader color="primary">
                            <h4 className={classes.cardTitleWhite}>
                                {cardTitle}
                            </h4>
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
                                            placeholder: data.name,
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
                                            placeholder: data.domain,
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
                </GridItem>
            </GridContainer>
        </div>
    );
}
