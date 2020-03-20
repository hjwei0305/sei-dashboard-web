import React, { Component } from 'react';
import cls from 'classnames';
import { indexOf } from 'lodash'
import { Button, Drawer } from 'antd';
import { ListCard, ExtIcon } from 'suid';
import styles from './WidgetAssets.less'

class PanelAssets extends Component {

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

    renderExtra = (item) => {
        const { doneKeys } = this.props;
        const btnProps = {
            type: 'primary',
            disabled: indexOf(doneKeys, item.id) >= 0,
            onClick: (e) => this.handlerAdd(item, e),
        };
        return (
            <Button {...btnProps}>
                添加
            </Button>
        )
    };

    renderAvatar = ({ item }) => {
        const { component } = item;
        const { icon } = component;
        return (
            <ExtIcon
                type={icon.type}
                antd
                style={{ fontSize: 24, width: 42, height: 42, color: icon.color }}
            />
        )
    };

    render() {
        const { showWidgetAssets, widgetData, loading } = this.props;
        const listCardProps = {
            loading,
            dataSource: widgetData,
            showArrow: false,
            customTool: () => null,
            itemField: {
                avatar: this.renderAvatar,
                title: item => item.name,
                description: item => item.description,
                extra: this.renderExtra,
            },
        };
        return (
            <Drawer
                title="添加组件资源"
                placement="right"
                width={420}
                className={cls(styles["assets-box"])}
                getContainer={false}
                style={{ position: 'absolute' }}
                onClose={this.handlerClose}
                visible={showWidgetAssets}
            >
                <ListCard {...listCardProps} />
            </Drawer>
        )
    }
}

export default PanelAssets