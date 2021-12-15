/*
 * @Author: Eason
 * @Date: 2020-04-03 11:20:59
 * @Last Modified by: Eason
 * @Last Modified time: 2021-12-14 17:17:06
 */

import React, { PureComponent } from 'react';
import cls from 'classnames';
import PropTypes from 'prop-types';
import { get, set, isObject, isEqual } from 'lodash';
import { Drawer, Button, Input, Form, Switch, Radio } from 'antd';
import { ScrollBar } from 'suid';
import { formatMessage } from 'umi-plugin-react/locale';
import WidgetInstance from './WidgetInstance';
import DynamicEffect from './DynamicEffect';
import { constants } from '@/utils';
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

const { SCREEN_TEMPLATE } = constants;

@Form.create()
class TemplateConfig extends PureComponent {
  static widgetSelectKeys = [];

  static propTypes = {
    screenTemplate: PropTypes.string,
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
    };
  }

  componentDidMount() {
    this.setWidgetSelectKeys();
  }

  componentDidUpdate(prevProps) {
    const { templateConfig, globalConfig } = this.props;
    if (!isEqual(prevProps.templateConfig, templateConfig)) {
      this.setState(
        {
          templateConfig,
        },
        this.setWidgetSelectKeys,
      );
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
  };

  handlerChangeScreenTemplate = (item, e) => {
    if (e) {
      e.stopPropagation();
    }
    const { onChangeScreenTemplate, currentScreenTemplate } = this.props;
    if (onChangeScreenTemplate && currentScreenTemplate !== item.name) {
      onChangeScreenTemplate(item);
    }
  };

  handerScrollDown = () => {
    this.setState({ showShadow: true });
  };

  handerYReachStart = () => {
    this.setState({ showShadow: false });
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
        const [regionRoot, areas, areaKey] = field.split('-');
        const { formConifg = [] } = get(config, [regionRoot, areas, areaKey]) || {};
        formConifg.forEach(configField => {
          if (configField.field === field) {
            Object.assign(configField, { value: formData[field] });
          }
        });
      });
      const data = {
        config,
        globalConfig,
        widgetInstanceIds,
      };
      onConfigSubmit(data);
    });
  };

  setWidgetSelectKeys = () => {
    const { templateConfig } = this.state;
    const widgetSelectKeys = [];
    const config = { ...(templateConfig || {}) };
    Object.keys(config).forEach(key => {
      const widgets = get(config[key], 'widgets', null);
      if (widgets && isObject(widgets)) {
        Object.keys(widgets).forEach(widgetKey => {
          const widget = widgets[widgetKey];
          if (widget && isObject(widget)) {
            widgetSelectKeys.push(widget.id);
          }
        });
      }
    });
    this.widgetSelectKeys = widgetSelectKeys;
  };

  handlerWidgetSelect = (widgetKey, widget) => {
    const { templateConfig: originTemplateConfig } = this.state;
    const [regionRoot, areas, areaKey] = widgetKey.split('-');
    const templateConfig = { ...originTemplateConfig };
    set(templateConfig, [regionRoot, areas, areaKey, 'widgets', widgetKey], widget);
    this.setState(
      {
        templateConfig,
      },
      this.setWidgetSelectKeys,
    );
  };

  renderFormItems = formItems => {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    const formItemList = [...(formItems || [])];
    return formItemList.map(it => {
      if (it.type === 'Input') {
        return (
          <FormItem key={it.field} hasFeedback label={it.text} style={{ marginBottom: 0 }}>
            {getFieldDecorator(it.field, {
              initialValue: get(it, 'value', null),
              rules: [
                {
                  required: it.required || false,
                  message: `${it.text}{formatMessage({id: 'dashboard_000025', defaultMessage: '不能为空'})}`,
                },
              ],
            })(<Input autoComplete="off" />)}
          </FormItem>
        );
      }
      if (it.type === 'RadioGroup') {
        const { value, options } = it;
        return (
          <FormItem key={it.field} label={it.text} style={{ marginBottom: 0 }}>
            {getFieldDecorator(it.field, {
              initialValue: value,
              rules: [
                {
                  required: it.required || false,
                  message: `${it.text}{formatMessage({id: 'dashboard_000025', defaultMessage: '不能为空'})}`,
                },
              ],
            })(
              <Radio.Group size="small">
                {options.map(t => (
                  <Radio.Button value={t.value} key={t.value}>
                    {t.title}
                  </Radio.Button>
                ))}
              </Radio.Group>,
            )}
          </FormItem>
        );
      }
      return null;
    });
  };

  renderWidgetInstances = widgets => {
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
          <div className="sub-title">
            {formatMessage({ id: 'dashboard_000026', defaultMessage: '组件实例配置' })}
          </div>
          <WidgetInstance {...widgetInstanceProps} />
        </>
      );
    }
  };

  handlerDynamicEffect = effect => {
    const { key } = effect;
    const { globalConfig } = this.state;
    const animateEffect = { show: true, type: key };
    const global = { ...globalConfig };
    set(global, 'animateEffect', animateEffect);
    this.setState({
      globalConfig: global,
    });
  };

  handlerAnimateEffectChange = checked => {
    const { globalConfig } = this.state;
    const global = { ...globalConfig };
    set(global, 'animateEffect', { show: false, type: null });
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
        <FormItem
          label={formatMessage({ id: 'dashboard_000027', defaultMessage: '使用动效' })}
          {...formItemInlineLayout}
          style={{ marginBottom: 0 }}
        >
          <Switch
            size="small"
            checked={showAnimateEffect}
            onChange={this.handlerAnimateEffectChange}
          />
        </FormItem>
        {showAnimateEffect ? (
          <DynamicEffect effectKey={animateEffect.type} onChange={this.handlerDynamicEffect} />
        ) : null}
      </>
    );
  };

  renderLayoutFormItems = () => {
    const { templateConfig } = this.state;
    const { screenTemplate } = this.props;
    const config = { ...(templateConfig || {}) };
    if (screenTemplate === SCREEN_TEMPLATE.TECH_BLUE) {
      return Object.keys(config).map(key => {
        const item = config[key];
        return (
          <div className="layout-box" key={key}>
            <div className="group-title">{item.title}</div>
            {this.renderFormItems(item.formConifg)}
            {this.renderWidgetInstances(item.widgets)}
          </div>
        );
      });
    }
    if (screenTemplate === SCREEN_TEMPLATE.TECH_BLUE_ADV) {
      return Object.keys(config).map(key => {
        const item = config[key];
        return (
          <div className="layout-box" key={key}>
            <div className="group-title">{item.title}</div>
            {Object.keys(item.areas).map(areaKey => {
              const it = item.areas[areaKey];
              return (
                <div key={areaKey}>
                  <div
                    key={`${areaKey}_title`}
                    style={{ marginTop: 16, fontSize: 16, fontStyle: 'italic' }}
                  >
                    {it.title}
                  </div>
                  {this.renderFormItems(it.formConifg)}
                  {this.renderWidgetInstances(it.widgets)}
                </div>
              );
            })}
          </div>
        );
      });
    }
  };

  render() {
    const { showShadow } = this.state;
    const { showTemplateConfig, saving } = this.props;
    let headerStyle = {};
    if (showShadow) {
      headerStyle = {
        boxShadow: ' 0 2px 8px rgba(0, 0, 0, 0.15)',
        zIndex: 1,
      };
    }
    return (
      <Drawer
        title={formatMessage({
          id: 'dashboard_000243',
          defaultMessage: '大屏模板配置, 快捷键关闭ESC',
        })}
        placement="right"
        width={420}
        className={cls(styles['config-box'])}
        headerStyle={headerStyle}
        getContainer={false}
        style={{ position: 'absolute' }}
        onClose={this.handlerClose}
        visible={showTemplateConfig}
      >
        <div className="form-box">
          <ScrollBar onYReachStart={this.handerYReachStart} onScrollDown={this.handerScrollDown}>
            <Form {...formItemLayout} layout="vertical">
              <div className="group-title">
                {formatMessage({ id: 'dashboard_000029', defaultMessage: '全局配置' })}
              </div>
              {this.renderGlobalFormItems()}
              {this.renderLayoutFormItems()}
            </Form>
          </ScrollBar>
        </div>
        <div className="foot-box">
          <Button icon="save" onClick={this.handlerSubmit} type="primary" loading={saving}>
            {formatMessage({ id: 'dashboard_000030', defaultMessage: '保存' })}
          </Button>
        </div>
      </Drawer>
    );
  }
}

export default TemplateConfig;
