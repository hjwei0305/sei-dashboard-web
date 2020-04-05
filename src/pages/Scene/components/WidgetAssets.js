/*
 * @Author: Eason 
 * @Date: 2020-04-03 11:20:59 
 * @Last Modified by: Eason
 * @Last Modified time: 2020-04-05 12:04:42
 */

import React, { Component } from 'react';
import cls from 'classnames';
import { indexOf } from 'lodash'
import { Button, Drawer, Card, List, Skeleton } from 'antd';
import { ExtIcon, ScrollBar, ListLoader } from 'suid';
import styles from './WidgetAssets.less'

class WidgetAssets extends Component {

    constructor(props) {
        super(props);
        this.state = {
            showShadow: false,
        }
    }

    handlerClose = () => {
        const { onPanelAssetsClose } = this.props;
        if (onPanelAssetsClose) {
            onPanelAssetsClose();
        }
    }

    handlerAdd = (item, e) => {
        e && e.stopPropagation();
        const { onAddWidget } = this.props;
        if (onAddWidget) {
            onAddWidget(item);
        }
    }

    handerScrollDown = () => {
        this.setState({ showShadow: true })
    };

    handerYReachStart = () => {
        this.setState({ showShadow: false })
    };

    renderExtra = (item) => {
        const { doneKeys, loadingWidgetInstance, loadingWidgetId } = this.props;
        const btnProps = {
            type: 'primary',
            loading: item.id === loadingWidgetId && loadingWidgetInstance,
            disabled: indexOf(doneKeys, item.id) >= 0,
            onClick: (e) => this.handlerAdd(item, e),
        };
        return (
            <Button {...btnProps}>
                添加
            </Button>
        )
    };

    renderAvatar = (item) => {
        const { widgetTypeIconType, iconColor } = item;
        return (
            <ExtIcon
                type={widgetTypeIconType}
                antd
                style={{ fontSize: 24, width: 42, height: 42, color: iconColor }}
            />
        )
    };

    render() {
        const { showShadow } = this.state;
        const { showWidgetAssets, widgetAssetList, loading } = this.props;
        const headerStyle = {
            boxShadow: showShadow ? ' 0 2px 8px rgba(0, 0, 0, 0.15)' : 'none',
        };
        const loadProps = {
            spinning: loading,
            indicator: <ListLoader />,
        };
        return (
            <Drawer
                title="添加组件资源"
                placement="right"
                width={420}
                className={cls(styles["assets-box"])}
                headerStyle={headerStyle}
                getContainer={false}
                style={{ position: 'absolute' }}
                onClose={this.handlerClose}
                visible={showWidgetAssets}
            >
                <ScrollBar>
                    {
                        widgetAssetList.map(group => {
                            const { name, children } = group;
                            if (children && children.length > 0) {
                                return (
                                    <Card
                                        key={group.id}
                                        title={name}
                                        size='small'
                                        type='inner'
                                        bordered={false}
                                    >
                                        <List
                                            dataSource={children}
                                            loading={loadProps}
                                            renderItem={item => (
                                                <List.Item key={item.id}>
                                                    <Skeleton loading={loading} active>
                                                        <List.Item.Meta
                                                            avatar={this.renderAvatar(item)}
                                                            title={item.name}
                                                            description={item.description}
                                                        />
                                                        {
                                                            this.renderExtra(item)
                                                        }
                                                    </Skeleton>
                                                </List.Item>
                                            )}
                                        />
                                    </Card>
                                )
                            }
                            return null;
                        })
                    }
                </ScrollBar>
            </Drawer>
        )
    }
}

export default WidgetAssets