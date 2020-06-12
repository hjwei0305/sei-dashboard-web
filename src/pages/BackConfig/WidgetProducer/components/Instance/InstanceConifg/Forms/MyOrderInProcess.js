import React, { PureComponent } from 'react';
import cls from 'classnames';
import { omit, get } from 'lodash';
import { Form, Input, Switch, InputNumber, Radio } from 'antd';
import { DropdownOption } from '@/components';
import styles from './MyWorkDone.less';

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
class MyWorkDoneForm extends PureComponent {
  constructor(props) {
    super(props);
    const { editData } = props;
    const renderConfig = editData ? JSON.parse(editData.renderConfig) : {};
    this.state = {
      timer: get(renderConfig, 'component.props.timer.interval', 0) > 0,
    };
  }

  componentDidMount() {
    const { onFormRef } = this.props;
    if (onFormRef) {
      onFormRef(this);
    }
  }

  handlerFormSubmit = () => {
    const { timer } = this.state;
    const { form, save, editData, widget, widgetGroup, color } = this.props;
    form.validateFields((err, formData) => {
      if (err) {
        return;
      }
      const params = {
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
            title: params.name,
            maxCount: rest.maxCount,
            store: {
              url: rest.storeUrl,
              type: rest.storeType,
            },
            reader: {
              data: rest.readerData,
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

  handlerTimerIntervalChange = interval => {
    const { form } = this.props;
    form.setFieldsValue({
      interval,
    });
  };

  handlerMaxCountIntervalChange = maxCount => {
    const { form } = this.props;
    form.setFieldsValue({
      maxCount,
    });
  };

  render() {
    const { timer } = this.state;
    const { form, editData, widget } = this.props;
    const renderConfig = editData ? JSON.parse(editData.renderConfig) : {};
    const { getFieldDecorator } = form;
    const timerInterval = get(renderConfig, 'component.props.timer.interval', 0);
    const maxCountInterval = get(renderConfig, 'component.props.maxCount', 5);
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
          <div className="title-group">类别数据配置</div>
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
          <FormItem label="请求类型">
            {getFieldDecorator('storeType', {
              initialValue: get(renderConfig, 'component.props.store.type', 'POST'),
            })(
              <Radio.Group defaultValue="POST" size="small">
                <Radio.Button value="POST">POST</Radio.Button>
                <Radio.Button value="GET">GET</Radio.Button>
              </Radio.Group>,
            )}
            <p className="desc">数据接口请求类型</p>
          </FormItem>
          <FormItem label="最大记录数" layout="inline" className="timer-body">
            {getFieldDecorator('maxCount', {
              initialValue: maxCountInterval,
            })(<InputNumber precision={0} />)}
            <DropdownOption
              suffix="条"
              interval={maxCountInterval}
              onChange={this.handlerMaxCountIntervalChange}
            />
            <p className="desc">接口获取在办单据最大条数</p>
          </FormItem>
          <FormItem label="数据节点" hasFeedback>
            {getFieldDecorator('readerData', {
              initialValue: get(renderConfig, 'component.props.reader.data', null),
              rules: [
                {
                  required: true,
                  message: '数据节点不能为空',
                },
              ],
            })(<Input />)}
            <p className="desc">接口返回数据体的属性名</p>
          </FormItem>
        </Form>
      </div>
    );
  }
}

export default MyWorkDoneForm;