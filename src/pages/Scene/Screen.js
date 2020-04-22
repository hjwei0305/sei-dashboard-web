/*
 * @Author: Eason 
 * @Date: 2020-04-03 11:20:08 
 * @Last Modified by: Eason
 * @Last Modified time: 2020-04-21 16:56:34
 */
import React, { PureComponent } from 'react';
import cls from 'classnames';
import { connect } from "dva";
import moment from 'moment';
import { isEqual } from 'lodash';
import { Divider, Empty } from 'antd';
import { ExtIcon, ScrollBar, ListLoader, HottedKey } from 'suid';
import empty from "@/assets/page_empty.svg";
import { ScreenTemplate } from '../../components';
import TemplateSet from './components/TemplateSet';
import styles from './Screen.less';

const { GlobalHotKeys } = HottedKey;
const { TechBlue } = ScreenTemplate;
const duration = 10000;

@connect(({ scene, screen, loading }) => ({ scene, screen, loading }))
class SceneView extends PureComponent {

    static autoSaveTimer = null;

    componentDidMount() {
        this.getSceneScreenData();
    }

    componentWillUnmount() {
        this.endAutoSaveTimer();
    }

    componentDidUpdate(preProps) {
        const { scene } = this.props;
        if (!isEqual(preProps.scene.currentScene, scene.currentScene)) {
            this.getSceneScreenData();
        }
    }

    startAutoSaveTimer = () => {
        this.endAutoSaveTimer();
        this.autoSaveTimer = setInterval(this.handlerSceneConfigSave, duration);
    };

    endAutoSaveTimer = () => {
        clearInterval(this.autoSaveTimer);
    };

    getSceneScreenData = () => {
        const { dispatch, scene } = this.props;
        const { currentScene } = scene;
        if (currentScene) {
            dispatch({
                type: 'screen/getSceneById',
                payload: {
                    id: currentScene.id,
                }
            });
        }
    };

    handlerTemplateSet = () => {
        const { dispatch } = this.props;
        dispatch({
            type: 'screen/getScreenTemplateList',
        });
        dispatch({
            type: 'screen/updateState',
            payload: {
                showScreenTemplateAssets: true,
            }
        });
    };

    handlerCloseTemplateAssets = () => {
        const { dispatch } = this.props;
        dispatch({
            type: 'screen/updateState',
            payload: {
                showScreenTemplateAssets: false,
            }
        });
    };

    handlerChangeScreenTemplate = (screenTemplate) => {
        const { screen, dispatch } = this.props;
        const { currentScreenTemplate } = screen;
        if (currentScreenTemplate) {

        } else {
            dispatch({
                type: 'screen/updateState',
                payload: {
                    currentScreenTemplate: screenTemplate.name,
                }
            });
        }
    };

    getActionTooltip = (title, shortcutTitle) => {
        return {
            overlayClassName: 'tip',
            placement: 'bottom',
            title: (
                <>
                    {title}
                    <br />
                    <span style={{ fontSize: 12 }}>
                        {shortcutTitle}
                    </span>
                </>
            )
        };
    };

    renderLasterUpdateDateTime = () => {
        const { scene, loading } = this.props;
        const { currentScene, lastEditorName, lastEditedDate } = scene;
        const configSaving = loading.effects['scene/saveSceneConfig'];
        let duration = '';
        if (currentScene) {
            const end = moment(Date.now());
            const start = moment(lastEditedDate);
            duration = start.from(end);
            return (
                <>
                    {
                        configSaving
                            ?
                            <>
                                <ExtIcon
                                    type='loading'
                                    className='action-item'
                                    antd
                                />
                                <span className='tool-desc'>保存中...</span>
                            </>
                            :
                            <>
                                <ExtIcon
                                    type="save"
                                    className='action-item'
                                    onClick={this.handlerSceneConfigSave}
                                    tooltip={this.getActionTooltip('保存场景配置', '快捷键 Ctrl + S')}
                                    antd
                                />
                                <span className='tool-desc'>{`${lastEditorName}于 ${duration} 更新`}</span>
                            </>
                    }
                </>
            );
        }
        return duration;
    };

    renderTitle = () => {
        const { scene } = this.props;
        const { currentScene } = scene;
        return (
            <>
                <span className="header-title"> {currentScene.name}</span>
                <span className="header-sub-title">场景组件实例配置</span>
            </>
        )
    };

    render() {
        const { screen, loading, onToggle, collapsed } = this.props;
        const { templateAssetList, currentScreenTemplate, showScreenTemplateAssets } = screen;
        const loadingTemplateAssets = loading.effects['screen/getScreenTemplateList'];
        const sceneScreenDataLoading = loading.effects['screen/getSceneById'];
        const keyMap = {
            SAVE: 'ctrl+s',
            SHOW_TEMPLATE_SET: 'alt+s',
            COLLAPSED: 'alt+c',
        };
        const handlers = {
            SAVE: this.handlerSceneConfigSave,
            COLLAPSED: onToggle ? onToggle : null,
            SHOW_TEMPLATE_SET: this.handlerTemplateSet,
        };
        const templateSetProps = {
            templateAssetList,
            loading: loadingTemplateAssets,
            showScreenTemplateAssets,
            currentScreenTemplate,
            onChangeScreenTemplate: this.handlerChangeScreenTemplate,
            onAssetsClose: this.handlerCloseTemplateAssets,
        };
        return (
            <>
                <GlobalHotKeys keyMap={keyMap} handlers={handlers}>
                    <div className={cls(styles['scene-view-box'])}>
                        {
                            sceneScreenDataLoading
                                ? <ListLoader />
                                : <div className={cls('portal-body')}>
                                    <div className="action-tool-bar">
                                        <div>
                                            {this.renderTitle()}
                                            {
                                                onToggle
                                                    ? <ExtIcon
                                                        type={collapsed ? 'menu-unfold' : 'menu-fold'}
                                                        className='action-item'
                                                        onClick={onToggle}
                                                        tooltip={this.getActionTooltip('显示场景列表', '快捷键 Alt + C')}
                                                        antd
                                                    />
                                                    : null
                                            }
                                            <Divider type='vertical' />
                                            {
                                                this.renderLasterUpdateDateTime()
                                            }
                                        </div>
                                        <div className='right-tool-box'>
                                            <ExtIcon
                                                type="setting"
                                                className='action-item primary'
                                                spin={loadingTemplateAssets}
                                                onClick={this.handlerTemplateSet}
                                                tooltip={this.getActionTooltip('设置模板', '快捷键 Alt + S')}
                                                antd
                                            />
                                        </div>
                                    </div>
                                    <div className="portal-box">
                                        <ScrollBar>
                                            {
                                                currentScreenTemplate
                                                    ? <TechBlue />
                                                    : <div className='blank-empty'>
                                                        <Empty
                                                            image={empty}
                                                            description="大屏模板是空的，快捷键 Alt + S进行设置"
                                                        />
                                                    </div>
                                            }
                                        </ScrollBar>
                                    </div>
                                    <TemplateSet {...templateSetProps} />
                                </div>
                        }
                    </div>
                </GlobalHotKeys>
            </>
        );
    }
}
export default SceneView;