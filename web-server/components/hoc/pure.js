/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/jsx-props-no-spreading */
import { PureComponent } from 'react';

export default function (Comp) {
    return class extends PureComponent {
        render() {
            return <Comp {...this.props} />;
        }
    };
}
