/*
 * @Author: Eason
 * @Date: 2020-04-03 11:21:17
 * @Last Modified by: Eason
 * @Last Modified time: 2020-04-27 14:30:48
 */

import React, { Component } from 'react';
import cls from 'classnames';
import { Button, Popover } from 'antd';
import Form from './Form';
import styles from './index.less';

class SceneAdd extends Component {
  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  handlerPopoverHide = () => {
    this.setState({
      visible: false,
    });
  };

  handlerShowChange = visible => {
    this.setState({ visible });
  };

  render() {
    const { visible } = this.state;
    const popoverProps = {
      handlerPopoverHide: this.handlerPopoverHide,
      ...this.props,
    };
    return (
      <Popover
        trigger="click"
        placement="leftTop"
        visible={visible}
        key="form-popover-box"
        destroyTooltipOnHide
        onVisibleChange={v => this.handlerShowChange(v)}
        overlayClassName={cls(styles['form-popover-box'])}
        content={<Form {...popoverProps} />}
      >
        <span className={cls('form-popover-box-trigger')}>
          <Button icon="plus" type="link">
            {formatMessage({id: 'dashboard_000050', defaultMessage: '场景'})}
          </Button>
        </span>
      </Popover>
    );
  }
}

export default SceneAdd;
