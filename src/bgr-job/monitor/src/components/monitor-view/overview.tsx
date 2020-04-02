import React, { useState } from 'react';
import SocketClient from '../../services/socket/socket';
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@material-ui/core';

type MonitorContent = Array<{
    pid: number;
    remainTasks: number;
    status: boolean;
}>;

interface Column {
    id: 'pid' | 'remainTasks' | 'status';
    label: string;
    minWidth?: number;
    align?: 'right';
    format?: (value: boolean | string) => string;
}

const columns: Column[] = [
    { id: 'pid', label: 'PID', minWidth: 100 },
    { id: 'remainTasks', label: 'Remain tasks', minWidth: 100 },
    {
        id: 'status',
        label: 'Status',
        minWidth: 100,
        format: (value): string => (value ? 'Running' : 'Stop'),
    },
];

export default function OverViewComponent(): JSX.Element {
    const [monitorContent, setMonitorContent]: [MonitorContent, Function] = useState([]);
    const socket: SocketIOClient.Socket = SocketClient.getInstance();

    socket.on('monitor-overview', (data: MonitorContent): void => {
        setMonitorContent(data);
    });

    return (
        <Paper>
            <TableContainer>
                <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                        <TableRow>
                            {columns.map(
                                (column): JSX.Element => (
                                    <TableCell
                                        key={column.id}
                                        align={column.align}
                                        style={{ minWidth: column.minWidth }}
                                    >
                                        {column.label}
                                    </TableCell>
                                ),
                            )}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {monitorContent.map(
                            (row): JSX.Element => {
                                if (!row.pid) {
                                    return <TableRow></TableRow>;
                                }
                                return (
                                    <TableRow hover role="checkbox" tabIndex={-1} key={row.pid}>
                                        {columns.map((column) => {
                                            const value: string | boolean | Array<string> | number = row[column.id];
                                            return (
                                                <TableCell key={column.id} align={column.align}>
                                                    {column.format ? column.format(value as boolean | string) : value}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                );
                            },
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
}
