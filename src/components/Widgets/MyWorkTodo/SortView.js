import React, { PureComponent } from 'react';
import cls from 'classnames';
import { Dropdown, Menu } from 'antd';
import { utils, ExtIcon, Animate } from 'suid';
import { constants } from '@/utils';
import styles from './SortView.less';

const { getUUID } = utils;
const { FLOW_TODO_SORT } = constants;
const { Item } = Menu;

const menuData = [
  {
    title: '升序',
    key: FLOW_TODO_SORT.ASC,
    disabled: false,
  },
  {
    title: '降序',
    key: FLOW_TODO_SORT.DESC,
    disabled: false,
  },
];

class SortView extends PureComponent {
  constructor(props) {
    super(props);
    const { sortTpe } = props;
    this.state = {
      menuShow: false,
      selectedKey: sortTpe || FLOW_TODO_SORT.ASC,
      menusData: menuData,
    };
  }

  onActionOperation = e => {
    e.domEvent.stopPropagation();
    this.setState({
      selectedKey: e.key,
      menuShow: false,
    });
    const { onSort } = this.props;
    if (onSort) {
      onSort(e.key);
    }
  };

  getMenu = menus => {
    const { selectedKey } = this.state;
    const menuId = getUUID();
    return (
      <Menu
        id={menuId}
        className={cls(styles['action-menu-box'])}
        onClick={e => this.onActionOperation(e)}
        selectedKeys={[selectedKey]}
      >
        {menus.map(m => {
          return (
            <Item key={m.key}>
              {m.key === selectedKey ? <ExtIcon type="check" className="selected" antd /> : null}
              <span className="view-popover-box-trigger">{m.title}</span>
            </Item>
          );
        })}
      </Menu>
    );
  };

  onVisibleChange = v => {
    this.setState({
      menuShow: v,
    });
  };

  render() {
    const { menuShow, menusData, selectedKey } = this.state;
    return (
      <>
        <Dropdown
          trigger={['hover']}
          overlay={this.getMenu(menusData)}
          className="action-drop-down"
          placement="bottomLeft"
          visible={menuShow}
          onVisibleChange={this.onVisibleChange}
        >
          <span className="sort-box">
            <span className="label">待办到达时间</span>
            <Animate type="bounceIn" style={{ display: 'inline-block' }}>
              <ExtIcon className={cls('action-item')} type={selectedKey} />
            </Animate>
          </span>
        </Dropdown>
      </>
    );
  }
}

export default SortView;
