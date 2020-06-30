import React, { useEffect, useState } from 'react';
import { useRouteMatch } from 'react-router-dom';
// @material-ui/core components
import { makeStyles } from '@material-ui/core/styles';
// core components
import GridItem from 'components/Grid/GridItem.js';
import GridContainer from 'components/Grid/GridContainer.js';
import CustomInput from 'components/CustomInput/CustomInput.js';
import Button from 'components/CustomButtons/Button.js';
import Card from 'components/Card/Card.js';
import CardHeader from 'components/Card/CardHeader.js';
import CardBody from 'components/Card/CardBody.js';
import {
    createData,
    getApiServer,
    getData,
    updateData,
} from '../../services/ApiService';
import { CheckCircle, Error } from '@material-ui/icons';
import Snackbar from '../../components/Snackbar/Snackbar';
import CustomSelect from '../../components/CustomSelect/CustomSelect';
import Primary from '../../components/Typography/Primary';
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
    actionButton: {
        marginRight: '10px',
    },
};

const useStyles = makeStyles(styles);
const notificationType = {
    SUCCESS: 0,
    FAILED: 1,
};

export default function CatalogEdit({ isCreate }) {
    const classes = useStyles();
    const [catalog, setCatalog] = useState({
        title: '',
        url: '',
        host: { id: NaN },
        pattern: { id: NaN },
        locator: { detailUrl: '', pageNumber: '' },
    });
    const [hostIdList, setHostIdList] = useState([]);
    const [patternIdList, setPatternIdList] = useState([]);
    const [filePath, setFilePath] = useState('');
    const [successNotification, setSuccessNotification] = useState(false);
    const [failedNotification, setFailedNotification] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const cardTitle = isCreate ? 'Thêm danh mục' : 'Chỉnh sửa danh mục';
    const catalogId = useRouteMatch().params.id;

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
            const requestBody = {
                ...catalog,
                hostId: Number(catalog.host.id),
                patternId: Number(catalog.pattern.id),
            };
            delete requestBody.host;
            delete requestBody.pattern;
            const { error, id } = isCreate
                ? await createData(`catalogs`, requestBody)
                : await updateData(`catalog/${requestBody.id}`, requestBody);

            if (error) {
                setErrorMessage(error.message);
                showNotification(notificationType.FAILED);
            } else {
                showNotification(notificationType.SUCCESS);
                window.location.href = `/admin/catalog/detail/${id}`;
            }
        } catch (error) {
            setErrorMessage(error.message);
            showNotification(notificationType.FAILED);
        }
    };
    const handleTitleChange = (event) => {
        setCatalog({ ...catalog, title: event.target.value });
    };
    const handleUrlChange = (event) => {
        setCatalog({ ...catalog, url: event.target.value });
    };
    const handleHostIdChange = (event) => {
        setCatalog({ ...catalog, host: { id: event.target.value } });
    };
    const handlePatternIdChange = (event) => {
        setCatalog({ ...catalog, pattern: { id: event.target.value } });
    };
    const handleDetailUrlLocatorChange = (event) => {
        setCatalog({
            ...catalog,
            locator: { ...catalog.locator, detailUrl: event.target.value },
        });
    };
    const handlePageNumberLocatorChange = (event) => {
        setCatalog({
            ...catalog,
            locator: { ...catalog.locator, pageNumber: event.target.value },
        });
    };
    const handleReviewButton = async () => {
        try {
            const { filePath, error } = await createData(
                `catalogs/catalog-review`,
                {
                    locator: catalog.locator,
                    url: catalog.url,
                }
            );
            if (error) {
                setErrorMessage(error.cause);
                showNotification(notificationType.FAILED);
                return;
            }
            setFilePath(filePath + `?t=${new Date().getTime()}`);
        } catch (error) {
            setErrorMessage(error.cause);
            showNotification(notificationType.FAILED);
        }
    };

    useEffect(() => {
        const handleError = (error) => {
            setErrorMessage(error.cause);
            showNotification(notificationType.FAILED);
            window.location.href = '/admin/catalog';
        };
        (async () => {
            const { hosts, error } = await getData(`hosts`, {
                key: 'limit',
                value: 100,
            });
            if (error) {
                handleError(error);
                return;
            }
            setHostIdList(
                hosts.map(({ id, name }) =>
                    Object({
                        value: id,
                        text: name,
                    })
                )
            );
        })();
        (async () => {
            const { patterns, error } = await getData(`patterns`, {
                key: 'limit',
                value: 100,
            });
            if (error) {
                handleError(error);
                return;
            }
            setPatternIdList(
                patterns.map(({ id, sourceUrl }) =>
                    Object({
                        value: id,
                        text: sourceUrl,
                    })
                )
            );
        })();
        if (isCreate) return;
        (async () => {
            let result = await getData(`catalog/${catalogId}`);
            if (result.error) {
                handleError(result.error);
                return;
            }
            setCatalog(result.catalog);
            result = await createData(`catalogs/catalog-review`, {
                url: result.catalog.url,
                locator: result.catalog.locator,
            });
            if (result.error) {
                handleError(result.error);
                return;
            }
            setFilePath(result.filePath);
        })();
    }, [catalogId, isCreate]);

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
                icon={Error}
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
                            <Button
                                color="primary"
                                onClick={handleSaveButton}
                                className={classes.actionButton}
                            >
                                Lưu
                            </Button>
                            <Button
                                color="info"
                                onClick={handleReviewButton}
                                disabled={!catalog.url}
                            >
                                Xem trước
                            </Button>
                        </GridItem>
                        <GridItem xs={12} sm={12} md={12}>
                            {filePath && (
                                <LiveViewIframe
                                    src={`${getApiServer()}/${filePath}`}
                                />
                            )}
                        </GridItem>
                        <GridItem xs={12} sm={12} md={12}>
                            <CustomInput
                                labelText="Tên"
                                id="title"
                                formControlProps={{
                                    fullWidth: true,
                                }}
                                inputProps={{
                                    required: true,
                                    value: catalog.title,
                                    onChange: handleTitleChange,
                                }}
                            />
                        </GridItem>
                        <GridItem xs={12} sm={12} md={12}>
                            <CustomInput
                                labelText="URL"
                                id="url"
                                formControlProps={{
                                    fullWidth: true,
                                }}
                                inputProps={{
                                    required: true,
                                    value: catalog.url,
                                    onChange: handleUrlChange,
                                }}
                            />
                        </GridItem>
                        <GridItem xs={12} sm={12} md={12}>
                            <CustomSelect
                                labelText="ID máy chủ"
                                id="hostId"
                                formControlProps={{
                                    fullWidth: true,
                                }}
                                selectProps={{
                                    value: catalog.host.id.toString(),
                                    onChange: handleHostIdChange,
                                }}
                                items={hostIdList}
                            />
                        </GridItem>
                        <GridItem xs={12} sm={12} md={12}>
                            <CustomSelect
                                labelText="ID mẫu"
                                id="patternId"
                                formControlProps={{
                                    fullWidth: true,
                                }}
                                selectProps={{
                                    value: catalog.pattern.id.toString(),
                                    onChange: handlePatternIdChange,
                                }}
                                items={patternIdList}
                            />
                        </GridItem>
                        <GridItem xs={12} sm={12} md={12}>
                            <CustomInput
                                labelText="CSS selector URL trang chi tiết bất động sản"
                                id="locatorDetailUrl"
                                formControlProps={{
                                    fullWidth: true,
                                }}
                                inputProps={{
                                    required: true,
                                    multiline: true,
                                    value: catalog.locator.detailUrl,
                                    onChange: handleDetailUrlLocatorChange,
                                }}
                            />
                        </GridItem>
                        <GridItem xs={12} sm={12} md={12}>
                            <CustomInput
                                labelText="CSS selector URL phân trang"
                                id="locatorPageNumber"
                                formControlProps={{
                                    fullWidth: true,
                                }}
                                inputProps={{
                                    required: true,
                                    multiline: true,
                                    value: catalog.locator.pageNumber,
                                    onChange: handlePageNumberLocatorChange,
                                }}
                            />
                        </GridItem>
                    </GridContainer>
                </CardBody>
            </Card>
        </div>
    );
}
