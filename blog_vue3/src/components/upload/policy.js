import http from '../../utils/axios'
export function policy(username) {
    return new Promise((resolve, reject) => {
        http({
            url: http.adornUrl(`blog/oss/policy/${username}`),
            method: "post",
        }).then(({ data }) => {
            resolve(data);
        })
    });
}
