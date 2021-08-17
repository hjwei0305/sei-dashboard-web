import React, { PureComponent } from 'react';
import cls from 'classnames';
import { toUpper, trim, get } from 'lodash';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import { Button, Form, Input, InputNumber } from 'antd';
import { utils } from 'suid';
import styles from './Form.less';

const { TextArea } = Input;
const { objectAssignAppend } = utils;
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: {
    span: 5,
  },
  wrapperCol: {
    span: 19,
  },
};

@Form.create()
class FeatureGroupForm extends PureComponent {
  handlerFormSubmit = () => {
    const { form, saveWidgetGroup, groupData, handlerPopoverHide } = this.props;
    const { validateFields, getFieldsValue } = form;
    validateFields(errors => {
      if (errors) {
        return;
      }
      const data = objectAssignAppend(getFieldsValue(), groupData || {});
      data.code = toUpper(trim(data.code));
      saveWidgetGroup(data, handlerPopoverHide);
    });
  };

  render() {
    const { form, groupData, saving } = this.props;
    const { getFieldDecorator } = form;
    const title = groupData ? formatMessage({id: 'dashboard_000104', defaultMessage: '编辑看板组'}) : formatMessage({id: 'dashboard_000105', defaultMessage: '新建看板组'});
    return (
      <div key="form-box" className={cls(styles['form-box'])}>
        <div className="base-view-body">
          <div className="header">
            <span className="title">{title}</span>
          </div>
          <Form {...formItemLayout}>
            <FormItem label={formatMessage({ id: 'global.name', defaultMessage: '名称' })}>
              {getFieldDecorator('name', {
                initialValue: groupData ? groupData.name : '',
                rules: [
                  {
                    required: true,
                    message: formatMessage({
                      id: 'global.name.required',
                      defaultMessage: '名称不能为空',
                    }),
                  },
                ],
              })(<Input autoComplete="off" />)}
            </FormItem>
            <FormItem label={formatMessage({id: 'dashboard_000041', defaultMessage: '代码'})}>
              {getFieldDecorator('code', {
                initialValue: groupData ? groupData.code : '',
                rules: [
                  {
                    required: true,
                    message: formatMessage({
                      id: 'global.code.required',
                      defaultMessage: '代码不能为空',
                    }),
                  },
                ],
              })(
                <Input
                  autoComplete="off"
                  disabled={!!groupData}
                  maxLength={30}
                  placeholder={formatMessage({
                    id: 'global.code.tip',
                    defaultMessage: '规则:名称各汉字首字母大写',
                  })}
                />,
              )}
            </FormItem>
            <FormItem label={formatMessage({id: 'dashboard_000093', defaultMessage: '描述'})}>
              {getFieldDecorator('description', {
                initialValue: get(groupData, 'description', null),
                rules: [
                  {
                    required: true,
                    message: formatMessage({id: 'dashboard_000108', defaultMessage: '功能描述不能为空'}),
                  },
                ],
              })(<TextArea style={{ resize: 'none' }} autoSize={false} rows={4} />)}
            </FormItem>
            <FormItem label={formatMessage({id: 'dashboard_000048', defaultMessage: '序号'})}>
              {getFieldDecorator('rank', {
                initialValue: get(groupData, 'rank', null),
                rules: [
                  {
                    required: true,
                    message: formatMessage({id: 'dashboard_000049', defaultMessage: '序号不能为空'}),
                  },
                ],
              })(<InputNumber precision={0} />)}
            </FormItem>
            <FormItem wrapperCol={{ span: 4, offset: 5 }} className="btn-submit">
              <Button type="primary" loading={saving} onClick={this.handlerFormSubmit}>
                <FormattedMessage id="global.save" defaultMessage="保存" />
              </Button>
            </FormItem>
          </Form>
        </div>
      </div>
    );
  }
}

export default FeatureGroupForm;
