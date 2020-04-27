import React, { PureComponent } from 'react';
import { trim, get } from 'lodash';
import { Form, Input, InputNumber } from 'antd';
import { formatMessage } from 'umi-plugin-react/locale';
import { ExtModal } from 'suid';

const FormItem = Form.Item;
const { TextArea } = Input;
const formItemLayout = {
  labelCol: {
    span: 3,
  },
  wrapperCol: {
    span: 21,
  },
};

@Form.create()
class FormModal extends PureComponent {
  handlerFormSubmit = () => {
    const { form, save, rowData } = this.props;
    form.validateFields((err, formData) => {
      if (err) {
        return;
      }
      const params = {};
      Object.assign(params, rowData || {});
      Object.assign(params, formData);
      params.code = trim(params.code);
      save(params);
    });
  };

  render() {
    const { form, rowData, closeFormModal, saving, showModal } = this.props;
    const { getFieldDecorator } = form;
    const title = rowData
      ? formatMessage({
          id: 'componentType.edit',
          defaultMessage: '编辑组件',
        })
      : formatMessage({ id: 'componentType.add', defaultMessage: '新建组件' });
    return (
      <ExtModal
        destroyOnClose
        onCancel={closeFormModal}
        visible={showModal}
        centered
        bodyStyle={{ paddingBottom: 0 }}
        confirmLoading={saving}
        title={title}
        onOk={this.handlerFormSubmit}
      >
        <Form {...formItemLayout} layout="horizontal">
          <FormItem label={formatMessage({ id: 'global.code', defaultMessage: '代码' })}>
            {getFieldDecorator('code', {
              initialValue: get(rowData, 'code', ''),
              rules: [
                {
                  required: true,
                  message: formatMessage({
                    id: 'global.code.required',
                    defaultMessage: '代码不能为空',
                  }),
                },
              ],
            })(<Input disabled={!!rowData} />)}
          </FormItem>
          <FormItem label={formatMessage({ id: 'global.name', defaultMessage: '名称' })}>
            {getFieldDecorator('name', {
              initialValue: get(rowData, 'name', ''),
              rules: [
                {
                  required: true,
                  message: formatMessage({
                    id: 'global.name.required',
                    defaultMessage: '名称不能为空',
                  }),
                },
              ],
            })(<Input maxLength={30} />)}
          </FormItem>
          <FormItem label="图标">
            {getFieldDecorator('iconType', {
              initialValue: get(rowData, 'iconType', ''),
              rules: [
                {
                  required: true,
                  message: '图标不能为空',
                },
              ],
            })(<Input maxLength={50} />)}
          </FormItem>
          <FormItem label={formatMessage({ id: 'global.description', defaultMessage: '描述' })}>
            {getFieldDecorator('description', {
              initialValue: get(rowData, 'description', ''),
              rules: [
                {
                  required: true,
                  message: '描述不能为空',
                },
              ],
            })(<TextArea style={{ resize: 'none' }} autoSize={false} rows={4} />)}
          </FormItem>
          <FormItem label="序号">
            {getFieldDecorator('rank', {
              initialValue: get(rowData, 'rank', 0),
              rules: [
                {
                  required: true,
                  message: '序号不能为空',
                },
              ],
            })(<InputNumber precision={0} />)}
          </FormItem>
        </Form>
      </ExtModal>
    );
  }
}

export default FormModal;
