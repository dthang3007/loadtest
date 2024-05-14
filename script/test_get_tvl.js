import {check, sleep} from "k6";
import http from "k6/http";
import {Rate} from "k6/metrics";

export let errorRate = new Rate("errors");
export let successRate = new Rate("successes");

export const options = {
    stages: [
        {duration: '1m', target: 1000},
        {duration: '1m', target: 1000},
        {duration: '1m', target: 0},
    ],
    thresholds: {
        http_req_duration: ['p(95)<=500','p(99)<=500'], // 95% of requests must complete below 500ms
    },
    summaryTrendStats: ['avg', 'min', 'med', 'max', 'p(90)', 'p(95)', 'p(99)'],
};

export default function () {
    const url = 'https://be.stg.henez.fi/v1/tvl'
    const res = http.get(url);

    if (res.status === 200) {
        successRate.add(1);
    } else {
        errorRate.add(1);
        console.error(res.status + " && " + res.body);
    }

    check(res, {
        "status is 200": (r) => {
            console.log(`URL: ${url}. Status: ${r.status}`)
            return r.status === 200
        }
    });
    sleep(1)
}