import {ElMessage} from "element-plus";

let messageDom = null
const resetMessage = (options) => {
    if (messageDom) messageDom.close()
    messageDom = ElMessage(options)
}
const typeArr = ['success', 'error', 'warning', 'info']
typeArr.forEach(type => {
    resetMessage[type] = options => {
        if (typeof options === 'string') options = { message: options }
        options.type = type
        return resetMessage(options)
    }
})
export const message = resetMessage
