/*
 * @Author: Eason 
 * @Date: 2020-04-03 11:20:08 
 * @Last Modified by: Eason
 * @Last Modified time: 2020-04-24 16:53:33
 */
import React, { PureComponent } from 'react';
import cls from 'classnames';
import { connect } from "dva";
import moment from 'moment';
import { isEqual, get, isObject } from 'lodash';
import { Divider, Empty } from 'antd';
import { ExtIcon, ListLoader, HottedKey, ResizeMe } from 'suid';
import empty from "@/assets/page_empty.svg";
import { ScreenTemplate } from '../../components';
import TemplateSelect from './components/TemplateSelect';
import TemplateConfig from './components/TemplateConfig';
import { constants } from '../../utils'
import styles from './Screen.less';

const { GlobalHotKeys } = HottedKey;
const { TechBlue } = ScreenTemplate;
const { SCREEN_TEMPLATE } = constants;

@ResizeMe()
@connect(({ scene, screen, loading }) => ({ scene, screen, loading }))
class SceneView extends PureComponent {

    static autoSaveTimer = null;
    static screenBox;

    constructor(props) {
        super(props);
        this.state = {
            fullScreen: false,
        };
    }

    componentDidMount() {
        this.getSceneScreenData();
    }

    componentDidUpdate(preProps) {
        const { scene } = this.props;
        if (!isEqual(preProps.scene.currentScene, scene.currentScene)) {
            this.getSceneScreenData();
        }
        if (!isEqual(preProps.size, this.props.size)) {
            this.onResize();
        }
    }

    onResize = () => {
        if (this.screenBox) {
            const html = document.getElementsByTagName("html");
            const element = this.screenBox.parentNode;
            const {
                width,
            } = getComputedStyle(element);
            const w = parseInt(width, 10);
            // 字体大小算法: 100 * (调试设备宽度 / 设计图宽度)
            html[0].style["font-size"] = `${100 * (w / 1920)}px`;
        }
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

    handlerTemplateSelect = () => {
        const { dispatch } = this.props;
        dispatch({
            type: 'screen/getScreenTemplateList',
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
            // todo 弹出确认框告知用户是否要切换模板，切换后配置数据可能会丢失
        } else {
            dispatch({
                type: 'screen/updateState',
                payload: {
                    currentScreenTemplate: screenTemplate.name,
                }
            });
        }
        this.onResize();
    };

    handlerShowTemplateConfig = () => {
        const { dispatch, screen: { currentScreenTemplate, templateConfig } } = this.props;
        if (currentScreenTemplate && (!templateConfig || Object.keys(templateConfig).length === 0)) {
            dispatch({
                type: 'screen/getScreenTemplateConfig',
                payload: {
                    template: currentScreenTemplate,
                }
            });
        } else {
            dispatch({
                type: 'screen/updateState',
                payload: {
                    showTemplateConfig: true,
                }
            });
        }
    };

    handlerCloseTemplateConfig = () => {
        const { dispatch } = this.props;
        dispatch({
            type: 'screen/updateState',
            payload: {
                showTemplateConfig: false,
            }
        });
    };

    getWidgetInstanceIds = () => {
        const { screen: { templateConfig } } = this.props;
        let widgetInstanceIds = [];
        const config = { ...(templateConfig || {}) };
        Object.keys(config).forEach(key => {
            const widgets = get(config[key], "widgets", null);
            if (widgets && isObject(widgets)) {
                Object.keys(widgets).forEach(widgetKey => {
                    const widget = widgets[widgetKey];
                    if (widget && isObject(widget)) {
                        widgetInstanceIds.push(widget.id);
                    }
                })
            }
        });
        console.log(widgetInstanceIds);
        return widgetInstanceIds;
    };

    handlerSceneConfigSave = (configData) => {
        const { dispatch, scene, screen: { currentScreenTemplate, templateConfig } } = this.props;
        const { currentScene } = scene;
        const { config: formConfig, widgetInstanceIds } = configData;
        const config = {
            screenTemplate: currentScreenTemplate,
            templateConfig: formConfig || templateConfig,
        };
        dispatch({
            type: 'scene/saveSceneConfig',
            payload: {
                id: currentScene.id,
                config: JSON.stringify(config),
                widgetInstanceIds: JSON.stringify(widgetInstanceIds || this.getWidgetInstanceIds()),
            }
        });
    };

    setFullScreen = () => {
        let fullScreen = false;
        if (
            !document.fullscreenElement &&
            !document.mozFullScreenElement &&
            !document.webkitFullscreenElement &&
            !document.msFullscreenElement
        ) {
            if (document.documentElement.requestFullscreen) {
                document.documentElement.requestFullscreen();
            } else if (document.documentElement.msRequestFullscreen) {
                document.documentElement.msRequestFullscreen();
            } else if (document.documentElement.mozRequestFullScreen) {
                document.documentElement.mozRequestFullScreen();
            } else if (document.documentElement.webkitRequestFullscreen) {
                document.documentElement.webkitRequestFullscreen(
                    Element.ALLOW_KEYBOARD_INPUT
                );
            }
            fullScreen = true;
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
        this.setState({ fullScreen });
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
                <span className="header-sub-title">场景配置</span>
            </>
        )
    };

    renderScreenTemplate = () => {
        const { screen: { currentScreenTemplate, templateConfig, instanceDtos } } = this.props;
        const templateProps = {
            templateConfig,
            instanceDtos,
        };
        switch (currentScreenTemplate) {
            case SCREEN_TEMPLATE.TECH_BLUE:
                return <TechBlue {...templateProps} />;
            default:
                return (
                    <div className='blank-empty'>
                        <Empty
                            image={empty}
                            description="此模板暂时没有实现"
                        />
                    </div>
                );
        }
    };

    render() {
        const { fullScreen } = this.state;
        const { screen, loading, onToggle, collapsed } = this.props;
        const { templateAssetList, currentScreenTemplate, showScreenTemplateAssets, showTemplateConfig, templateConfig } = screen;
        const loadingTemplateAssets = loading.effects['screen/getScreenTemplateList'];
        const sceneScreenDataLoading = loading.effects['screen/getSceneById'];
        const screenTemplateConfigLoading = loading.effects['screen/getScreenTemplateConfig'];
        const configSaving = loading.effects['scene/saveSceneConfig'];
        const keyMap = {
            SAVE: 'ctrl+s',
            SHOW_TEMPLATE_SET: 'ctrl+a',
            SHOW_CONFIG: 'alt+s',
            COLLAPSED: 'alt+c',
            FULL_SCREEN: 'alt+f',
        };
        const handlers = {
            SAVE: this.handlerSceneConfigSave,
            COLLAPSED: onToggle ? onToggle : null,
            SHOW_TEMPLATE_SET: this.handlerTemplateSelect,
            SHOW_CONFIG: this.handlerShowTemplateConfig,
            FULL_SCREEN: this.setFullScreen,
        };
        const templateSelectProps = {
            templateAssetList,
            loading: loadingTemplateAssets,
            showScreenTemplateAssets,
            currentScreenTemplate,
            onChangeScreenTemplate: this.handlerChangeScreenTemplate,
            onAssetsClose: this.handlerCloseTemplateAssets,
        };
        const templateConfigProps = {
            showTemplateConfig,
            templateConfig,
            saving: configSaving,
            screenTemplateConfigLoading,
            onConfigSubmit: this.handlerSceneConfigSave,
            onConfigClose: this.handlerCloseTemplateConfig,
        };
        return (
            <>
                <GlobalHotKeys keyMap={keyMap} handlers={handlers}>
                    <div ref={node => this.screenBox = node} className={cls(styles['scene-screen-box'])}>
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
                                                        tooltip={this.getActionTooltip(collapsed ? '显示场景列表' : '隐藏场景列表', '快捷键 Alt + C')}
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
                                                type="swap"
                                                className='action-item primary'
                                                spin={loadingTemplateAssets}
                                                onClick={this.handlerTemplateSelect}
                                                tooltip={this.getActionTooltip('设置模板', '快捷键 Ctrl + A')}
                                                antd
                                            />
                                            {
                                                currentScreenTemplate
                                                    ? <ExtIcon
                                                        type="setting"
                                                        className='action-item'
                                                        spin={loadingTemplateAssets}
                                                        onClick={this.handlerShowTemplateConfig}
                                                        tooltip={this.getActionTooltip('模板配置', '快捷键 Alt + S')}
                                                        antd
                                                    />
                                                    : null
                                            }
                                            <ExtIcon
                                                type={fullScreen ? 'fullscreen-exit' : 'fullscreen'}
                                                className='action-item'
                                                onClick={this.setFullScreen}
                                                tooltip={this.getActionTooltip(fullScreen ? '退出全屏' : '全屏显示', '快捷键 Alt + F')}
                                                antd
                                            />
                                        </div>
                                    </div>
                                    <div className="portal-box">
                                        {
                                            currentScreenTemplate
                                                ? this.renderScreenTemplate()
                                                : <div className='blank-empty'>
                                                    <Empty
                                                        image={empty}
                                                        description="大屏模板是空的，快捷键 Alt + S进行设置"
                                                    />
                                                </div>
                                        }
                                    </div>
                                    <TemplateSelect {...templateSelectProps} />
                                    <TemplateConfig {...templateConfigProps} />
                                </div>
                        }
                    </div>
                </GlobalHotKeys>
            </>
        );
    }
}
export default SceneView;