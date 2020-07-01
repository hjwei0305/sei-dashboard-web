/*
 * @Author: Eason
 * @Date: 2020-04-03 11:20:59
 * @Last Modified by: Eason
 * @Last Modified time: 2020-04-23 13:36:23
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Card, List, Skeleton } from 'antd';
import { ExtIcon, ListLoader } from 'suid';
import styles from './WidgetAssets.less';

class WidgetAssets extends Component {
  static propTypes = {
    widgetAssetList: PropTypes.array,
    loading: PropTypes.bool,
    extra: PropTypes.func,
  };

  static defaultProps = {
    widgetAssetList: [],
    loading: false,
  };

  renderAvatar = item => {
    const { widgetTypeIconType, iconColor } = item;
    return (
      <ExtIcon
        type={widgetTypeIconType}
        style={{ fontSize: 42, width: 42, height: 42, color: iconColor }}
      />
    );
  };

  renderExtra = item => {
    const { extra } = this.props;
    if (extra) {
      return extra(item);
    }
    return null;
  };

  render() {
    const { widgetAssetList, loading } = this.props;
    return (
      <div className={styles['widget-assets-box']}>
        {loading ? <ListLoader /> : null}
        {widgetAssetList.map(group => {
          const { name, children } = group;
          if (children && children.length > 0) {
            return (
              <Card key={group.id} title={name} size="small" type="inner" bordered={false}>
                <List
                  dataSource={children}
                  renderItem={item => (
                    <List.Item key={item.id}>
                      <Skeleton loading={loading} active>
                        <List.Item.Meta
                          avatar={this.renderAvatar(item)}
                          title={item.name}
                          description={item.description}
                        />
                        {this.renderExtra(item)}
                      </Skeleton>
                    </List.Item>
                  )}
                />
              </Card>
            );
          }
          return null;
        })}
      </div>
    );
  }
}

export default WidgetAssets;
