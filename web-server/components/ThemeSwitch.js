import React from 'react';
import Switch from 'react-switch';
import { FaMoon, FaSun } from 'react-icons/fa';
import useDarkMode from 'use-dark-mode';

const MODE_TRANSITION_CLASS_NAME = 'dark-mode-transition';
const MODE_TRANSITION_DURATION = 500;

function setDarkModeTransition() {
    document.documentElement.classList.add(MODE_TRANSITION_CLASS_NAME);
    setTimeout(() => document.documentElement.classList.remove(MODE_TRANSITION_CLASS_NAME), MODE_TRANSITION_DURATION);
}
const ThemeSwitch = () => {
    const { value: hasActiveDarkMode, toggle: activateDarkMode } = useDarkMode();

    const toggleDarkMode = () => {
        setDarkModeTransition();
        activateDarkMode();
    };
    return (
        <Switch
            onChange={toggleDarkMode}
            checked={hasActiveDarkMode}
            checkedIcon={<FaMoon className="inline-block mx-2 my-1 text-yellow-400" />}
            uncheckedIcon={<FaSun className="inline-block mx-2 my-1 text-orange-500" />}
            onColor="#1a202c"
            offColor="#f7fafc"
            onHandleColor="#f7fafc"
            offHandleColor="#1a202c"
            className="text-gray-900 dark:text-gray-100 border border-gray-400 dark:border-0"
        />
    );
};

export default ThemeSwitch;
