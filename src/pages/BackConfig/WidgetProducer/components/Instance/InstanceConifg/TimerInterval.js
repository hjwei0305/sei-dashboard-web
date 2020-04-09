import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cls from 'classnames';
import { Menu, Button } from 'antd';
import { ExtIcon } from 'suid';
import { DropOption } from '@/components';
import styles from './TimerInterval.less';

const timerData = [5, 10, 15, 30];

class TimerInterval extends PureComponent {
    static propTypes = {
        interval: PropTypes.number,
        onChange: PropTypes.func.isRequired,
    };

    static defaultProps = {
        interval: 0,
    };

    constructor(props) {
        super(props);
        const { interval } = props;
        this.state = {
            currentInterval: interval || 0,
        }
    }

    handlerChange = e => {
        const { key } = e;
        const { onChange } = this.props;
        this.setState({
            currentInterval: key,
        }, () => {
            if (onChange) {
                onChange(key);
            }
        });
    };

    getTimerMenu = () => {
        const { currentInterval } = this.state;
        return (
            <Menu
                onClick={this.handlerChange}
                selectedKeys={[currentInterval]}
            >
                {
                    timerData.map((t) => (
                        <Menu.Item key={t}>
                            {`${t} 分钟`}
                            {
                                currentInterval.toString() === t.toString()
                                    ? <ExtIcon type="check" antd style={{ float: 'right', lineHeight: 2 }} />
                                    : null
                            }
                        </Menu.Item>
                    ))
                }
            </Menu>
        )
    };

    render() {
        return (
            <div className={cls(styles["timer-interval-box"])}>
                <DropOption
                    overlay={this.getTimerMenu()}
                >
                    <Button className='trigger-item' icon="down" antd />
                </DropOption>
            </div>
        );
    }
}

export default TimerInterval;
