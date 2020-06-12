import React, { PureComponent } from 'react';
import cls from 'classnames';
import { Dropdown, Menu, Popconfirm } from 'antd';
import { utils, ExtIcon, WorkFlow } from 'suid';
import { constants } from '@/utils';
import styles from './ExtAction.less';

const { getUUID } = utils;
const { WORK_DONE_ACTION, FLOW_STATUS } = constants;
const { Item } = Menu;

const { FlowHistoryButton } = WorkFlow;

const menuData = () => [
  {
    title: '查看单据',
    key: WORK_DONE_ACTION.VIEW_ORDER,
    disabled: false,
  },
  {
    title: '审批历史',
    key: WORK_DONE_ACTION.FLOW_HISTORY,
    disabled: false,
  },
  {
    title: '我要撤回',
    key: WORK_DONE_ACTION.FLOW_REVOKE,
    disabled: true,
    icon: 'right',
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
    if (
      doneItem.taskStatus === FLOW_STATUS.COMPLETED &&
      doneItem.canCancel === true &&
      doneItem.flowInstanceEnded === false
    ) {
      menus.forEach(m => {
        if (m.key === WORK_DONE_ACTION.FLOW_REVOKE) {
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
    if (e.key === WORK_DONE_ACTION.FLOW_END) {
      this.setState({
        selectedKeys: e.key,
        menuShow: true,
      });
    } else {
      this.setState({
        selectedKeys: '',
        menuShow: false,
      });
      const { onAction, doneItem } = this.props;
      if (onAction) {
        onAction(e.key, doneItem);
      }
    }
  };

  action = (e, key, record) => {
    e && e.stopPropagation();
    this.props.action(key, record);
    this.setState({
      selectedKeys: '',
      menuShow: false,
    });
  };

  cancelAction = e => {
    e.stopPropagation();
    this.setState({
      selectedKeys: '',
      menuShow: false,
    });
  };

  getMenu = (menus, record) => {
    const { selectedKeys } = this.state;
    const menuId = getUUID();
    return (
      <Menu
        id={menuId}
        className={cls(styles['action-menu-box'])}
        onClick={e => this.onActionOperation(e, record)}
        selectedKeys={[selectedKeys]}
      >
        {menus.map(m => {
          if (m.key === WORK_DONE_ACTION.FLOW_END) {
            return (
              <Item key={m.key} className={cls('warning')}>
                <Popconfirm
                  overlayClassName={cls(styles['pop-confirm-box'])}
                  title="确定要撤回吗？"
                  placement="top"
                  getPopupContainer={document.getElementById(menuId)}
                  onCancel={e => this.cancelAction(e)}
                  onConfirm={e => this.action(e, m.key, record)}
                >
                  <span className="view-popover-box-trigger">{m.title}</span>
                  <ExtIcon type="right" antd />
                </Popconfirm>
              </Item>
            );
          }
          if (m.key === WORK_DONE_ACTION.FLOW_HISTORY) {
            return (
              <Item key={m.key}>
                <FlowHistoryButton businessId={record.flowInstanceBusinessId}>
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
