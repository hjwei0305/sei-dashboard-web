/*
 * @Author: Eason 
 * @Date: 2020-04-03 11:20:59 
 * @Last Modified by: Eason
 * @Last Modified time: 2020-04-22 09:44:22
 */

import React, { Component } from 'react';
import cls from 'classnames';
import { Drawer, Card, List, Skeleton } from 'antd';
import { ScrollBar, ListLoader, ExtIcon, Animate } from 'suid';
import { constants } from '../../../utils';
import styles from './TemplateSet.less';


const { LOCAL_PATH } = constants;

class TemplateSet extends Component {

    constructor(props) {
        super(props);
        this.state = {
            showShadow: false,
        }
    }

    handlerClose = () => {
        const { onAssetsClose } = this.props;
        if (onAssetsClose) {
            onAssetsClose();
        }
    }

    handlerChangeScreenTemplate = (item, e) => {
        e && e.stopPropagation();
        const { onChangeScreenTemplate, currentScreenTemplate } = this.props;
        if (onChangeScreenTemplate && currentScreenTemplate !== item.name) {
            onChangeScreenTemplate(item);
        }
    }

    handerScrollDown = () => {
        this.setState({ showShadow: true })
    };

    handerYReachStart = () => {
        this.setState({ showShadow: false })
    };

    render() {
        const { showShadow } = this.state;
        const { showScreenTemplateAssets, templateAssetList, loading, currentScreenTemplate } = this.props;
        const headerStyle = {
            boxShadow: showShadow ? ' 0 2px 8px rgba(0, 0, 0, 0.15)' : 'none',
        };
        const loadProps = {
            spinning: loading,
            indicator: <ListLoader />,
        };
        return (
            <Drawer
                title="设置大屏模板 (快捷键关闭 ESC)"
                placement="right"
                width={420}
                className={cls(styles["assets-box"])}
                headerStyle={headerStyle}
                getContainer={false}
                style={{ position: 'absolute' }}
                onClose={this.handlerClose}
                visible={showScreenTemplateAssets}
            >
                <ScrollBar>
                    <List
                        dataSource={templateAssetList}
                        loading={loadProps}
                        renderItem={item => (
                            <List.Item key={item.id}>
                                <Skeleton loading={loading} active>
                                    <Card
                                        bordered
                                        hoverable
                                        className={cls({ "selected": currentScreenTemplate === item.name })}
                                        onClick={(e) => this.handlerChangeScreenTemplate(item, e)}
                                        cover={<img alt="snapshot" src={`${LOCAL_PATH}/images/${item.snapshot}`} />}
                                    >
                                        <Card.Meta
                                            title={item.title}
                                        />
                                        <div className="corner">
                                            <Animate type="bounceIn">
                                                <ExtIcon type="selected" style={{ fontSize: 24 }} />
                                            </Animate>
                                        </div>
                                    </Card>
                                </Skeleton>
                            </List.Item>
                        )}
                    />
                </ScrollBar>
            </Drawer>
        )
    }
}

export default TemplateSet