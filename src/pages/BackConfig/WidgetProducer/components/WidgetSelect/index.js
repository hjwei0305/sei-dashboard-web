import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cls from 'classnames';
import { isEqual } from 'lodash';
import { Popover, Button } from 'antd';
import { ScrollBar, ExtIcon, ListLoader } from 'suid';
import styles from './index.less';

class WidgetSelect extends PureComponent {
  static propTypes = {
    onChange: PropTypes.func,
    widget: PropTypes.object,
    dataSource: PropTypes.array,
    loading: PropTypes.bool,
  };

  static defaultProps = {
    widget: null,
    loading: false,
    dataSource: [],
  };

  constructor(props) {
    super(props);
    const { widget } = props;
    this.state = {
      currentWidget: widget,
      visible: false,
    };
  }

  componentDidUpdate(preProps) {
    const { widget } = this.props;
    if (!isEqual(preProps.widget, widget)) {
      this.setState({ currentWidget: widget });
    }
  }

  handlerChangeSelect = currentWidget => {
    const { onChange } = this.props;
    this.setState(
      {
        currentWidget,
        visible: false,
      },
      () => {
        if (onChange) {
          onChange(currentWidget);
        }
      },
    );
  };

  handlerVisibleChange = visible => {
    this.setState({ visible });
  };

  renderWidgetItem = () => {
    const { loading, dataSource } = this.props;
    const { currentWidget } = this.state;
    return (
      <div className={cls('widget-box-wrap')}>
        {loading ? (
          <ListLoader />
        ) : (
          <ScrollBar>
            <div className={cls('icon-box', { [styles.loading]: loading })}>
              {dataSource.map(m => (
                <div
                  className={cls('widget-item', {
                    [styles.selected]: currentWidget && m.code === currentWidget.code,
                  })}
                  key={m.code}
                  onClick={() => this.handlerChangeSelect(m)}
                >
                  <div
                    className="vertical ceneter"
                    style={{ height: '100%', justifyContent: 'center' }}
                  >
                    <ExtIcon className="icon" type={m.iconType} style={{ fontSize: 36 }} />
                    <div className="title">{m.name}</div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollBar>
        )}
      </div>
    );
  };

  render() {
    const { visible } = this.state;
    return (
      <Popover
        trigger="click"
        visible={visible}
        placement="bottomLeft"
        onVisibleChange={this.handlerVisibleChange}
        overlayClassName={styles['widget-box-popover']}
        content={this.renderWidgetItem()}
      >
        <Button type="primary" ghost>
          组件类型
        </Button>
      </Popover>
    );
  }
}

export default WidgetSelect;
