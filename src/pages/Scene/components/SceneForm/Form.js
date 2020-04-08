/*
 * @Author: Eason 
 * @Date: 2020-04-03 11:21:32 
 * @Last Modified by: Eason
 * @Last Modified time: 2020-04-08 17:57:18
 */

import React, { PureComponent } from "react";
import cls from "classnames";
import { trim, get } from 'lodash'
import { formatMessage, FormattedMessage } from "umi-plugin-react/locale";
import { Button, Form, Input,Switch } from "antd";
import { utils } from "suid";
import { getHashCode } from '../../../../utils'
import styles from "./Form.less";

const { objectAssignAppend } = utils;
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: {
    span: 5
  },
  wrapperCol: {
    span: 19
  }
};

@Form.create()
class SceneForm extends PureComponent {

  handlerFormSubmit = _ => {
    const { form, saveScene, editData, handlerPopoverHide } = this.props;
    const { validateFields, getFieldsValue } = form;
    validateFields(errors => {
      if (errors) {
        return;
      }
      const data = objectAssignAppend(getFieldsValue(), editData || {});
      data.code = trim(data.code || getHashCode());
      saveScene(data, handlerPopoverHide);
    });
  };

  render() {
    const { form, editData, saving } = this.props;
    const { getFieldDecorator } = form;
    const title = editData ? '编辑场景' : '新建场景';
    return (
      <div key="form-box" className={cls(styles["form-box"])}>
        <div className="base-view-body">
          <div className="header">
            <span className="title">
              {title}
            </span>
          </div>
          <Form {...formItemLayout}>
            <FormItem label="代码">
              {getFieldDecorator("code", {
                initialValue: get(editData, 'code', ''),
                rules: [{
                  required: false,
                  message: '自动生成'
                }]
              })(
                <Input disabled autoComplete='off' />
              )}
            </FormItem>
            <FormItem label={formatMessage({ id: "global.name", defaultMessage: "名称" })}>
              {getFieldDecorator("name", {
                initialValue: get(editData, 'name', ''),
                rules: [{
                  required: true,
                  message: formatMessage({ id: "global.name.required", defaultMessage: "名称不能为空" })
                }]
              })(
                <Input autoComplete='off' />
              )}
            </FormItem>
            <FormItem label={formatMessage({ id: "global.isHome", defaultMessage: "平台仪表盘" })}>
            {getFieldDecorator("isHome", {
              initialValue: get(editData, 'isHome', false),
              valuePropName: "checked"
            })(<Switch size="small" />)}
          </FormItem>
            <FormItem wrapperCol={{ span: 4, offset: 5 }} className="btn-submit">
              <Button
                type="primary"
                loading={saving}
                onClick={this.handlerFormSubmit}
              >
                <FormattedMessage id='global.save' defaultMessage='保存' />
              </Button>
            </FormItem>
          </Form>
        </div>
      </div>
    );
  }
}

export default SceneForm;
