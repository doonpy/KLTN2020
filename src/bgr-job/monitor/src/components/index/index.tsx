import React, { useState } from 'react';
import ButtonComponent from '../button/button';
import SocketClient from '../../services/socket/socket';
import { Grid, Snackbar } from '@material-ui/core';
import OverViewComponent from '../monitor-view/overview';
import MuiAlert, { AlertProps } from '@material-ui/lab/Alert';
import TargetListComponent from '../monitor-view/target-list';

const socket: SocketIOClient.Socket = SocketClient.getInstance();

/**
 * @constructor
 */
const Index = (): JSX.Element => {
    const [dateTime, setDateTime]: [string, Function] = useState('null');
    const [successOpen, setSuccessOpen] = useState(false);
    const [errorOpen, setErrorOpen] = useState(false);

    socket.on('start', (result: boolean): void => {
        if (!result) {
            setErrorOpen(true);
            return;
        }

        setSuccessOpen(true);
    });

    setInterval((): void => {
        setDateTime(new Date().toUTCString());
    }, 1000);

    function Alert(props: AlertProps): JSX.Element {
        return <MuiAlert elevation={6} variant="filled" {...props} />;
    }

    const handleSuccessClose = (event?: React.SyntheticEvent, reason?: string): void => {
        if (reason === 'clickaway') {
            return;
        }

        setSuccessOpen(false);
    };

    const handleErrorClose = (event?: React.SyntheticEvent, reason?: string): void => {
        if (reason === 'clickaway') {
            return;
        }

        setErrorOpen(false);
    };

    /**
     * Handle click start button event
     */
    function handleStartEvent(): void {
        socket.emit('start');
    }

    return (
        <Grid container alignItems="center" spacing={3}>
            <Grid item xs={12}>
                {dateTime}
            </Grid>
            <Grid item xs={12}>
                <Snackbar open={successOpen} autoHideDuration={5000} onClose={handleSuccessClose}>
                    <Alert onClose={handleSuccessClose} severity="success">
                        Success!
                    </Alert>
                </Snackbar>
                <Snackbar open={errorOpen} autoHideDuration={5000} onClose={handleErrorClose}>
                    <Alert onClose={handleErrorClose} severity="error">
                        Failed!
                    </Alert>
                </Snackbar>
                <ButtonComponent
                    text={'Start'}
                    className={'start-button'}
                    onClickHandler={handleStartEvent}
                    style={{ variant: 'contained', color: 'primary' }}
                />
            </Grid>
            <Grid item xs={12}>
                <OverViewComponent/>
            </Grid>
            <Grid item xs={12}>
                <TargetListComponent/>
            </Grid>
        </Grid>
    );
};

export default Index;
