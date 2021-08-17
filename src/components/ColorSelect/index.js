import React, { PureComponent, Fragment } from 'react';
import { SketchPicker } from 'react-color';
import PropTypes from 'prop-types';
import { isEqual } from 'lodash';
import { Tooltip } from 'antd';
import { ExtIcon } from 'suid';
import { formatMessage } from 'umi-plugin-react/locale';
import DropOption from '../DropOption';

class ColorSelect extends PureComponent {
  static propTypes = {
    onChange: PropTypes.func,
    color: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    triggerStyle: PropTypes.object,
  };

  static defaultProps = {
    color: '#000000',
    triggerStyle: null,
  };

  constructor(props) {
    super(props);
    this.state = {
      color: props.color,
    };
  }

  componentDidUpdate(preProps) {
    const { color } = this.props;
    if (!isEqual(preProps.color, color)) {
      this.setState({ color });
    }
  }

  handlerChange = color => {
    const { onChange } = this.props;
    this.setState(
      {
        color: color.hex,
      },
      () => {
        if (onChange) {
          onChange(color.hex);
        }
      },
    );
  };

  getColorPicker = () => {
    const { color } = this.state;
    return <SketchPicker width={240} color={color} disableAlpha onChange={this.handlerChange} />;
  };

  render() {
    const { triggerStyle, children } = this.props;
    return (
      <Fragment>
        <DropOption overlay={this.getColorPicker()}>
          <Tooltip title={formatMessage({id: 'dashboard_000225', defaultMessage: '设置图标颜色'})} placement="top" arrowPointAtCenter>
            {children || <ExtIcon type="bg-colors" style={{ ...triggerStyle }} antd />}
          </Tooltip>
        </DropOption>
      </Fragment>
    );
  }
}

export default ColorSelect;
