import http from '../../utils/axios'
export function policy(username) {
    return new Promise((resolve, reject) => {
        http({
            url: `/oss/oss/policy/${username}`,
            method: "post",
        }).then(({ data }) => {
            resolve(data);
        })
    });
}
