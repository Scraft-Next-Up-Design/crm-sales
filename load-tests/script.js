import { check, group, sleep } from "k6";
import http from "k6/http";
import { Counter, Rate, Trend } from "k6/metrics";

const errorRate = new Rate("errors");
const successfulRequests = new Counter("successful_requests");
const requestTime = new Trend("request_time");

export const options = {
  stages: [
    { duration: "1m", target: 10 },
    { duration: "3m", target: 50 },
    { duration: "5m", target: 50 },
    { duration: "1m", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<500"],
    errors: ["rate<0.05"],
    successful_requests: ["count>50"],
  },
};

export default function () {
  const BASE_URL = __ENV.NEXT_PUBLIC_BASE_URL || "https://breaktheice.in/api";

  group("API Health Check", function () {
    const res = http.get(`${BASE_URL}/health`);
    check(res, { "Status is 200": (r) => r.status === 200 }) ||
      errorRate.add(1);
    successfulRequests.add(1);
    requestTime.add(res.timings.duration);
    sleep(1);
  });
}
