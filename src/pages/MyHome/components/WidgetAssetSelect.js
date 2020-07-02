/*
 * @Author: Eason
 * @Date: 2020-04-03 11:20:59
 * @Last Modified by: Eason
 * @Last Modified time: 2020-07-02 09:29:06
 */

import React, { PureComponent } from 'react';
import cls from 'classnames';
import { includes } from 'lodash';
import PropTypes from 'prop-types';
import { Button, Drawer } from 'antd';
import { ScrollBar } from 'suid';
import WidgetAssets from './WidgetAssets';
import styles from './WidgetAssetSelect.less';

class WidgetAssetSelect extends PureComponent {
  static propTypes = {
    onPanelAssetsClose: PropTypes.func,
    onAddWidget: PropTypes.func,
    doneKeys: PropTypes.array,
    loadingWidgetInstance: PropTypes.bool,
    loadingWidgetId: PropTypes.string,
    showWidgetAssets: PropTypes.bool,
    widgetAssetList: PropTypes.array,
    loading: PropTypes.bool,
  };

  constructor(props) {
    super(props);
    this.state = {
      showShadow: false,
    };
  }

  handlerClose = () => {
    const { onPanelAssetsClose } = this.props;
    if (onPanelAssetsClose) {
      onPanelAssetsClose();
    }
  };

  handlerAdd = (item, e) => {
    e && e.stopPropagation();
    const { onAddWidget } = this.props;
    if (onAddWidget) {
      onAddWidget(item);
    }
  };

  handerScrollDown = () => {
    this.setState({ showShadow: true });
  };

  handerYReachStart = () => {
    this.setState({ showShadow: false });
  };

  renderExtra = item => {
    const { doneKeys, loadingWidgetInstance, loadingWidgetId } = this.props;
    const btnProps = {
      type: 'primary',
      loading: item.id === loadingWidgetId && loadingWidgetInstance,
      disabled: includes(doneKeys, item.id),
      onClick: e => this.handlerAdd(item, e),
    };
    return <Button {...btnProps}>添加</Button>;
  };

  render() {
    const { showShadow } = this.state;
    const { showWidgetAssets, widgetAssetList, loading } = this.props;
    let headerStyle = {};
    if (showShadow) {
      headerStyle = {
        boxShadow: ' 0 2px 8px rgba(0, 0, 0, 0.15)',
        zIndex: 1,
      };
    }
    const widgetAssetsProps = {
      widgetAssetList,
      loading,
      extra: this.renderExtra,
    };
    return (
      <Drawer
        title="组件资源 (快捷键关闭 ESC)"
        placement="right"
        width={420}
        className={cls(styles['assets-box'])}
        headerStyle={headerStyle}
        getContainer={false}
        style={{ position: 'absolute' }}
        onClose={this.handlerClose}
        visible={showWidgetAssets}
      >
        <ScrollBar onYReachStart={this.handerYReachStart} onScrollDown={this.handerScrollDown}>
          <WidgetAssets {...widgetAssetsProps} />
        </ScrollBar>
      </Drawer>
    );
  }
}

export default WidgetAssetSelect;
