import React from 'react';
import cls from 'classnames';
import { get } from 'lodash';
import { Card, Tooltip } from 'antd';
import { ExtIcon } from 'suid'
import { formatMessage } from 'umi-plugin-react/locale';
import styles from './Skin.less'

const Tag = ({ color, check, ...rest }) => (
    <div
        {...rest}
        style={{
            backgroundColor: color,
        }}
    >
        {check ? <ExtIcon type="check" antd /> : ''}
    </div>
);



const Skin = ({ theme, onChange }) => {
    const colorList = [
        {
            key: 'light',
            title: formatMessage({id: 'dashboard_000035', defaultMessage: '默认'}),
            color: '#d8d9da',
        },
        {
            key: 'darkgrey',
            title: formatMessage({id: 'dashboard_000036', defaultMessage: '暗黑'}),
            color: '#202024',
        },
        {
            key: 'darkblue',
            title: formatMessage({id: 'dashboard_000037', defaultMessage: '科技'}),
            color: '#061f59',
        },
    ];
    return (
        <Card
            title={formatMessage({id: 'dashboard_000038', defaultMessage: '主题设置'})}
            bordered={false}
            className={cls(styles['skin-box'])}
        >
            {
                colorList.map(({ key, color, title }) => (
                    <Tooltip key={color} title={title}>
                        <Tag
                            className="colorBlock"
                            color={color}
                            check={get(theme, 'primarySkin', 'light') === key}
                            onClick={() => onChange && onChange({ key, color })}
                        />
                    </Tooltip>
                ))
            }
        </Card>
    )
}
export default Skin;
