import React, { Component } from 'react';
import cls from 'classnames';
import PropTypes from 'prop-types';
import { get, omit, startCase } from 'lodash';
import { Col, Layout, Row } from "antd";
import TimeClock from '../../TimeClock';
import Widgets from '../../Widgets';
import { constants } from '../../../utils';
import styles from './index.less';

const { Header, Content } = Layout;
const { COMPONENT_TYPE } = constants;
const { EchartPie, EchartBarLine, StatisticGrid } = Widgets;

class TechBlue extends Component {

    static propTypes = {
        editor: PropTypes.bool,
        templateConfig: PropTypes.object,
        instanceDtos: PropTypes.array,
    };

    getFormConifgValue = (field, defaultValue) => {
        const { templateConfig } = this.props;
        const regionRoot = field.split("-")[0];
        let value = defaultValue;
        const formConifg = get(templateConfig, [regionRoot, 'formConifg'], []) || [];
        for (let i = 0; i < formConifg.length; i += 1) {
            if (formConifg[i].field === field) {
                value = get(templateConfig, [regionRoot, 'formConifg', i.toString(), 'value'], defaultValue) || defaultValue;
                break;
            }
        }
        return value;
    };

    setEchartPieOption = (data) => {
        const { seriesData } = data;
        const option = {
            tooltip: {
                trigger: "item",
                formatter: "{b}: {c} ({d}%)"
            },
            grid: {
                containLabel: true
            },
            series: [
                {
                    name: "",
                    type: "pie",
                    color: ["#FECE3C", "#F7717D", "#BC93EF", "#63E8F2", "#078EFF"],
                    center: ["50%", "50%"],
                    radius: ["30%", "60%"],
                    avoidLabelOverlap: true,
                    labelLine: {
                        normal: {
                            show: true,
                            lineStyle: {
                                color: "#6CBCF3",
                            }
                        },
                    },
                    label: {
                        formatter: '{b}\n{c}({d}%)'
                    },
                    data: seriesData
                }
            ]
        };
        return option;
    };

    setEchartBarLineOption = (data) => {
        const { seriesData, xAxisData } = data;
        console.log(111, seriesData, xAxisData);
        const option = {
            color: ['#3398DB'],
            tooltip: {
                trigger: "axis",
                axisPointer: {
                    type: "shadow"
                }
            },
            grid: {
                left: 10,
                top: 10,
                height: '100%',
                containLabel: true
            },
            xAxis: {
                show: false
            },
            yAxis: {
                type: "category",
                axisTick: {
                    show: false
                },
                axisLine: {
                    show: false
                },
                axisLabel: {
                    color: "#6CBCF3",
                    interval: 0
                },
                data: xAxisData.length > 0 ? xAxisData[0].data : []
            },
            series: [
                {
                    type: "bar",
                    label: {
                        show: true,
                        position: "right",
                        textStyle: {
                            color: "rgba(31, 223, 255, 0.85)"
                        }
                    },
                    barWidth: "30%",
                    data: seriesData.length > 0 ? seriesData[0].data : []
                }
            ]
        };
        return option;
    }

    getWidget = (key, component) => {
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
                        overwriteOption={this.setEchartBarLineOption}
                    />
                );
            case COMPONENT_TYPE.STATISTIC_GRID:
                return (
                    <StatisticGrid
                        key={key}
                        {...omit(props, ['title'])}
                        skin={null}
                        className='statistic-grid-box'
                    />
                )
            default:
                return null;
        }
    };

    getRenderConfigByDto = (id) => {
        const { instanceDtos } = this.props;
        const widgets = instanceDtos.filter(dto => dto.id === id);
        if (widgets.length === 1 && widgets[0].renderConfig) {
            const renderConfig = JSON.parse(widgets[0].renderConfig);
            const { component } = renderConfig;
            return component;
        }
        return null;
    };

    renderRegionWidget = (region) => {
        const { templateConfig } = this.props;
        const widgets = get(templateConfig, [region, 'widgets'], {}) || {};
        return (
            <>
                {
                    Object.keys(widgets).map((key, index) => {
                        const widget = widgets[key];
                        if (widget && widget.renderConfig) {
                            const renderConfig = JSON.parse(widget.renderConfig);
                            const { component } = renderConfig;
                            return this.getWidget(widget.id, this.getRenderConfigByDto(widget.id) || component);
                        }
                        const regionIndex = startCase(`${region}${index + 1}`);
                        return (<div className="chart" key={regionIndex}>{regionIndex}</div>)
                    })
                }
            </>
        )
    };

    render() {
        return (
            <div className={cls(styles['screen-box'])}>
                <Layout className={cls("bg")}>
                    <Header className="bg-head">
                        <div className="time-wrap">
                            <TimeClock color="#6cbcf3" />
                        </div>
                        <div className="screen-title">{this.getFormConifgValue('north-title', '大屏标题')}</div>
                    </Header>
                    <Content className="view-box">
                        <Row className="auto-height">
                            <Col span={7} className="box">
                                <div className="angle-top" />
                                <div className="angle-bottom" />
                                <div className="box-title">{this.getFormConifgValue('west-title', '左侧区域标题')}</div>
                                <div className="box-content">
                                    {this.renderRegionWidget("west")}
                                </div>
                            </Col>
                            <Col span={10} className="center-content">
                                {this.renderRegionWidget("center")}
                            </Col>
                            <Col span={7} className="box">
                                <div className="angle-top" />
                                <div className="angle-bottom" />
                                <div className="box-title">{this.getFormConifgValue('east-title', '右侧区域标题')}</div>
                                <div className="box-content">
                                    {this.renderRegionWidget("east")}
                                </div>
                            </Col>
                        </Row>
                    </Content>
                </Layout>
            </div>
        )
    }
}

export default TechBlue;