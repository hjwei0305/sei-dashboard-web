import React, { PureComponent } from 'react';
import cls from 'classnames';
import { omit, get } from 'lodash';
import { Form, Input, Switch, InputNumber } from 'antd';
import { DropdownOption } from '@/components';
import styles from './EchartBarLine.less';

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
class EchartBarLineForm extends PureComponent {
  constructor(props) {
    super(props);
    const { editData } = props;
    const renderConfig = editData ? JSON.parse(editData.renderConfig) : {};
    this.state = {
      timer: get(renderConfig, 'component.props.timer.interval', 0) > 0,
      showSummary: get(renderConfig, 'component.props.summary.show', false) || false,
    };
  }

  componentDidMount() {
    const { onFormRef } = this.props;
    if (onFormRef) {
      onFormRef(this);
    }
  }

  handlerFormSubmit = () => {
    const { timer, showSummary } = this.state;
    const { form, save, editData, widget, widgetGroup, color, personalUse } = this.props;
    form.validateFields((err, formData) => {
      if (err) {
        return;
      }
      const params = {
        id: get(editData, 'id', null),
        name: formData.name,
        description: formData.description,
        personalUse,
        iconColor: color || '#333333',
        widgetGroupCode: widgetGroup.code,
        widgetGroupId: widgetGroup.id,
        widgetGroupName: widgetGroup.name,
        widgetTypeCode: widget.code,
        widgetTypeDescription: widget.description,
        widgetTypeIconType: widget.iconType,
        widgetTypeId: widget.id,
        widgetTypeName: widget.name,
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
            summary: {
              show: showSummary,
              title: showSummary ? rest.summaryTitle : '',
              data: showSummary ? rest.summaryData : '',
            },
            title: params.name,
            store: {
              url: rest.storeUrl,
            },
            reader: {
              legendData: rest.legendData,
              seriesData: rest.seriesData,
              xAxisData: rest.xAxisData,
              yAxisData: rest.yAxisData,
            },
          },
        },
      };
      params.renderConfig = JSON.stringify(renderConfig);
      save(params);
    });
  };

  handlerTimerChange = checked => {
    this.setState({
      timer: checked,
    });
  };

  handlerSummaryChange = checked => {
    this.setState({
      showSummary: checked,
    });
  };

  handlerTimerIntervalChange = interval => {
    const { form } = this.props;
    form.setFieldsValue({
      interval,
    });
  };

  render() {
    const { timer, showSummary } = this.state;
    const { form, editData, widget } = this.props;
    const renderConfig = editData ? JSON.parse(editData.renderConfig) : {};
    const { getFieldDecorator } = form;
    const timerInterval = get(renderConfig, 'component.props.timer.interval', 0);
    return (
      <div className={cls(styles['form-box'])}>
        <Form {...formItemLayout} layout="vertical">
          <div className="title-group">基本配置</div>
          <FormItem hasFeedback label="组件类型">
            {getFieldDecorator('widgetType', {
              initialValue: get(editData, 'widgetTypeName', widget.name || null),
              rules: [
                {
                  required: true,
                },
              ],
            })(
              <Input addonBefore={get(editData, 'widgetTypeCode', widget.code || null)} disabled />,
            )}
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
            })(<TextArea style={{ resize: 'none' }} autoSize={false} rows={4} />)}
          </FormItem>
          <div className="title-group">定时器</div>
          <FormItem label="启用定时器" {...formItemInlineLayout} style={{ marginBottom: 0 }}>
            <Switch size="small" checked={timer} onChange={this.handlerTimerChange} />
          </FormItem>
          {timer ? (
            <FormItem
              layout="inline"
              className="timer-body"
              label="间隔时间(分钟)"
              {...formItemInlineLayout}
              style={{ marginBottom: 0 }}
            >
              {getFieldDecorator('interval', {
                initialValue: timerInterval,
              })(<InputNumber precision={0} />)}
              <DropdownOption interval={timerInterval} onChange={this.handlerTimerIntervalChange} />
            </FormItem>
          ) : null}
          <div className="title-group">数据配置</div>
          <FormItem label="数据接口" hasFeedback>
            {getFieldDecorator('storeUrl', {
              initialValue: get(renderConfig, 'component.props.store.url', null),
              rules: [
                {
                  required: true,
                  message: '数据接口不能为空',
                },
              ],
            })(<Input />)}
            <p className="desc">数据接口可以是相对路径也可以是以http(s)开头的绝对路径</p>
          </FormItem>
          <FormItem label="图例" hasFeedback>
            {getFieldDecorator('legendData', {
              initialValue: get(renderConfig, 'component.props.reader.legendData', null),
              rules: [
                {
                  required: false,
                  message: '图例不能为空',
                },
              ],
            })(<Input />)}
            <p className="desc">图例数据节点:接口返回数据结构请参照官网Echart的legend配置</p>
          </FormItem>
          <FormItem label="X轴" hasFeedback>
            {getFieldDecorator('xAxisData', {
              initialValue: get(renderConfig, 'component.props.reader.xAxisData', null),
              rules: [
                {
                  required: false,
                  message: 'X轴不能为空',
                },
              ],
            })(<Input />)}
            <p className="desc">
              X轴数据节点:轴线类型默认为:category,接口返回数据结构请参照官网Echart的xAxis配置
            </p>
          </FormItem>
          <FormItem label="Y轴" hasFeedback>
            {getFieldDecorator('yAxisData', {
              initialValue: get(renderConfig, 'component.props.reader.yAxisData', null),
            })(<Input />)}
            <p className="desc">
              Y轴数据节点:轴线类型默认为:value,接口返回数据结构请参照官网Echart的yAxis配置
            </p>
          </FormItem>
          <FormItem label="系列" hasFeedback>
            {getFieldDecorator('seriesData', {
              initialValue: get(renderConfig, 'component.props.reader.seriesData', null),
              rules: [
                {
                  required: false,
                  message: '系列不能为空',
                },
              ],
            })(<Input />)}
            <p className="desc">系列数据节点:接口返回数据结构请参照官网Echart的series配置</p>
          </FormItem>
          <div className="title-group">其它</div>
          <FormItem label="显示汇总" {...formItemInlineLayout} style={{ marginBottom: 0 }}>
            <Switch size="small" checked={showSummary} onChange={this.handlerSummaryChange} />
          </FormItem>
          {showSummary ? (
            <>
              <FormItem label="汇总标题" hasFeedback>
                {getFieldDecorator('summaryTitle', {
                  initialValue: get(renderConfig, 'component.props.summary.title', null),
                  rules: [
                    {
                      required: true,
                      message: '汇总标题不能为空',
                    },
                  ],
                })(<Input />)}
              </FormItem>
              <FormItem label="汇总数据" hasFeedback>
                {getFieldDecorator('summaryData', {
                  initialValue: get(renderConfig, 'component.props.summary.data', null),
                  rules: [
                    {
                      required: true,
                      message: '汇总数据不能为空',
                    },
                  ],
                })(<Input />)}
                <p className="desc">接口返回数据体的汇总数据节点属性名称</p>
              </FormItem>
            </>
          ) : null}
        </Form>
      </div>
    );
  }
}

export default EchartBarLineForm;
