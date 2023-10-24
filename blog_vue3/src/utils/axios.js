import axios from "axios";
import merge from "lodash/merge"
import router from "../router";


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
    if (response.data.code === 401) { // 401, token失效 或 错误token
        localStorage.removeItem('token');
        if(response.data.config.url==='/identify/blog/identify/register'){
            localStorage.removeItem('token')
            alert("发现异常操作,请重新注册")
            return response;
        }
        router.push({path: '/login'})
    }
    return response
}, error => {
    if (error.response.data.code === 401) { // 401, token失效 或 错误token
        localStorage.removeItem('token')
        if(error.config.url==='/identify/blog/identify/register'){
            localStorage.removeItem('token')
            alert("发现异常操作,请重新注册")
            return Promise.reject(error);
        }
        router.push({path: '/login'})
    }
    return Promise.reject(error)
})


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
    return contentType === 'json' ? JSON.stringify(data) : qs.stringify(data)
}

export default http
