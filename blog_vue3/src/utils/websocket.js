import {ElMessage} from "element-plus";
import {userStore} from "../stores/user";

const UserStore = userStore()
export default class SocketService {

    static instance = null;

    static get Instance() {
        if (!this.instance) {
            this.instance = new SocketService()
        }
        return this.instance
    }


    ws = null;

    /**
     * 开启标识
     * */
    connected = false;

    /**
     * 心跳timer
     * */
    heartbeat_timer = null;

    /**
     * 心跳发送频率
     * */
    heartbeat_interval = 5000;

    /**
     * 是否开启重连
     * */
    is_reconnect = true;

    /**
     * 重新连接的次数
     * */
    reconnect_count = 20;

    /**
     * 当前重新连接的次数，默认为：0
     * */
    reconnect_current = 0;

    /**
     * 重新连接的时间类型
     * */
    reconnect_timer = null;

    /**
     * 重新连接的间隔
     * */
    reconnect_interval = 1000;

    connect() {
        if (!window.WebSocket) {
            ElMessage.error('你的浏览器不支持WebSocket');
            return null
        }

        if (this.ws !== null) {
            return this.ws
        }


        let url = 'ws://localhost:10001';
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
            ElMessage.success("欢迎回来");
            this.reconnect_current = 0
            this.connected = true
            this.is_reconnect = true
            this.heartbeat()
        }


        this.ws.onclose = () => {
            ElMessage.error('连接已断开');
            clearInterval(this.heartbeat_interval)
            this.connected = false;
            if (this.is_reconnect === true) {
                this.reconnect_timer = setTimeout(() => {
                    if (this.reconnect_current > this.reconnect_count) {
                        clearTimeout(this.reconnect_timer)
                        return
                    }
                    this.reconnect_current++
                    this.reconnect()
                }, this.reconnect_interval)
            }
        }

    }

    /**
     * 获取websocket对象
     * */
    getSocket() {
        if (this.ws) {
            return this.ws
        } else {
            this.connect()
        }
    }

    getStatus() {
        if (this.ws.readyState === 0) {
            return "未连接";
        } else if (this.ws.readyState === 1) {
            return "已连接";
        } else if (this.ws.readyState === 2) {
            return "连接正在关闭";
        } else if (this.ws.readyState === 3) {
            return "连接已关闭";
        }
    }


    register(status){
        let data = {
            type: 1,
            params: {
                userId: UserStore.user?.userId,
                userName: UserStore.user?.userName,
                loginStatus: status
            }
        }
        console.log(data)
        this.send(data)
        console.log("发送注册数据")
    }


    // 发送数据的方法
    send(data, callback = null) {
        // 判断此时此刻有没有连接成功
        if (this.connected) {
            this.reconnect_current = 0;
            try {
                this.ws.send(JSON.stringify(data));
            } catch (e) {
                this.ws.send(data);
            }
            if (callback) {
                callback()
            }
        } else {
            this.connect()
            setTimeout(() => {
                this.send(data);
            }, 1000);
        }
    }

    heartbeat() {
        if (this.heartbeat_timer) {
            clearInterval(this.heartbeat_timer)
        }

        this.heartbeat_timer = setInterval(() => {
            let data = {
                type: 6,
                params: {
                    userId: UserStore.user?.userId,
                    message: "ping",
                }
            }
            this.send(data)
        }, this.heartbeat_interval)
    }

    /**
     * 主动关闭
     */
    close() {
        clearInterval(this.heartbeat_interval)
        this.is_reconnect = false
        this.ws.close()
    }

    /**
     * 重新连接
     */
    reconnect() {
        console.log('发起重新连接', this.reconnect_current)
        if (this.ws && this.connect()) {
            this.ws.close()
        }
        this.connect()
    }


}