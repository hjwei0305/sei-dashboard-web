/*
 * @Author: Eason 
 * @Date: 2020-03-20 16:24:02 
 * @Last Modified by: Eason
 * @Last Modified time: 2020-04-20 16:56:35
 */
import React, { Component } from 'react';
import cls from 'classnames';
import { connect } from "dva";
import { Drawer } from 'antd';
import { ScrollBar } from 'suid';
import Skin from './Forms/Skin';
import { constants } from '../../../../utils';
import styles from './index.less';

const { ECHART } = constants
@connect(({ dashboard, loading }) => ({ dashboard, loading }))
class Settings extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showShadow: false,
        }
    }

    handlerClose = () => {
        const { onSettingsClose } = this.props;
        if (onSettingsClose) {
            onSettingsClose();
        }
    }

    handerScrollDown = () => {
        this.setState({ showShadow: true })
    };

    handerYReachStart = () => {
        this.setState({ showShadow: false })
    };

    handlerSkinChange = ({ key }) => {
        const { dispatch, triggerSaveConfig } = this.props;
        dispatch({
            type: 'dashboard/updateState',
            payload: {
                theme: {
                    primarySkin: key,
                    echart: ECHART[key],
                }
            }
        });
        triggerSaveConfig();
    };

    render() {
        const { showShadow } = this.state;
        const { showSettings, dashboard } = this.props;
        const { theme } = dashboard;
        const headerStyle = {
            boxShadow: showShadow ? ' 0 2px 8px rgba(0, 0, 0, 0.15)' : 'none',
        };
        const skinProps = {
            theme,
            onChange: this.handlerSkinChange
        };
        return (
            <Drawer
                title="数据看板设置 (快捷键关闭 ESC)"
                placement="right"
                width={420}
                className={cls(styles["assets-box"])}
                getContainer={false}
                headerStyle={headerStyle}
                style={{ position: 'absolute' }}
                onClose={this.handlerClose}
                visible={showSettings}
            >
                <div className="form-body">
                    <ScrollBar
                        onYReachStart={this.handerYReachStart}
                        onScrollDown={this.handerScrollDown}
                    >
                        <Skin {...skinProps} />
                    </ScrollBar>
                </div>
            </Drawer>
        )
    }
}

export default Settings