/*
 * @Author: Eason 
 * @Date: 2020-03-20 14:52:21 
 * @Last Modified by: Eason
 * @Last Modified time: 2020-04-05 14:17:19
 */
import React, { PureComponent } from 'react';
import cls from 'classnames';
import { connect } from "dva";
import { ScrollBar, PortalPanel, ListLoader } from 'suid';
import styles from './index.less';


@connect(({ kanban, loading }) => ({ kanban, loading }))
class Kanban extends PureComponent {

    render() {
        const { kanban, loading } = this.props;
        const { widgets, layouts, theme: { primarySkin } } = kanban;
        const portalPanelProps = {
            widgets,
            layouts,
            rowHeight: 100,
            isDraggable: false,
            isResizable: false,
            preventCollision: true,
            draggableHandle: '',
            compactType: null,
            margin: [4, 4],
        };
        const sceneDataLoading = loading.effects['kanban/getSceneByCode'];
        return (
            <div className={cls(styles['kanban-box'])}>
                {
                    sceneDataLoading
                        ? <ListLoader />
                        : <div className={cls('portal-body', primarySkin)}>
                            <div className="portal-box">
                                <ScrollBar>
                                    <PortalPanel {...portalPanelProps} />
                                </ScrollBar>
                            </div>
                        </div>
                }
            </div>
        )
    }
}

export default Kanban;