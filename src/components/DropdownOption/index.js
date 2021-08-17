import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cls from 'classnames';
import { Menu, Button } from 'antd';
import { ExtIcon } from 'suid';
import DropOption from '../DropOption';
import styles from './index.less';

const timerData = [5, 10, 15, 30];

class DropdownOption extends PureComponent {
  static propTypes = {
    suffix: PropTypes.string,
    interval: PropTypes.number,
    onChange: PropTypes.func.isRequired,
  };

  static defaultProps = {
    interval: 0,
    suffix: formatMessage({id: 'dashboard_000224', defaultMessage: '分钟'}),
  };

  constructor(props) {
    super(props);
    const { interval } = props;
    this.state = {
      currentInterval: interval || 0,
    };
  }

  handlerChange = e => {
    const { key } = e;
    const { onChange } = this.props;
    const interval = Number(key);
    this.setState(
      {
        currentInterval: interval,
      },
      () => {
        if (onChange) {
          onChange(interval);
        }
      },
    );
  };

  getTimerMenu = () => {
    const { currentInterval } = this.state;
    const { suffix } = this.props;
    return (
      <Menu onClick={this.handlerChange} selectedKeys={[currentInterval]}>
        {timerData.map(t => (
          <Menu.Item key={t}>
            {`${t} ${suffix}`}
            {currentInterval.toString() === t.toString() ? (
              <ExtIcon type="check" antd style={{ float: 'right', lineHeight: 2 }} />
            ) : null}
          </Menu.Item>
        ))}
      </Menu>
    );
  };

  render() {
    return (
      <div className={cls(styles['timer-interval-box'])}>
        <DropOption overlay={this.getTimerMenu()}>
          <Button className="trigger-item" icon="down" />
        </DropOption>
      </div>
    );
  }
}

export default DropdownOption;
