import React, { Component } from 'react';
import cls from 'classnames';
import PropTypes from 'prop-types';
import { get, omit, startCase } from 'lodash';
import * as echarts from 'echarts';
import { Col, Layout, Row } from 'antd';
import { formatMessage } from 'umi-plugin-react/locale';
import TimeClock from '../../TimeClock';
import Widgets from '../../Widgets';
import { constants } from '../../../utils';
import styles from './index.less';

const { Header, Content } = Layout;
const { COMPONENT_TYPE } = constants;
const { EchartPie, EchartBarLine, StatisticGrid, EchartGauge } = Widgets;
const linearColor = [
  { start: '#d83cb9', end: '#de5e6d' },
  { start: '#0fc6ff', end: '#0a67e8' },
  { start: '#ffde03', end: '#f88f10' },
];

class TechBlueAdv extends Component {
  static propTypes = {
    editor: PropTypes.bool,
    templateConfig: PropTypes.object,
    instanceDtos: PropTypes.array,
  };

  getFormConifgValue = (field, defaultValue) => {
    const { templateConfig } = this.props;
    const regionRoot = field.split('-')[0];
    let value = defaultValue;
    const areas = get(templateConfig, [regionRoot, 'areas']) || {};
    Object.keys(areas).forEach(areaKey => {
      const { formConifg } = areas[areaKey];
      for (let i = 0; i < formConifg.length; i += 1) {
        const { field: formField, value: formValue } = formConifg[i];
        if (formField === field) {
          value = formValue || defaultValue;
          break;
        }
      }
    });
    return value;
  };

  setEchartPieOption = data => {
    const { seriesData } = data;
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c} ({d}%)',
      },
      grid: {
        containLabel: true,
      },
      series: [
        {
          name: '',
          type: 'pie',
          color: ['#078EFF', '#63E8F2', '#FECE3C', '#F7717D', '#BC93EF'],
          center: ['50%', '50%'],
          radius: ['40%', '60%'],
          avoidLabelOverlap: true,
          selectedMode: 'single',
          labelLine: {
            normal: {
              show: true,
              lineStyle: {
                color: '#6CBCF3',
              },
            },
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
          label: {
            formatter: '{b}\n{c}({d}%)',
          },
          data: seriesData,
        },
      ],
    };
    return option;
  };

  setEchartBarLineOption = (data, title, region, areaKey) => {
    const { seriesData, xAxisData } = data;
    let option;
    if (region === 'center') {
      if (areaKey === 'area3') {
        let yAxisData = seriesData.length > 0 ? seriesData : [];
        yAxisData = yAxisData.map(s => {
          return {
            data: s.data,
            name: s.name,
            type: 'bar',
            stack: 'total',
            emphasis: {
              focus: 'series',
            },
            barWidth: '30%',
            itemStyle: {
              borderRadius: 30,
            },
          };
        });
        option = {
          title: {
            text: title,
            textStyle: {
              color: '#6CBCF3',
            },
          },
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow',
            },
          },
          grid: {
            left: 10,
            top: 42,
            bottom: 0,
            containLabel: true,
          },
          xAxis: {
            type: 'value',
            axisLabel: {
              color: '#0fc6ff',
            },
            splitLine: {
              show: true,
              lineStyle: {
                color: '#0e388a',
              },
            },
          },
          yAxis: {
            axisTick: {
              show: false,
            },
            splitLine: {
              show: false,
            },
            axisLabel: {
              color: '#6CBCF3',
              interval: 0,
            },
            axisLine: {
              lineStyle: {
                color: '#0e388a',
              },
            },
            type: 'category',
            data: xAxisData.length > 0 ? xAxisData[0].data : [],
          },
          series: yAxisData,
        };
      }
      if (areaKey === 'area4') {
        const yAxisData = seriesData.map(s => {
          return {
            data: s.data,
            name: s.name,
            type: 'line',
            stack: 'Total',
            areaStyle: {
              opacity: 0.6,
            },
            emphasis: {
              focus: 'series',
            },
            smooth: true,
            itemStyle: {
              label: {
                show: false,
              },
            },
            lineStyle: {
              width: 1,
              type: 'solid',
            },
          };
        });
        option = {
          title: {
            text: title,
            textStyle: {
              color: '#6CBCF3',
            },
          },
          tooltip: {
            trigger: 'axis',
          },
          grid: {
            left: 10,
            right: 10,
            top: 42,
            bottom: 0,
            containLabel: true,
          },
          xAxis: [
            {
              type: 'category',
              boundaryGap: false,
              axisLine: {
                show: true,
                lineStyle: {
                  color: '#233e64',
                },
              },
              axisLabel: {
                textStyle: {
                  color: '#6a9cd5',
                },
              },
              data: xAxisData.length > 0 ? xAxisData[0].data : [],
            },
          ],
          yAxis: [
            {
              type: 'value',
              axisLabel: {
                color: '#3f6ea4',
              },
              splitLine: {
                show: true,
                lineStyle: {
                  color: '#233e64',
                },
              },
            },
          ],
          series: yAxisData,
        };
      }
    } else if (areaKey === 'area2') {
      let yAxisData = seriesData.length > 0 ? seriesData[0].data : [];
      yAxisData = yAxisData.map((v, idx) => {
        const colorIdx = linearColor[(idx + 1) % 3];
        return {
          value: v,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0.2, color: colorIdx.start },
              { offset: 1, color: colorIdx.end },
            ]),
            borderRadius: 30,
          },
        };
      });
      option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
        },
        grid: {
          left: 10,
          top: 22,
          bottom: 0,
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          axisLabel: {
            color: '#0fc6ff',
            interval: 0,
            rotate: 40,
          },
          data: xAxisData.length > 0 ? xAxisData[0].data : [],
        },
        yAxis: {
          type: 'value',
          axisLabel: {
            color: '#3f6ea4',
          },
          splitLine: {
            show: true,
            lineStyle: {
              color: '#0e388a',
            },
          },
        },
        series: [
          {
            type: 'bar',
            label: {
              show: true,
              position: 'top',
              textStyle: {
                color: 'rgba(31, 223, 255, 0.85)',
              },
            },
            barWidth: '30%',
            data: yAxisData,
          },
        ],
      };
    } else {
      option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow',
          },
        },
        grid: {
          left: 10,
          top: 10,
          height: '100%',
          containLabel: true,
        },
        xAxis: {
          show: false,
        },
        yAxis: {
          type: 'category',
          axisTick: {
            show: false,
          },
          axisLine: {
            show: false,
          },
          axisLabel: {
            color: '#6CBCF3',
            interval: 0,
          },
          data: xAxisData.length > 0 ? xAxisData[0].data : [],
        },
        series: [
          {
            type: 'bar',
            label: {
              show: true,
              position: 'right',
              textStyle: {
                color: 'rgba(31, 223, 255, 0.85)',
              },
            },
            itemStyle: {
              color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
                { offset: 0, color: '#0fc6ff' },
                { offset: 1, color: '#0a67e8' },
              ]),
              borderRadius: 30,
              shadowColor: 'rgba(10, 103, 212, 0.8)',
              shadowBlur: 10,
            },
            barWidth: '30%',
            data: seriesData.length > 0 ? seriesData[0].data : [],
          },
        ],
      };
    }
    return option;
  };

  setEchartGaugeOption = (data, title, region) => {
    const amount = get(data, 'data.amount');
    const percent = get(data, 'data.percent');
    const color = get(data, 'data.color');
    const gaugeData = [
      {
        value: percent,
        name: title,
        title: {
          offsetCenter: ['0%', '30%'],
        },
        detail: {
          valueAnimation: true,
          offsetCenter: ['0%', '-30%'],
        },
      },
    ];
    const option = {
      series: [
        {
          type: 'gauge',
          startAngle: 90,
          endAngle: -270,
          pointer: {
            show: false,
          },
          axisLine: {
            lineStyle: {
              width: 8,
              color: [[1, '#0f50a4']],
              shadowColor: 'rgba(0, 0, 0, 0.15)',
              shadowBlur: 4,
            },
          },
          progress: {
            show: true,
            overlap: false,
            roundCap: true,
            clip: false,
            itemStyle: {
              color,
              borderWidth: 0,
              shadowColor: 'rgba(0, 0, 0, 0.15)',
              shadowBlur: 10,
            },
          },
          splitLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            show: false,
          },
          data: gaugeData,
          title: {
            fontSize: region === 'center' ? 16 : 14,
            fontWeight: 'bold',
            color: '#65b2ef',
          },
          detail: {
            width: 50,
            fontSize: region === 'center' ? 24 : 16,
            color: '#f8f8f8',
            formatter: `${amount}`,
          },
        },
      ],
    };
    return option;
  };

  getWidget = (key, component, region, areaKey) => {
    const { type, props } = component;
    const style = { backgroundColor: 'rgba(255,255,255,0.02)' };
    switch (type) {
      case COMPONENT_TYPE.ECHART_PIE:
        return (
          <EchartPie
            key={key}
            {...omit(props, ['title'])}
            style={style}
            theme={null}
            overwriteOption={this.setEchartPieOption}
          />
        );
      case COMPONENT_TYPE.ECHART_BAR_LINE:
        return (
          <EchartBarLine
            key={key}
            {...omit(props, ['title'])}
            theme={null}
            style={style}
            overwriteOption={data =>
              this.setEchartBarLineOption(data, props.title, region, areaKey)
            }
          />
        );
      case COMPONENT_TYPE.ECHART_GAUGE:
        return (
          <EchartGauge
            key={key}
            {...props}
            style={style}
            overwriteOption={data => this.setEchartGaugeOption(data, props.title, region, areaKey)}
          />
        );
      case COMPONENT_TYPE.STATISTIC_GRID:
        return (
          <StatisticGrid
            key={key}
            {...omit(props, ['title'])}
            skin={null}
            className="statistic-grid-box"
          />
        );
      default:
        return null;
    }
  };

  getRenderConfigByDto = id => {
    const { instanceDtos } = this.props;
    const widgets = instanceDtos.filter(dto => dto.id === id);
    if (widgets.length === 1 && widgets[0].renderConfig) {
      const renderConfig = JSON.parse(widgets[0].renderConfig);
      const { component } = renderConfig;
      return component;
    }
    return null;
  };

  renderRegionWidget = region => {
    const { templateConfig } = this.props;
    const areas = get(templateConfig, [region, 'areas'], {}) || {};
    return Object.keys(areas).map(areaKey => {
      const { title, widgets } = get(areas, areaKey);
      const widgetKeys = Object.keys(widgets);
      const layout = this.getFormConifgValue(
        `${region}-areas-${areaKey}-layout`,
        'layout-horizontal',
      );
      return (
        <div className={cls('box-cmp', `${region}-${areaKey}`)} key={areaKey}>
          <div className="box-title" key={`${areaKey}_title`}>
            {this.getFormConifgValue(`${region}-areas-${areaKey}-title`, title)}
          </div>
          <div className={cls('box-chart', layout)} key={`${areaKey}_chart`}>
            {widgetKeys.map((key, index) => {
              const widget = widgets[key];
              if (widget && widget.renderConfig) {
                const renderConfig = JSON.parse(widget.renderConfig);
                const { component } = renderConfig;
                return this.getWidget(
                  widget.id,
                  this.getRenderConfigByDto(widget.id) || component,
                  region,
                  areaKey,
                );
              }
              const regionIndex = startCase(`${region}${index + 1}`);
              return (
                <div className="chart" key={regionIndex}>
                  {regionIndex}
                </div>
              );
            })}
          </div>
        </div>
      );
    });
  };

  render() {
    return (
      <div className={cls(styles['screen-box'])}>
        <Layout className={cls('bg')}>
          <Header className="bg-head">
            <div className="time-wrap">
              <TimeClock color="#6cbcf3" />
            </div>
            <div className="screen-title">
              {this.getFormConifgValue(
                'north-areas-area1-title',
                formatMessage({ id: 'dashboard_000223', defaultMessage: '大屏标题' }),
              )}
            </div>
          </Header>
          <Content className="view-box">
            <Row className="auto-height">
              <Col span={7} className="box">
                <div className="angle-top" />
                <div className="angle-bottom" />
                <div className="box-content">{this.renderRegionWidget('west')}</div>
              </Col>
              <Col span={10} className="center-content">
                {this.renderRegionWidget('center')}
              </Col>
              <Col span={7} className="box">
                <div className="angle-top" />
                <div className="angle-bottom" />
                <div className="box-content">{this.renderRegionWidget('east')}</div>
              </Col>
            </Row>
          </Content>
        </Layout>
      </div>
    );
  }
}

export default TechBlueAdv;
