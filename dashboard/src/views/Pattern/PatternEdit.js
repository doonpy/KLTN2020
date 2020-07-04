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
import { CheckCircle, Error, RemoveCircle } from '@material-ui/icons';
import Snackbar from '../../components/Snackbar/Snackbar';
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

export default function PatternEdit({ isCreate }) {
    const classes = useStyles();
    const [pattern, setPattern] = useState({
        id: NaN,
        sourceUrl: '',
        mainLocator: {
            postDate: { locator: '', format: '' },
            propertyType: '',
            title: '',
            describe: '',
            price: '',
            acreage: '',
            address: '',
        },
        subLocator: [],
    });
    const [filePath, setFilePath] = useState('');
    const [successNotification, setSuccessNotification] = useState(false);
    const [failedNotification, setFailedNotification] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const cardTitle = isCreate ? 'Thêm mẫu' : 'Chỉnh sửa mẫu';
    const patternId = useRouteMatch().params.id;

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
                ...pattern,
            };
            const { error, id } = isCreate
                ? await createData(`patterns`, requestBody)
                : await updateData(`pattern/${requestBody.id}`, requestBody);

            if (error) {
                setErrorMessage(error.message);
                showNotification(notificationType.FAILED);
            } else {
                showNotification(notificationType.SUCCESS);
                window.location.href = `/admin/pattern/detail/${id}`;
            }
        } catch (error) {
            setErrorMessage(error.message);
            showNotification(notificationType.FAILED);
        }
    };
    const handleSourceUrlChange = (event) => {
        pattern.sourceUrl = event.target.value;
        setPattern({ ...pattern });
    };
    const handlePostDateChange = (key, value) => {
        pattern.mainLocator.postDate[key] = value;
        setPattern({ ...pattern });
    };
    const handleMainLocatorChange = (key, value) => {
        pattern.mainLocator[key] = value;
        setPattern({
            ...pattern,
        });
    };
    const handleSubLocatorChange = (index, key, value) => {
        pattern.subLocator[index][key] = value;
        setPattern({
            ...pattern,
        });
    };
    const handleAddSubLocator = () => {
        pattern.subLocator.push({ name: '', value: '' });
        setPattern({ ...pattern });
    };
    const handleRemoveSubLocator = (index) => {
        pattern.subLocator.splice(index, 1);
        setPattern({ ...pattern });
    };
    const handleReviewButton = async () => {
        try {
            setFilePath('');
            const { filePath, error } = await createData(
                `patterns/pattern-review`,
                {
                    mainLocator: pattern.mainLocator,
                    subLocator: pattern.subLocator,
                    sourceUrl: pattern.sourceUrl,
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
            window.location.href = '/admin/pattern';
        };
        if (isCreate) return;
        (async () => {
            let result = await getData(`pattern/${patternId}`);
            if (result.error) {
                handleError(result.error);
                return;
            }
            setPattern(result.pattern);

            result = await createData(
                `patterns/pattern-review`,
                result.pattern
            );
            if (result.error) {
                handleError(result.error);
                return;
            }
            setFilePath(result.filePath);
        })();
    }, [patternId, isCreate]);

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
                                disabled={!pattern.sourceUrl}
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
                                labelText="URL nguồn"
                                id="sourceUrl"
                                formControlProps={{
                                    fullWidth: true,
                                }}
                                inputProps={{
                                    required: true,
                                    value: pattern.sourceUrl,
                                    onChange: handleSourceUrlChange,
                                }}
                            />
                        </GridItem>
                        <GridItem xs={12} sm={12} md={12}>
                            <CustomInput
                                labelText="CSS Selector ngày đăng:"
                                id="postDateLocator"
                                formControlProps={{
                                    fullWidth: true,
                                }}
                                inputProps={{
                                    required: true,
                                    value: pattern.mainLocator.postDate.locator,
                                    onChange: (event) =>
                                        handlePostDateChange(
                                            'locator',
                                            event.target.value
                                        ),
                                }}
                            />
                            <GridContainer>
                                <GridItem xs={12} sm={12} md={12}>
                                    <CustomInput
                                        labelText="Định dạng ngày đăng:"
                                        id="postDateFormat"
                                        formControlProps={{
                                            fullWidth: true,
                                        }}
                                        inputProps={{
                                            placeholder:
                                                'Ví dụ: dd/mm/yyyy, dd-mm-yyyy',
                                            required: true,
                                            value:
                                                pattern.mainLocator.postDate
                                                    .format,
                                            onChange: (event) =>
                                                handlePostDateChange(
                                                    'format',
                                                    event.target.value
                                                ),
                                        }}
                                    />
                                </GridItem>
                            </GridContainer>
                        </GridItem>
                        <GridItem xs={12} sm={12} md={12}>
                            <CustomInput
                                labelText="CSS Selector tiêu đề:"
                                id="mainLocatorTitle"
                                formControlProps={{
                                    fullWidth: true,
                                }}
                                inputProps={{
                                    required: true,
                                    value: pattern.mainLocator.title,
                                    onChange: (event) =>
                                        handleMainLocatorChange(
                                            'title',
                                            event.target.value
                                        ),
                                }}
                            />
                        </GridItem>
                        <GridItem xs={12} sm={12} md={12}>
                            <CustomInput
                                labelText="CSS Selector mô tả:"
                                id="mainLocatorDescribe"
                                formControlProps={{
                                    fullWidth: true,
                                }}
                                inputProps={{
                                    required: true,
                                    value: pattern.mainLocator.describe,
                                    onChange: (event) =>
                                        handleMainLocatorChange(
                                            'describe',
                                            event.target.value
                                        ),
                                }}
                            />
                        </GridItem>
                        <GridItem xs={12} sm={12} md={12}>
                            <CustomInput
                                labelText="CSS Selector loại bất động sản:"
                                id="mainLocatorPropertyType"
                                formControlProps={{
                                    fullWidth: true,
                                }}
                                inputProps={{
                                    required: true,
                                    value: pattern.mainLocator.propertyType,
                                    onChange: (event) =>
                                        handleMainLocatorChange(
                                            'propertyType',
                                            event.target.value
                                        ),
                                }}
                            />
                        </GridItem>
                        <GridItem xs={12} sm={12} md={12}>
                            <CustomInput
                                labelText="CSS Selector giá:"
                                id="mainLocatorPrice"
                                formControlProps={{
                                    fullWidth: true,
                                }}
                                inputProps={{
                                    required: true,
                                    value: pattern.mainLocator.price,
                                    onChange: (event) =>
                                        handleMainLocatorChange(
                                            'price',
                                            event.target.value
                                        ),
                                }}
                            />
                        </GridItem>
                        <GridItem xs={12} sm={12} md={12}>
                            <CustomInput
                                labelText="CSS Selector diện tích:"
                                id="mainLocatorAcreage"
                                formControlProps={{
                                    fullWidth: true,
                                }}
                                inputProps={{
                                    required: true,
                                    value: pattern.mainLocator.acreage,
                                    onChange: (event) =>
                                        handleMainLocatorChange(
                                            'acreage',
                                            event.target.value
                                        ),
                                }}
                            />
                        </GridItem>
                        <GridItem xs={12} sm={12} md={12}>
                            <CustomInput
                                labelText="CSS Selector địa chỉ:"
                                id="mainLocatorAddress"
                                formControlProps={{
                                    fullWidth: true,
                                }}
                                inputProps={{
                                    required: true,
                                    value: pattern.mainLocator.address,
                                    onChange: (event) =>
                                        handleMainLocatorChange(
                                            'address',
                                            event.target.value
                                        ),
                                }}
                            />
                        </GridItem>
                        {pattern.subLocator.map(({ name, value }, index) => (
                            <GridItem xs={12} sm={12} md={6} key={index}>
                                <Primary>
                                    Thông tin phụ {index + 1}&nbsp;
                                    <RemoveCircle
                                        color={'error'}
                                        fontSize={'small'}
                                        cursor={'pointer'}
                                        onClick={() =>
                                            handleRemoveSubLocator(index)
                                        }
                                    />
                                </Primary>

                                <CustomInput
                                    labelText={`CSS Selector tên:`}
                                    id={`subLocatorName${index + 1}`}
                                    formControlProps={{
                                        fullWidth: true,
                                    }}
                                    inputProps={{
                                        required: true,
                                        value: pattern.subLocator[index].name,
                                        onChange: (event) =>
                                            handleSubLocatorChange(
                                                index,
                                                'name',
                                                event.target.value
                                            ),
                                    }}
                                />
                                <CustomInput
                                    labelText={`CSS Selector giá trị:`}
                                    id={`subLocatorValue${index + 1}`}
                                    formControlProps={{
                                        fullWidth: true,
                                    }}
                                    inputProps={{
                                        required: true,
                                        value: pattern.subLocator[index].value,
                                        onChange: (event) =>
                                            handleSubLocatorChange(
                                                index,
                                                'value',
                                                event.target.value
                                            ),
                                    }}
                                />
                            </GridItem>
                        ))}
                        <GridItem xs={12} sm={12} md={12}>
                            <Button
                                color="success"
                                onClick={handleAddSubLocator}
                            >
                                Thêm thông tin phụ
                            </Button>
                        </GridItem>
                    </GridContainer>
                </CardBody>
            </Card>
        </div>
    );
}
