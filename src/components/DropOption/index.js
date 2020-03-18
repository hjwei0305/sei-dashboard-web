import React, { PureComponent } from 'react';
import { Dropdown } from 'antd';
import classNames from 'classnames';
import styles from './index.less';

export default class DropOption extends PureComponent {
  render() {
    const { overlayClassName, ...props } = this.props;
    return (
      <Dropdown
        trigger={['click']}
        overlayClassName={classNames(styles.container, overlayClassName)}
        {...props}
      />
    );
  }
}
