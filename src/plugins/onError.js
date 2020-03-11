import { notification } from "antd";
import { formatMessage } from "umi-plugin-react/locale";

export default {
  onError(err, action, ...rest) {
    console.log(err, action, ...rest);
    err.preventDefault();
    if (err.statusCode === 401) {
      window.g_app._store.dispatch({
        type: "global/redirectLogin",
        payload: {
          status: 401
        }
      });
      notification.error({
        message: formatMessage({ id: "app.request.401", defaultMessage: "会话异常" }),
        description: formatMessage({ id: "app.request.401.message", defaultMessage: "当前会话超时或失效，请重新登录" })
      });
    } else {
      const [{ effectArgs }] = rest;
      if (effectArgs.length > 0) {
        let { callback } = effectArgs[0];
        if (callback && callback instanceof Function) {
          callback({ success: false });
        }
      }
      notification.error({
        message: formatMessage({ id: "app.request.error", defaultMessage: "请求错误" }),
        description: err.message
      });
    }
  }
};
