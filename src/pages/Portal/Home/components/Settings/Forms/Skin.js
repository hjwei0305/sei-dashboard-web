import React from 'react';
import cls from 'classnames';
import { get } from 'lodash';
import { Card, Tooltip } from 'antd';
import { ExtIcon } from 'suid'
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
            title: "默认",
            color: '#d8d9da',
        },
        {
            key: 'darkgrey',
            title: '暗黑',
            color: '#202024',
        },
        {
            key: 'darkblue',
            title: "科技",
            color: '#061f59',
        },
    ];
    return (
        <Card
            title="主题设置"
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