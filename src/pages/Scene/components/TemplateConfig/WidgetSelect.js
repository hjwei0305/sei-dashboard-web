/*
 * @Author: Eason
 * @Date: 2020-04-03 11:21:17
 * @Last Modified by: Eason
 * @Last Modified time: 2020-04-27 14:31:09
 */

import React, { PureComponent } from 'react';
import cls from 'classnames';
import { connect } from 'dva';
import { includes } from 'lodash';
import PropTypes from 'prop-types';
import { Popover, Button } from 'antd';
import { ExtIcon, ScrollBar } from 'suid';
import WidgetAssets from '../WidgetAssets';
import styles from './WidgetSelect.less';

@connect(({ scene, loading }) => ({ scene, loading }))
class WidgetSelect extends PureComponent {
  static loadingWidgetId = null;

  static propTypes = {
    onWidgetSelect: PropTypes.func,
    widgetKey: PropTypes.string,
    children: PropTypes.func,
    selectKeys: PropTypes.array,
  };

  constructor(props) {
    super(props);
    this.state = {
      visible: false,
    };
  }

  getWidgetAssetList = e => {
    e && e.stopPropagation();
    const { dispatch } = this.props;
    dispatch({
      type: 'scene/getWidgetAssets',
    });
  };

  handlerPopoverHide = () => {
    this.setState({
      visible: false,
    });
  };

  handlerShowChange = visible => {
    this.setState({ visible });
  };

  handlerSelect = (item, e) => {
    e && e.stopPropagation();
    const { onWidgetSelect, dispatch, widgetKey } = this.props;
    this.loadingWidgetId = item.id;
    dispatch({
      type: 'scene/getWidgetInstanceById',
      payload: {
        id: item.id,
      },
      successCallback: widgetData => {
        if (onWidgetSelect) {
          onWidgetSelect(widgetKey, widgetData);
        }
        this.handlerPopoverHide();
      },
    });
  };

  renderExtra = item => {
    const { widgetSelectKeys, loading } = this.props;
    const loadingWidgetInstance = loading.effects['scene/getWidgetInstanceById'];
    const btnProps = {
      type: 'primary',
      loading: item.id === this.loadingWidgetId && loadingWidgetInstance,
      disabled: includes(widgetSelectKeys, item.id),
      onClick: e => this.handlerSelect(item, e),
    };
    return <Button {...btnProps}>{formatMessage({id: 'dashboard_000031', defaultMessage: '选择'})}</Button>;
  };

  renderWidgetAssets = () => {
    const { scene, loading } = this.props;
    const { widgetAssetList } = scene;
    const widgetAssetsProps = {
      widgetAssetList,
      loading: loading.effects['scene/getWidgetAssets'],
      extra: this.renderExtra,
    };
    return (
      <div className="widget-box">
        <ScrollBar>
          <WidgetAssets {...widgetAssetsProps} />
        </ScrollBar>
      </div>
    );
  };

  render() {
    const { visible } = this.state;
    const { children } = this.props;
    return (
      <Popover
        title={<span className="title">{formatMessage({id: 'dashboard_000032', defaultMessage: '组件资源'})}</span>}
        trigger="click"
        placement="leftTop"
        visible={visible}
        key="widget-popover-box"
        destroyTooltipOnHide
        onVisibleChange={v => this.handlerShowChange(v)}
        overlayClassName={cls(styles['widget-popover-box'])}
        content={this.renderWidgetAssets()}
      >
        {children ? (
          children(this.getWidgetAssetList)
        ) : (
          <div className={cls('trigger-add')} onClick={e => this.getWidgetAssetList(e)}>
            <ExtIcon type="plus" antd style={{ fontSize: 24 }} />
          </div>
        )}
      </Popover>
    );
  }
}

export default WidgetSelect;
