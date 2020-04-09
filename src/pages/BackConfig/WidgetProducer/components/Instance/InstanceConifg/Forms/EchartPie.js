import React, { PureComponent } from "react";
import cls from "classnames";
import { omit, get } from 'lodash'
import { Form, Input, Switch, InputNumber } from "antd";
import TimerInterval from '../TimerInterval';
import styles from "./EchartPie.less";

const FormItem = Form.Item;
const { TextArea } = Input;
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
class FeatureGroupForm extends PureComponent {

  constructor(props) {
    super(props);
    const { editData } = props;
    const renderConfig = editData ? JSON.parse(editData.renderConfig) : {};
    this.state = {
      timer: get(renderConfig, 'component.props.timer.interval', 0) > 0 ? true : false,
    };
  }

  componentDidMount() {
    const { onFormRef } = this.props;
    if (onFormRef) {
      onFormRef(this);
    }
  }

  handlerFormSubmit = _ => {
    const { timer } = this.state;
    const { form, save, editData, widget, widgetGroup, color } = this.props;
    form.validateFields((err, formData) => {
      if (err) {
        return;
      }
      let params = {
        id: get(editData, 'id', null),
        name: formData.name,
        description: formData.description,
        iconColor: color || '#333333',
        widgetGroupCode: widgetGroup.code,
        widgetGroupId: widgetGroup.id,
        widgetGroupName: widgetGroup.name,
        widgetTypeCode: widget.code,
        widgetTypeDescription: widget.description,
        widgetTypeIconType: widget.iconType,
        widgetTypeId: widget.id,
        widgetTypeName: widget.name
      };
      const rest = omit(formData, ['id', 'name', 'description', 'iconColor']);
      const renderConfig = {
        component: {
          type: params.widgetTypeCode,
          icon: {
            type: params.widgetTypeIconType,
            color: params.iconColor,
          },
          name: params.widgetTypeName,
          description: params.widgetTypeDescription,
          props: {
            timer: {
              interval: timer ? rest.interval : 0,
            },
            title: params.name,
            store: {
              url: rest.storeUrl,
            },
            seriesName: rest.seriesName,
            reader: {
              legendData: rest.legendData,
              seriesData: rest.seriesData,
            }
          }
        }
      };
      params.renderConfig = JSON.stringify(renderConfig);
      save(params);
    });
  };

  handlerTimerChange = (checked) => {
    this.setState({
      timer: checked,
    })
  };

  handlerTimerIntervalChange = (interval) => {
    const { form } = this.props;
    form.setFieldsValue({
      interval,
    })
  };

  render() {
    const { timer } = this.state;
    const { form, editData, widget } = this.props;
    const renderConfig = editData ? JSON.parse(editData.renderConfig) : {};
    const { getFieldDecorator } = form;
    const timerInterval = get(renderConfig, 'component.props.timer.interval', 0);
    return (
      <div className={cls(styles['form-box'])}>
        <Form {...formItemLayout} layout="vertical">
          <div className='title-group'>基本配置</div>
          <FormItem hasFeedback label="组件类型">
            {getFieldDecorator('widgetType', {
              initialValue: get(editData, 'widgetTypeName', widget.name || null),
              rules: [
                {
                  required: true,
                },
              ],
            })(<Input addonBefore={get(editData, 'widgetTypeCode', widget.code || null)} disabled />)}
          </FormItem>
          <FormItem hasFeedback label="业务名称">
            {getFieldDecorator('name', {
              initialValue: get(editData, 'name', null),
              rules: [
                {
                  required: true,
                  message: '业务名称不能为空',
                },
              ],
            })(<Input autoComplete="off" />)}
          </FormItem>
          <FormItem label="功能描述">
            {getFieldDecorator('description', {
              initialValue: get(editData, 'description', null),
              rules: [
                {
                  required: true,
                  message: '功能描述不能为空',
                },
              ],
            })(
              <TextArea
                style={{ resize: 'none' }}
                autoSize={false}
                rows={4}
              />
            )}
          </FormItem>
          <div className='title-group'>定时器</div>
          <FormItem label='启用定时器' {...formItemInlineLayout} style={{ marginBottom: 0 }}>
            <Switch size="small" checked={timer} onChange={this.handlerTimerChange} />
          </FormItem>
          {
            timer
              ? <FormItem layout="inline" className="timer-body" label="间隔时间(分钟)"  {...formItemInlineLayout} style={{ marginBottom: 0 }}>
                {getFieldDecorator('interval', {
                  initialValue: timerInterval,
                })(
                  <InputNumber precision={0} />
                )}
                <TimerInterval
                  interval={timerInterval}
                  onChange={this.handlerTimerIntervalChange}
                />
              </FormItem>
              : null
          }
          <div className='title-group'>数据配置</div>
          <FormItem label="系列名称" hasFeedback>
            {getFieldDecorator('seriesName', {
              initialValue: get(renderConfig, 'component.props.seriesName', null),
              rules: [
                {
                  required: true,
                  message: '数据接口不能为空',
                },
              ],
            })(
              <Input />
            )}
          </FormItem>
          <FormItem label="数据接口" hasFeedback>
            {getFieldDecorator('storeUrl', {
              initialValue: get(renderConfig, 'component.props.store.url', null),
              rules: [
                {
                  required: true,
                  message: '数据接口不能为空',
                },
              ],
            })(
              <Input />
            )}
            <p className='desc'>数据接口可以是相对路径也可以是以http(s)开头的绝对路径</p>
          </FormItem>
          <FormItem label="图例" hasFeedback>
            {getFieldDecorator('legendData', {
              initialValue: get(renderConfig, 'component.props.reader.legendData', null),
              rules: [
                {
                  required: true,
                  message: '图例不能为空',
                },
              ],
            })(
              <Input />
            )}
            <p className='desc'>图例数据节点:接口返回数据结构请参照官网Echart的legend配置</p>
          </FormItem>
          <FormItem label="系列" hasFeedback>
            {getFieldDecorator('seriesData', {
              initialValue: get(renderConfig, 'component.props.reader.seriesData', null),
              rules: [
                {
                  required: true,
                  message: '系列不能为空',
                },
              ],
            })(
              <Input />
            )}
            <p className='desc'>系列数据节点:接口返回数据结构请参照官网Echart的series配置</p>
          </FormItem>
        </Form>
      </div >
    );
  }
}

export default FeatureGroupForm;
