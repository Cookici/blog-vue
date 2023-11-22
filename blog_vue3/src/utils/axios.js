import axios from "axios";
import merge from "lodash/merge"
import router from "../router";
import {message} from "./resetMessage";
import qs from 'qs'


const http = axios.create({
    timeout: 1000 * 30,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json; charset=utf-8'
    }
})

// 前置拦截，为所有需要权限的请求装配上header的token信息
/**
 * 请求拦截
 */
http.interceptors.request.use(config => {
    config.headers['Authorization'] = localStorage.getItem("token")
    return config
}, error => {
    return Promise.reject(error)
})


/**
 * 响应拦截
 */
http.interceptors.response.use(response => {
    return response
}, error => {
    if (error.response.data.code === 401) { // 401, token失效 或 错误token
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        message.error("登录过期,请重新登录")
        router.push({path: '/login'})
    }
    return Promise.reject(error)
})

/**
 * 请求地址处理
 * @param {*} actionName action方法名称
 */
http.adornUrl = (actionName) => {
    // 非生产环境 && 开启代理, 接口前缀统一使用[/proxyApi/]前缀做代理拦截!
    return '/identify/' + actionName
}

/**
 * get请求参数处理
 * @param {*} params 参数对象
 * @param {*} openDefaultParams 是否开启默认参数?
 */
http.adornParams = (params = {}, openDefaultParams = true) => {
    var defaults = {
        't': new Date().getTime()
    }
    return openDefaultParams ? merge(defaults, params) : params
}

/**
 * post请求数据处理
 * @param {*} data 数据对象
 * @param {*} openDefaultData 是否开启默认数据?
 * @param {*} contentType 数据格式
 *  json: 'application/json; charset=utf-8'
 *  form: 'application/x-www-form-urlencoded; charset=utf-8'
 */
http.adornData = (data = {}, openDefaultData = true, contentType = 'json') => {
    var defaults = {
        't': new Date().getTime()
    }
    data = openDefaultData ? merge(defaults, data) : data
    return contentType === 'json' ? JSON.stringify(data) : qs.stringify(data,{charset:"utf-8",arrayFormat: "repeat"})
}




export default http
