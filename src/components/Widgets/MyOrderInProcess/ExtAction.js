import React, { PureComponent } from 'react';
import cls from 'classnames';
import { get } from 'lodash';
import { Dropdown, Menu } from 'antd';
import { utils, ExtIcon, WorkFlow } from 'suid';
import { formatMessage } from 'umi-plugin-react/locale';
import { constants } from '@/utils';
import styles from './ExtAction.less';

const { getUUID } = utils;
const { USER_ACTION } = constants;
const { Item } = Menu;

const { FlowHistoryButton } = WorkFlow;

const menuData = () => [
  {
    title: formatMessage({ id: 'dashboard_000211', defaultMessage: '查看单据' }),
    key: USER_ACTION.VIEW_ORDER,
    disabled: false,
  },
  {
    title: formatMessage({ id: 'dashboard_000212', defaultMessage: '审批历史' }),
    key: USER_ACTION.FLOW_HISTORY,
    disabled: false,
  },
  {
    title: formatMessage({ id: 'dashboard_000219', defaultMessage: '终止审批' }),
    key: USER_ACTION.FLOW_END,
    disabled: true,
  },
];

class ExtAction extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      menuShow: false,
      selectedKeys: '',
      menusData: [],
    };
  }

  componentDidMount() {
    this.initActionMenus();
  }

  initActionMenus = () => {
    const { doneItem } = this.props;
    const menus = menuData();
    if (doneItem.canManuallyEnd === true) {
      menus.forEach(m => {
        if (m.key === USER_ACTION.FLOW_END) {
          Object.assign(m, { disabled: false });
        }
      });
    }
    const mData = menus.filter(m => !m.disabled);
    this.setState({
      menusData: mData,
    });
  };

  onActionOperation = e => {
    e.domEvent.stopPropagation();
    this.setState({
      selectedKeys: '',
      menuShow: false,
    });
    const { onAction, doneItem } = this.props;
    if (onAction) {
      onAction(e.key, doneItem);
    }
  };

  getMenu = (menus, record) => {
    const { selectedKeys } = this.state;
    const menuId = getUUID();
    const businessId = get(record, 'businessId', null);
    const flowInstanceId = get(record, 'flowInstanceId', null);
    return (
      <Menu
        id={menuId}
        className={cls(styles['action-menu-box'])}
        onClick={e => this.onActionOperation(e, record)}
        selectedKeys={[selectedKeys]}
      >
        {menus.map(m => {
          if (m.key === USER_ACTION.FLOW_END) {
            return (
              <Item key={m.key} className={cls('warning')}>
                <span className="view-popover-box-trigger">{m.title}</span>
              </Item>
            );
          }
          if (m.key === USER_ACTION.FLOW_HISTORY) {
            return (
              <Item key={m.key}>
                <FlowHistoryButton businessId={businessId} flowInstanceId={flowInstanceId}>
                  <span className="view-popover-box-trigger">{m.title}</span>
                </FlowHistoryButton>
              </Item>
            );
          }
          return (
            <Item key={m.key}>
              <span className="view-popover-box-trigger">{m.title}</span>
            </Item>
          );
        })}
      </Menu>
    );
  };

  onVisibleChange = v => {
    const { selectedKeys } = this.state;
    this.setState({
      menuShow: v,
      selectedKeys: !v ? '' : selectedKeys,
    });
  };

  render() {
    const { doneItem } = this.props;
    const { menuShow, menusData } = this.state;
    return (
      <>
        {menusData.length > 0 ? (
          <Dropdown
            trigger={['click']}
            overlay={this.getMenu(menusData, doneItem)}
            className="action-drop-down"
            placement="bottomLeft"
            visible={menuShow}
            onVisibleChange={this.onVisibleChange}
          >
            <ExtIcon className={cls('action-item')} type="more" antd />
          </Dropdown>
        ) : null}
      </>
    );
  }
}

export default ExtAction;
