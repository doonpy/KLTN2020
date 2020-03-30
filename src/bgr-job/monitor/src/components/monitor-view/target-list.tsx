import React, { useState } from 'react';
import SocketClient from '../../services/socket/socket';
import { Grid, Typography } from '@material-ui/core';

export default function TargetListComponent(): JSX.Element {
    const [targetList, setTargetList]: [Array<Array<string>>, Function] = useState([]);
    const socket: SocketIOClient.Socket = SocketClient.getInstance();

    socket.on('monitor-target-list', (data: Array<Array<string>>): void => {
        setTargetList(data);
    });

    return (
        <Grid container justify="center">
            {targetList.map(
                (list, key): JSX.Element => {
                    return (
                        <Grid item xs={4} justify={'center'} key={key}>
                            <Typography variant={'h5'}>Thread {key}</Typography>
                            {list.map(
                                (item, key): JSX.Element => {
                                    return (
                                        <Typography key={key}>
                                            {key + 1}. {item}
                                        </Typography>
                                    );
                                },
                            )}
                        </Grid>
                    );
                },
            )}
        </Grid>
    );
}
