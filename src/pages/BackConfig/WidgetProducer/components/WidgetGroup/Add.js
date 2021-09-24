import React, { Component } from 'react';
import { Button, Popover } from 'antd';
import cls from 'classnames';
import { formatMessage } from 'umi-plugin-react/locale';
import Form from './Form';
import styles from './index.less';

class GroupAdd extends Component {
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
            {formatMessage({id: 'dashboard_000102', defaultMessage: '看板组'})}
          </Button>
        </span>
      </Popover>
    );
  }
}

export default GroupAdd;
