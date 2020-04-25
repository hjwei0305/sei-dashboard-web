/*
 * @Author: Eason 
 * @Date: 2020-04-03 11:20:59 
 * @Last Modified by: Eason
 * @Last Modified time: 2020-04-25 18:49:22
 */

import React, { PureComponent } from 'react';
import cls from 'classnames';
import PropTypes from 'prop-types';
import { get, set, isObject, isEqual } from 'lodash'
import { Drawer, Button, Input, Form, Switch } from 'antd';
import { ScrollBar } from 'suid';
import WidgetInstance from './WidgetInstance';
import DynamicEffect from './DynamicEffect';
import styles from './index.less';

const FormItem = Form.Item;
const formItemLayout = {
    labelCol: {
        span: 24,
    },
    wrapperCol: {
        span: 24,
    },
};

const formItemInlineLayout = {
    labelCol: {
        span: 6,
    },
    wrapperCol: {
        span: 18,
    },
};

@Form.create()
class TemplateConfig extends PureComponent {

    static widgetSelectKeys = [];

    static propTypes = {
        showTemplateConfig: PropTypes.bool,
        templateConfig: PropTypes.object,
        screenTemplateConfigLoading: PropTypes.bool,
        onConfigSubmit: PropTypes.func,
        saving: PropTypes.bool,
    };

    constructor(props) {
        super(props);
        const { templateConfig, globalConfig } = props;
        this.state = {
            showShadow: false,
            showAnimateEffect: get(globalConfig, 'animateEffect.show', false) || false,
            templateConfig,
            globalConfig,
        }
    }

    componentDidMount() {
        this.setWidgetSelectKeys();
    }

    componentDidUpdate(prevProps) {
        const { templateConfig, globalConfig } = this.props;
        if (!isEqual(prevProps.templateConfig, templateConfig)) {
            this.setState({
                templateConfig,
            }, this.setWidgetSelectKeys);
        }
        if (!isEqual(prevProps.globalConfig, globalConfig)) {
            this.setState({
                globalConfig,
            });
        }
    }

    handlerClose = () => {
        const { onConfigClose } = this.props;
        if (onConfigClose) {
            onConfigClose();
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

    handlerSubmit = () => {
        const { form, onConfigSubmit } = this.props;
        this.setWidgetSelectKeys();
        const widgetInstanceIds = this.widgetSelectKeys;
        const { templateConfig, globalConfig } = this.state;
        const config = { ...(templateConfig || {}) };
        form.validateFields((err, formData) => {
            if (err) {
                return;
            }
            Object.keys(formData).forEach(field => {
                const regionRoot = field.split("-")[0];
                const formConifg = get(templateConfig, [regionRoot, 'formConifg'], []) || [];
                formConifg.forEach((configField, index) => {
                    if (configField.field === field) {
                        set(templateConfig, [regionRoot, 'formConifg', index.toString(), 'value'], formData[field]);
                    }
                });
            });
            const data = {
                config,
                globalConfig,
                widgetInstanceIds,
            }
            onConfigSubmit(data);
        });
    };

    setWidgetSelectKeys = () => {
        const { templateConfig } = this.state;
        let widgetSelectKeys = [];
        const config = { ...(templateConfig || {}) };
        Object.keys(config).forEach(key => {
            const widgets = get(config[key], "widgets", null);
            if (widgets && isObject(widgets)) {
                Object.keys(widgets).forEach(widgetKey => {
                    const widget = widgets[widgetKey];
                    if (widget && isObject(widget)) {
                        widgetSelectKeys.push(widget.id);
                    }
                })
            }
        });
        this.widgetSelectKeys = widgetSelectKeys;
    };

    handlerWidgetSelect = (widgetKey, widget) => {
        const { templateConfig: originTemplateConfig } = this.state;
        const regionRoot = widgetKey.split("-")[0];
        const templateConfig = { ...originTemplateConfig };
        set(templateConfig, [regionRoot, 'widgets', widgetKey], widget);
        this.setState({
            templateConfig,
        }, this.setWidgetSelectKeys);
    };

    renderFormItems = (formItems) => {
        const { form } = this.props;
        const { getFieldDecorator } = form;
        const formItemList = [...(formItems || [])];
        return formItemList.map(it => {
            return (
                <FormItem key={it.field} hasFeedback label={it.text}>
                    {getFieldDecorator(it.field, {
                        initialValue: get(it, 'value', null),
                        rules: [
                            {
                                required: it.required || false,
                                message: `${it.text}不能为空`,
                            },
                        ],
                    })(<Input autoComplete="off" />)}
                </FormItem>
            );
        });
    };

    renderWidgetInstances = (widgets) => {
        if (widgets && isObject(widgets)) {
            const { screenTemplateConfigLoading } = this.props;
            const widgetInstanceProps = {
                widgets,
                loading: screenTemplateConfigLoading,
                onWidgetSelect: this.handlerWidgetSelect,
                widgetSelectKeys: this.widgetSelectKeys,
            };
            return (
                <>
                    <div className="sub-title">组件实例配置</div>
                    <WidgetInstance {...widgetInstanceProps} />
                </>
            )
        }
    };

    handlerDynamicEffect = (effect) => {
        const { key } = effect;
        const { globalConfig } = this.state;
        const animateEffect = { show: true, type: key };
        const global = { ...globalConfig }
        set(global, "animateEffect", animateEffect);
        this.setState({
            globalConfig: global,
        });
    };

    handlerAnimateEffectChange = (checked) => {
        const { globalConfig } = this.state;
        const global = { ...globalConfig }
        set(global, "animateEffect", { show: false, type: null });
        this.setState({
            showAnimateEffect: checked,
            globalConfig: global,
        });
    };

    renderGlobalFormItems = () => {
        const { showAnimateEffect, globalConfig } = this.state;
        const animateEffect = get(globalConfig, 'animateEffect', {}) || {};
        return (
            <>
                <FormItem label='使用动效' {...formItemInlineLayout} style={{ marginBottom: 0 }}>
                    <Switch size="small" checked={showAnimateEffect} onChange={this.handlerAnimateEffectChange} />
                </FormItem>
                {
                    showAnimateEffect
                        ? <DynamicEffect
                            effectKey={animateEffect.type}
                            onChange={this.handlerDynamicEffect}
                        />
                        : null
                }
            </>
        );
    };

    render() {
        const { showShadow, templateConfig } = this.state;
        const { showTemplateConfig, saving } = this.props;
        let headerStyle = {};
        if (showShadow) {
            headerStyle = {
                boxShadow: ' 0 2px 8px rgba(0, 0, 0, 0.15)',
                zIndex: 1,
            };
        }
        const config = { ...(templateConfig || {}) };
        return (
            <Drawer
                title="大屏模板配置 (快捷键关闭 ESC)"
                placement="right"
                width={420}
                className={cls(styles["config-box"])}
                headerStyle={headerStyle}
                getContainer={false}
                style={{ position: 'absolute' }}
                onClose={this.handlerClose}
                visible={showTemplateConfig}
            >
                <div className="form-box">
                    <ScrollBar
                        onYReachStart={this.handerYReachStart}
                        onScrollDown={this.handerScrollDown}
                    >
                        <Form {...formItemLayout} layout="vertical">
                            <div className="group-title">全局配置</div>
                            {this.renderGlobalFormItems()}
                            {
                                Object.keys(config).map(key => {
                                    const item = config[key];
                                    return (
                                        <div className="layout-box" key={key}>
                                            <div className="group-title">{item.title}</div>
                                            {
                                                this.renderFormItems(item.formConifg)
                                            }
                                            {
                                                this.renderWidgetInstances(item.widgets)
                                            }
                                        </div>
                                    )
                                })
                            }
                        </Form>
                    </ScrollBar>
                </div>
                <div className="foot-box">
                    <Button
                        icon="save"
                        onClick={this.handlerSubmit}
                        type="primary"
                        loading={saving}
                    >
                        保存
                     </Button>
                </div>
            </Drawer>
        )
    }
}

export default TemplateConfig