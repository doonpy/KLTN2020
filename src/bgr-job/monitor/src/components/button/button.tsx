import React, { MouseEventHandler } from 'react';
import { Button, PropTypes } from '@material-ui/core';

type Props = {
    text: string;
    className?: string;
    style?: {
        color?: PropTypes.Color;
        disableElevation?: boolean;
        disableFocusRipple?: boolean;
        endIcon?: React.ReactNode;
        fullWidth?: boolean;
        href?: string;
        size?: 'small' | 'medium' | 'large';
        startIcon?: React.ReactNode;
        variant?: 'text' | 'outlined' | 'contained';
    };
    onClickHandler?: MouseEventHandler;
    disabled?: boolean;
};

/**
 * @param {Props} props
 * @constructor
 */
export default function ButtonComponent({ text, className, style, onClickHandler, disabled }: Props): JSX.Element {
    if (style) {
        return (
            <Button
                variant={style.variant}
                color={style.color}
                size={style.size}
                href={style.href}
                startIcon={style.startIcon}
                fullWidth={style.fullWidth}
                endIcon={style.endIcon}
                disableFocusRipple={style.disableFocusRipple}
                disableElevation={style.disableElevation}
                onClick={onClickHandler}
                className={className}
                disabled={disabled}
            >
                {text}
            </Button>
        );
    }

    return (
        <Button onClick={onClickHandler} className={className}>
            {text}
        </Button>
    );
}
