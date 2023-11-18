export {
    socket
}


import {ElMessage} from "element-plus";


// socket主要对象
let socket = {
    ws: null,
    /**
     * 这个是我们的ws的地址
     * */
    url: "ws://localhost:10001",
    /**
     * 开启标识
     * */
    socket_open: false,
    /**
     * 心跳timer
     * */
    heartbeat_timer: null,
    /**
     * 心跳发送频率
     * */
    heartbeat_interval: 1000 * 25 * 60,
    /**
     * 是否开启重连
     * */
    is_reconnect: true,
    /**
     * 重新连接的次数
     * */
    reconnect_count: 3,
    /**
     * 当前重新连接的次数，默认为：1
     * */
    reconnect_current: 1,
    /**
     * 重新连接的时间类型
     * */
    reconnect_timer: null,
    /**
     * 重新连接的间隔
     * */
    reconnect_interval: 3000,

    /**
     * 初始化连接
     */
    init: () => {
        if (!("WebSocket" in window)) {
            ElMessage({
                message: '当前浏览器与网站不兼容',
                type: 'error',
            });
            return null
        }

        // 已经创建过连接不再重复创建
        if (socket.ws) {
            return socket.ws
        }

        socket.ws = new WebSocket(socket.url)

        socket.ws.onclose = function () {
            clearInterval(socket.heartbeat_timer)
            socket.socket_open = false

            if (socket.is_reconnect) {
                socket.reconnect_timer = setTimeout(() => {
                    if (socket.reconnect_current > socket.reconnect_count) {
                        clearTimeout(socket.reconnect_timer)
                        return
                    }
                    socket.reconnect()
                }, socket.reconnect_interval)
            }
        }


        socket.ws.onopen = function () {
            console.log('连接成功')
            socket.socket_open = true
            socket.is_reconnect = true
            socket.heartbeat()
        }


        socket.ws.onerror = function (err) {
            ElMessage({
                message: '服务连接发生错误',
                type: 'error',
            });
        }
    },
    /**
     * 获取websocket对象
     * */

    getSocket: () => {
        if (socket.ws) {
            return socket.ws
        } else {
            socket.init();
        }
    },

    getStatus: () => {
        if (socket.ws.readyState === 0) {
            return "未连接";
        } else if (socket.ws.readyState === 1) {
            return "已连接";
        } else if (socket.ws.readyState === 2) {
            return "连接正在关闭";
        } else if (socket.ws.readyState === 3) {
            return "连接已关闭";
        }
    },

    /**
     * 发送消息
     * @param {*} data 发送数据
     * @param {*} callback 发送后的自定义回调函数
     */
    send: (data, callback = null) => {
        // 开启状态直接发送
        if (socket.ws.readyState === socket.ws.OPEN) {
            try {
                socket.ws.send(JSON.stringify(data))
            } catch (e) {
                socket.ws.send(data);
            }
            if (callback) {
                callback()
            }
            // 正在开启状态，则等待1s后重新调用
        } else if (socket.ws.readyState === socket.ws.CONNECTING) {
            setTimeout(function () {
                socket.send(data, callback)
            }, 1000)
        } else {
            socket.init()
            setTimeout(function () {
                socket.send(data, callback)
            }, 1000)
        }
    },


    /**
     * 心跳
     */
    heartbeat: () => {

        if (socket.heartbeat_timer) {
            clearInterval(socket.heartbeat_timer)
        }

        socket.heartbeat_timer = setInterval(() => {
            let data = {
                type: 6,
                params: {
                    userId: JSON.parse(localStorage.getItem('user')).user.userId,
                    message: "ping",
                }
            }
            socket.send(data)
        }, socket.heartbeat_interval)
    },

    /**
     * 主动关闭连接
     */
    close: () => {
        console.log('主动断开连接')
        clearInterval(socket.heartbeat_timer)
        socket.is_reonnect = false
        socket.ws.close()
    },

    /**
     * 重新连接
     */
    reconnect: () => {
        socket.reconnect_current++
        console.log('发起重新连接', socket.reconnect_current)

        if (socket.ws && socket.socket_open) {
            socket.ws.close()
        }
        window.location.reload()
        socket.init()
    },


    /**
     * 注册
     * @param status
     */
    register: (status) => {
        let data = {
            type: 1,
            params: {
                userId: JSON.parse(localStorage.getItem('user')).user.userId,
                userName: JSON.parse(localStorage.getItem('user')).user.userName,
                loginStatus: status
            }
        }
        socket.send(data)
        console.log("发出注册请求")
    }

}












