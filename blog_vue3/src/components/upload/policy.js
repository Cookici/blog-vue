import http from '../../utils/axios'
export function policy(username) {
    return new Promise((resolve, reject) => {
        http({
            url: `/oss/policy?username=${username}`,
            method: "post",
            params: http.adornParams({})
        }).then(({ data }) => {
            resolve(data);
        })
    });
}
