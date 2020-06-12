/*
 * @Author: Eason
 * @Date: 2020-03-20 14:52:21
 * @Last Modified by: Eason
 * @Last Modified time: 2020-06-12 17:23:55
 */
import React, { PureComponent } from 'react';
import cls from 'classnames';
import { connect } from 'dva';
import { Empty } from 'antd';
import { ScrollBar, PortalPanel, ListLoader } from 'suid';
import empty from '@/assets/page_empty.svg';
import styles from './index.less';

@connect(({ kanban, loading }) => ({ kanban, loading }))
class Kanban extends PureComponent {
  render() {
    const { kanban, loading } = this.props;
    const {
      widgets,
      layouts,
      theme: { primarySkin },
    } = kanban;
    const portalPanelProps = {
      widgets,
      layouts,
      rowHeight: 30,
      isDraggable: false,
      isResizable: false,
      preventCollision: true,
      draggableHandle: '',
      compactType: null,
      margin: [8, 8],
    };
    const sceneDataLoading = loading.effects['kanban/getScene'];
    return (
      <div className={cls(styles['kanban-box'])}>
        {sceneDataLoading ? (
          <ListLoader />
        ) : (
          <div className={cls('portal-body', primarySkin)}>
            <div className="portal-box">
              <ScrollBar>
                {widgets.length > 0 ? (
                  <PortalPanel {...portalPanelProps} />
                ) : (
                  <div className="blank-empty">
                    <Empty image={empty} />
                  </div>
                )}
              </ScrollBar>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default Kanban;
