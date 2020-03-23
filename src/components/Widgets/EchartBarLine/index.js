import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import cls from 'classnames';
import { get } from 'lodash';
import { ExtEcharts, utils, ListLoader } from 'suid';
import styles from './index.less'

const { request } = utils;

class EchartBarLine extends PureComponent {

    static propTypes = {
        title: PropTypes.string,
        store: PropTypes.shape({
            type: PropTypes.oneOf(['GET', 'get', 'POST', 'post']),
            url: PropTypes.string,
        }).isRequired,
        reader: PropTypes.shape({
            legendData: PropTypes.string,
            xAxisData: PropTypes.string.isRequired,
            yAxisData: PropTypes.string,
            seriesData: PropTypes.string.isRequired,
        }).isRequired
    };

    static defaultProps = {
        title: '',
    };

    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            legendData: [],
            xAxisData: [],
            yAxisData: [],
            seriesData: [],
        };
    }

    componentDidMount() {
        this.getData();
    }

    getData = (params) => {
        const { store, reader } = this.props;
        const { url, type } = store || {};
        const methodType = type || 'get';
        this.setState({ loading: true });
        const requestOptions = {
            method: methodType,
            url,
            headers: { neverCancel: true },
        };
        if (params) {
            if (methodType.toLocaleLowerCase() === 'get') {
                requestOptions.params = params;
            } else {
                requestOptions.data = params;
            }
        }
        if (url) {
            request(requestOptions)
                .then((res) => {
                    if (res.success) {
                        const resultData = res.data;
                        const legendData = get(resultData, reader.legendData, []);
                        const seriesData = get(resultData, reader.seriesData, []);
                        const xAxisData = get(resultData, reader.xAxisData, []);
                        const yAxisData = get(resultData, reader.yAxisData, [{ type: 'value' }]);
                        this.setState({
                            legendData,
                            seriesData,
                            xAxisData,
                            yAxisData
                        });
                    }
                })
                .finally(() => {
                    this.setState({ loading: false });
                });
        }
    };

    getOption = () => {
        const { legendData, seriesData, xAxisData, yAxisData } = this.state;
        const { title, skin } = this.props;
        const { xAxis = {}, yAxis = {} } = skin;
        xAxisData.forEach(x => {
            Object.assign(x, {
                axisLine: {
                    show: true,
                    ...xAxis.axisLine
                },
            });
        });
        yAxisData.forEach(y => {
            Object.assign(y, {
                splitLine: {
                    show: true,
                    lineStyle: {
                        type: 'solid',
                        ...yAxis.lineStyle
                    }
                },
                axisLine: {
                    show: true,
                    ...yAxis.axisLine
                }
            });
        });
        return {
            title: {
                text: title,
                x: 'center',
                ...skin.title || {}
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow'
                }
            },
            toolbox: {
                feature: {
                    magicType: { show: true, type: ['line', 'bar'] },
                    restore: { show: true },
                    saveAsImage: { show: true }
                }
            },
            legend: {
                show: true,
                bottom: 4,
                left: 'center',
                data: legendData,
                ...skin.legend || {}
            },
            xAxis: xAxisData,
            yAxis: yAxisData,
            series: seriesData,
        };
    };

    render() {
        const { loading } = this.state;
        const echartProps = {
            notMerge: false,
            option: this.getOption(),
        };
        return (
            <div className={cls(styles["echart-bar-line-box"])}>
                {
                    loading
                        ? <ListLoader />
                        : <ExtEcharts {...echartProps} />
                }
            </div>
        );
    }
}

export default EchartBarLine;