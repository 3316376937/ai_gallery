"use client";

import React, { useState, useEffect, useRef } from "react";
import ReactECharts from "echarts-for-react";
import { Play, Pause, RefreshCw } from "lucide-react";
import { useI18n } from "@/app/i18n/client";

const TokenBucketVisualization = () => {
  const [bucketCapacity, setBucketCapacity] = useState(10);
  const [tokenRate, setTokenRate] = useState(30);
  const [requestRate, setRequestRate] = useState(15);
  const [isRunning, setIsRunning] = useState(false);
  const [data, setData] = useState([]);
  const [_, setCurrentTokens] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef(null);
  const tokenFractionRef = useRef(0);
  const { t } = useI18n();

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsedTime((prevTime) => prevTime + 1);
        setCurrentTokens((prevTokens) => {
          tokenFractionRef.current += tokenRate;
          const newTokensToAdd = Math.floor(tokenFractionRef.current);
          tokenFractionRef.current -= newTokensToAdd;

          const tokensAfterGeneration = Math.min(
            prevTokens + newTokensToAdd,
            bucketCapacity
          );
          const successfulRequests = Math.min(
            requestRate,
            tokensAfterGeneration
          );
          const failedRequests = Math.max(0, requestRate - successfulRequests);
          const remainingTokens = Math.max(
            0,
            tokensAfterGeneration - successfulRequests
          );

          setData((prevData) => [
            ...prevData,
            [
              elapsedTime,
              requestRate,
              successfulRequests,
              failedRequests,
              remainingTokens,
            ],
          ]);
          //   console.log("Data: ", data);
          return remainingTokens;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isRunning, bucketCapacity, tokenRate, requestRate, elapsedTime]);

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setData([]);
    setCurrentTokens(0);
    setElapsedTime(0);
    tokenFractionRef.current = 0;
  };

  const option = {
    title: {
      text: t("token_bucket_chart"),
      left: "center",
    },
    tooltip: {
      trigger: "axis",
      formatter: function (params) {
        let result = `${t("time")}: ${params[0].value[0]}s<br/>`;
        params.forEach((param) => {
          result += `${param.seriesName}: ${param.value[1]}<br/>`;
        });
        return result;
      },
    },

    legend: {
      data: [
        t("total_request"),
        t("success_request"),
        t("fail_request"),
        t("remain_tokens"),
      ],
      bottom: 0,
    },
    xAxis: {
      type: "value",
      name: `${t("time")} (s)`,
      nameLocation: "middle",
      nameGap: 30,
    },
    yAxis: {
      type: "value",
      name: t("count"),
      nameLocation: "middle",
      nameGap: 40,
    },
    series: [
      {
        name: t("total_request"),
        type: "line",
        smooth: true,
        data: data.map((item) => [item[0], item[1]]),
      },
      {
        name: t("success_request"),
        type: "line",
        smooth: true,
        data: data.map((item) => [item[0], item[2]]),
      },
      {
        name: t("fail_request"),
        type: "line",
        smooth: true,
        data: data.map((item) => [item[0], item[3]]),
      },
      {
        name: t("remain_tokens"),
        type: "line",
        smooth: true,
        data: data.map((item) => [item[0], item[4]]),
      },
    ],
  };

  return (
    <div className="w-full m-4 mx-auto p-4 border rounded-lg shadow-lg">
      <div className="mb-4 flex space-x-4">
        <div>
          <label className="block">{t("bucket_capacity")}</label>
          <input
            type="number"
            value={bucketCapacity}
            onChange={(e) => setBucketCapacity(Number(e.target.value))}
            className="border rounded p-1"
          />
        </div>
        <div>
          <label className="block">{t("token_rate")}</label>
          <input
            type="number"
            value={tokenRate}
            onChange={(e) => setTokenRate(Number(e.target.value))}
            className="border rounded p-1"
          />
        </div>
        <div>
          <label className="block">{t("request_rate")}</label>
          <input
            type="number"
            value={requestRate}
            onChange={(e) => setRequestRate(Number(e.target.value))}
            className="border rounded p-1"
          />
        </div>
      </div>
      <div className="mb-4 flex space-x-4">
        <button
          onClick={isRunning ? handlePause : handleStart}
          className="bg-blue-500 text-white px-4 py-2 rounded flex items-center"
        >
          {isRunning ? <Pause className="mr-2" /> : <Play className="mr-2" />}
          {isRunning ? t("pause") : t("start")}
        </button>
        <button
          onClick={handleReset}
          className="bg-gray-500 text-white px-4 py-2 rounded flex items-center"
        >
          <RefreshCw className="mr-2" />
          {t("reset")}
        </button>
      </div>
      <br />
      <br />
      <ReactECharts option={option} style={{ height: "400px" }} />
    </div>
  );
};

export default TokenBucketVisualization;
