import React, { PureComponent } from "react";
import cls from "classnames";
import { omit, get } from 'lodash'
import { Form, Input } from "antd";
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


@Form.create()
class FeatureGroupForm extends PureComponent {

  componentDidMount() {
    const { onFormRef } = this.props;
    if (onFormRef) {
      onFormRef(this);
    }
  }

  handlerFormSubmit = _ => {
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
      console.log(renderConfig);
      params.renderConfig = JSON.stringify(renderConfig);
      save(params);
    });
  };

  render() {
    const { form, editData, widget } = this.props;
    const renderConfig = editData ? JSON.parse(editData.renderConfig) : {};
    const { getFieldDecorator } = form;
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
