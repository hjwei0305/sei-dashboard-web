import React, { PureComponent } from "react";
import cls from "classnames";
import { toUpper, trim, get } from 'lodash'
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

  onFormSubmit = _ => {
    const { form, save, currentPageRow, featureData, currentFeatureGroup, handlerPopoverHide } = this.props;
    form.validateFields((err, formData) => {
      if (err) {
        return;
      }
      let params = {
        featureType: 'Operate',
        featureGroupId: currentFeatureGroup.id,
        featureGroupCode: currentFeatureGroup.code,
        featureGroupName: currentFeatureGroup.name,
        groupCode: currentPageRow.groupCode,
      };
      Object.assign(params, featureData || {});
      Object.assign(params, formData);
      params.code = `${currentFeatureGroup.code}-${toUpper(trim(params.code))}`;
      save(params, handlerPopoverHide);
    });
  };

  render() {
    const { form, formData, widget } = this.props;
    const { getFieldDecorator } = form;
    return (
      <div className={cls(styles['form-box'])}>
        <Form {...formItemLayout} layout="vertical">
          <div className='title-group'>基本配置</div>
          <FormItem hasFeedback label="组件类型">
            {getFieldDecorator('widgetType', {
              initialValue: get(formData, 'component.name', widget.name || null),
              rules: [
                {
                  required: true,
                },
              ],
            })(<Input addonBefore={get(formData, 'component.type', widget.code || null)} disabled />)}
          </FormItem>
          <FormItem hasFeedback label="业务名称">
            {getFieldDecorator('name', {
              initialValue: get(formData, 'name', null),
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
              initialValue: get(formData, 'description', null),
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
              initialValue: get(formData, 'component.props.seriesName', null),
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
              initialValue: get(formData, 'component.props.store.url', null),
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
          <FormItem label="图例" hasFeedback>
            {getFieldDecorator('legendData', {
              initialValue: get(formData, 'component.props.reader.legendData', null),
              rules: [
                {
                  required: true,
                  message: '图例不能为空',
                },
              ],
            })(
              <Input />
            )}
          </FormItem>
          <FormItem label="系列" hasFeedback>
            {getFieldDecorator('seriesData', {
              initialValue: get(formData, 'component.props.reader.seriesData', null),
              rules: [
                {
                  required: true,
                  message: '系列不能为空',
                },
              ],
            })(
              <Input />
            )}
          </FormItem>
        </Form>
      </div >
    );
  }
}

export default FeatureGroupForm;
