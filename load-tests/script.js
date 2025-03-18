import { check, group, sleep } from "k6";
import http from "k6/http";
import { Counter, Rate, Trend } from "k6/metrics";

const errorRate = new Rate("errors");
const successfulRequests = new Counter("successful_requests");
const requestTime = new Trend("request_time");
const apiLatency = new Trend("api_latency");
const dataProcessingTime = new Trend("data_processing_time");

export const options = {
  stages: [
    { duration: "30s", target: 5 },   
    { duration: "2m", target: 10 },  
    { duration: "5m", target: 30 },  
    { duration: "2m", target: 10 },   
    { duration: "30s", target: 0 },   
  ],
  thresholds: {
    http_req_duration: ["p(95)<2000", "p(99)<3000"],
    errors: ["rate<0.05"],
    successful_requests: ["count>100"],
    api_latency: ["p(95)<1500"],
    data_processing_time: ["avg<1000"],
  },
  noConnectionReuse: true,
  userAgent: "k6-load-test/1.0",
};

function performRequestChecks(res, checkName) {
  const checks = {
    "status is 2xx": (r) => r.status >= 200 && r.status < 300,
    "response time OK": (r) => r.timings.duration < 2000,
    "content-type present": (r) => r.headers["content-type"] != null,
  };

  const isSuccess = check(res, checks);
  if (!isSuccess) {
    console.error(
      `${checkName} failed - Status: ${res.status}, Duration: ${res.timings.duration}ms, Body: ${res.body}`
    );
    errorRate.add(1);
  } else {
    successfulRequests.add(1);
  }
  apiLatency.add(res.timings.duration);
  return isSuccess;
}

export default function runLoadTest() {
  const BASE_URL = __ENV.NEXT_PUBLIC_BASE_URL || "https://breaktheice.in/api";

  group("API Health Check", function () {
    const startTime = new Date();
    const res = http.get(`${BASE_URL}/health`);
    const endTime = new Date();
    
    performRequestChecks(res, "Health Check");
    dataProcessingTime.add(endTime - startTime);
    
    check(res, {
      "health check response format": (r) => {
        try {
          const body = JSON.parse(r.body);
          return body.status === "healthy" && body.supabase?.status === "up";
        } catch (e) {
          console.error("Health check response parsing failed:", e);
          return false;
        }
      },
    });
    
    sleep(1);
  });

  group("API Endpoints Test", function () {
    const authRes = http.post(`${BASE_URL}/auth`, {
      email: "test@example.com",
      password: "testpassword",
    });
    performRequestChecks(authRes, "Auth Test");

    const leadsRes = http.get(`${BASE_URL}/leads`);
    performRequestChecks(leadsRes, "Leads Test");

    const workspaceRes = http.get(`${BASE_URL}/workspace`);
    performRequestChecks(workspaceRes, "Workspace Test");

    sleep(2);
  });
}
