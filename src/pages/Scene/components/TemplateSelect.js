/*
 * @Author: Eason
 * @Date: 2020-04-03 11:20:59
 * @Last Modified by: Eason
 * @Last Modified time: 2021-12-13 18:22:29
 */

import React, { Component } from 'react';
import cls from 'classnames';
import { Drawer, Card, List, Skeleton } from 'antd';
import { ScrollBar, ListLoader, ExtIcon, Animate } from 'suid';
import { formatMessage } from 'umi-plugin-react/locale';
import { constants } from '../../../utils';
import styles from './TemplateSelect.less';

const { LOCAL_PATH } = constants;

class TemplateSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showShadow: false,
    };
  }

  handlerClose = () => {
    const { onAssetsClose } = this.props;
    if (onAssetsClose) {
      onAssetsClose();
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
    // this.setState({ showShadow: true })
  };

  handerYReachStart = () => {
    // this.setState({ showShadow: false })
  };

  render() {
    const { showShadow } = this.state;
    const {
      showScreenTemplateAssets,
      templateAssetList,
      loading,
      currentScreenTemplate,
    } = this.props;
    let headerStyle = {};
    if (showShadow) {
      headerStyle = {
        boxShadow: ' 0 2px 8px rgba(0, 0, 0, 0.15)',
        zIndex: 1,
      };
    }
    const loadProps = {
      spinning: loading,
      indicator: <ListLoader />,
    };
    return (
      <Drawer
        title={formatMessage({
          id: 'dashboard_000240',
          defaultMessage: '设置大屏模板, 快捷键关闭ESC',
        })}
        placement="right"
        width={420}
        className={cls(styles['assets-box'])}
        headerStyle={headerStyle}
        getContainer={false}
        style={{ position: 'absolute' }}
        onClose={this.handlerClose}
        visible={showScreenTemplateAssets}
      >
        <ScrollBar onYReachStart={this.handerYReachStart} onScrollDown={this.handerScrollDown}>
          <List
            dataSource={templateAssetList}
            loading={loadProps}
            renderItem={item => (
              <List.Item key={item.name}>
                <Skeleton loading={loading} active>
                  <Card
                    bordered
                    hoverable
                    className={cls({ selected: currentScreenTemplate === item.name })}
                    onClick={e => this.handlerChangeScreenTemplate(item, e)}
                    cover={<img alt="snapshot" src={`${LOCAL_PATH}/images/${item.snapshot}`} />}
                  >
                    <Card.Meta title={item.title} />
                    <div className="corner">
                      <Animate type="bounceIn">
                        <ExtIcon type="selected" style={{ fontSize: 24 }} />
                      </Animate>
                    </div>
                  </Card>
                </Skeleton>
              </List.Item>
            )}
          />
        </ScrollBar>
      </Drawer>
    );
  }
}

export default TemplateSelect;
