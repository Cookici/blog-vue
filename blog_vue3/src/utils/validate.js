/**
 * 邮箱
 * @param {*} s
 */
export function isEmail (s) {
    return /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+((.[a-zA-Z0-9_-]{2,3}){1,2})$/.test(s)
}

/**
 * 手机号码
 * @param {*} s
 */
export function isMobile (s) {
    return /^1[0-9]{10}$/.test(s)
}


/**
 * 昵称
 * @param {*} s
 */
export function isLegalNickname (s) {

    // 长度限制，4-16 个字符
    return !(s.length < 4 || s.length > 8);

}


/**
 * 验证密码和确认密码是否相同
 */
export function isSame (password,surePassword) {
    return  password === surePassword
}


/**
 * 密码
 * @param {*} s
 */
export function isPassword(s) {
   return new RegExp('(?=.*[0-9])(?=.*[a-zA-Z]).{8,15}').test(s)
}