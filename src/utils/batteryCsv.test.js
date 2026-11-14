import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  calculateBatteryMetrics,
  parseBatteryCsv,
} from "./batteryCsv.js";

const requiredHeader = [
  "Battery Temperature (C)",
  "Pack Current (A)",
  "Cell Voltage Delta (mV)",
  "Cycle Index",
  "State of Charge (%)",
];

function csvRow({
  temperature = 30,
  current = 10,
  delta = 20,
  cycle = 12,
  soc = 70,
} = {}) {
  return [temperature, current, delta, cycle, soc].join(",");
}

function csvWithRows(rows, headers = requiredHeader) {
  return `${headers.join(",")}\n${rows.join("\n")}`;
}

describe("battery CSV validation", () => {
  it("accepts the supplied synthetic sample dataset", () => {
    const text = readFileSync(
      new URL("../../test_battery_data.csv", import.meta.url),
      "utf8",
    );
    const result = parseBatteryCsv(text);

    assert.equal(result.canAnalyze, true);
    assert.equal(result.records.length, 12);
    assert.equal(result.isSynthetic, true);
    assert.ok(result.headers.includes("Timestamp"));
  });

  it("accepts a valid custom CSV without optional columns", () => {
    const result = parseBatteryCsv(csvWithRows([csvRow()]));

    assert.equal(result.canAnalyze, true);
    assert.equal(result.records.length, 1);
    assert.deepEqual(result.errors, []);
  });

  it("rejects a header-only file", () => {
    const result = parseBatteryCsv(requiredHeader.join(","));

    assert.equal(result.canAnalyze, false);
    assert.ok(result.errors.some((error) => error.includes("no data records")));
  });

  it("rejects missing required columns", () => {
    const result = parseBatteryCsv(
      csvWithRows(["30,10,20,12"], requiredHeader.slice(0, 4)),
    );

    assert.equal(result.canAnalyze, false);
    assert.ok(result.errors.some((error) => error.includes("State of Charge (%)")));
  });

  it("reports invalid numeric values with row and column", () => {
    const result = parseBatteryCsv(csvWithRows([csvRow({ temperature: "warm" })]));

    assert.equal(result.canAnalyze, false);
    assert.ok(result.errors.some((error) =>
      error.includes("Row 2") && error.includes("Battery Temperature (C)"),
    ));
  });

  it("reports missing required measurement values", () => {
    const result = parseBatteryCsv(csvWithRows(["30,10,,12,70"]));

    assert.equal(result.canAnalyze, false);
    assert.ok(result.errors.some((error) =>
      error.includes("Cell Voltage Delta (mV)") && error.includes("numeric value is required"),
    ));
  });

  it("rejects SOC values outside the 0–100 percent range", () => {
    const result = parseBatteryCsv(csvWithRows([csvRow({ soc: 101 })]));

    assert.equal(result.canAnalyze, false);
    assert.ok(result.errors.some((error) => error.includes("State of Charge (%)")));
  });

  it("rejects malformed rows with inconsistent column counts", () => {
    const result = parseBatteryCsv(csvWithRows([`${csvRow()},extra`]));

    assert.equal(result.canAnalyze, false);
    assert.ok(result.errors.some((error) => error.includes("inconsistent number of columns")));
  });

  it("rejects duplicate column names", () => {
    const headers = [
      ...requiredHeader,
      "Battery Temperature (C)",
    ];
    const result = parseBatteryCsv(csvWithRows(["30,10,20,12,70,30"], headers));

    assert.equal(result.canAnalyze, false);
    assert.ok(result.errors.some((error) => error.includes("Duplicate column names")));
  });

  it("rejects empty files", () => {
    const result = parseBatteryCsv("");

    assert.equal(result.canAnalyze, false);
    assert.ok(result.errors.some((error) => error.includes("empty")));
  });

  it("rejects unsupported measurement units in column names", () => {
    const headers = [
      "Battery Temperature (F)",
      ...requiredHeader.slice(1),
    ];
    const result = parseBatteryCsv(csvWithRows([csvRow()], headers));

    assert.equal(result.canAnalyze, false);
    assert.ok(result.errors.some((error) => error.includes("unsupported unit")));
  });

  it("rejects negative cell-voltage delta measurements", () => {
    const result = parseBatteryCsv(csvWithRows([csvRow({ delta: -1 })]));

    assert.equal(result.canAnalyze, false);
    assert.ok(result.errors.some((error) => error.includes("Cell Voltage Delta (mV)")));
  });

  it("rejects duplicate timestamps and warns about out-of-order timestamps", () => {
    const headers = ["Timestamp", ...requiredHeader];
    const duplicate = parseBatteryCsv(csvWithRows([
      `2025-01-01T00:00:00Z,${csvRow()}`,
      `2025-01-01T00:00:00Z,${csvRow()}`,
    ], headers));
    const outOfOrder = parseBatteryCsv(csvWithRows([
      `2025-01-01T00:10:00Z,${csvRow({ temperature: 35, soc: 60 })}`,
      `2025-01-01T00:00:00Z,${csvRow({ temperature: 25, soc: 80 })}`,
    ], headers));

    assert.equal(duplicate.canAnalyze, false);
    assert.ok(duplicate.errors.some((error) => error.includes("duplicates")));
    assert.equal(outOfOrder.canAnalyze, true);
    assert.ok(outOfOrder.warnings.some((warning) => warning.includes("out of order")));
    assert.equal(calculateBatteryMetrics(outOfOrder.records).latestSOC, 60);
  });

  it("does not combine records with different battery IDs", () => {
    const headers = [...requiredHeader, "Battery ID"];
    const result = parseBatteryCsv(csvWithRows([
      `${csvRow()},battery-a`,
      `${csvRow()},battery-b`,
    ], headers));

    assert.equal(result.canAnalyze, false);
    assert.ok(result.errors.some((error) => error.includes("one battery per analysis")));
  });

  it("calculates SOH from the latest matching measured and rated capacity values", () => {
    const headers = [
      ...requiredHeader,
      "Measured Capacity (kWh)",
      "Rated Capacity (kWh)",
    ];
    const result = parseBatteryCsv(csvWithRows([
      `${csvRow()},72,90`,
      `${csvRow({ cycle: 13 })},68,85`,
    ], headers));
    const metrics = calculateBatteryMetrics(result.records);

    assert.equal(result.canAnalyze, true);
    assert.equal(metrics.currentSOH, 80);
    assert.equal(metrics.sohMethod, "measured-capacity/rated-capacity");
    assert.equal(metrics.measuredCapacity, 68);
    assert.equal(metrics.referenceCapacity, 85);
    assert.equal(metrics.capacityUnit, "kWh");
  });

  it("supports current and design capacity aliases with matching Ah units", () => {
    const headers = [
      ...requiredHeader,
      "Current Capacity (Ah)",
      "Design Capacity (Ah)",
    ];
    const result = parseBatteryCsv(csvWithRows([
      `${csvRow()},72,90`,
    ], headers));
    const metrics = calculateBatteryMetrics(result.records);

    assert.equal(result.canAnalyze, true);
    assert.equal(metrics.currentSOH, 80);
    assert.equal(metrics.capacityUnit, "Ah");
  });

  it("parses the uploaded snake_case Ah columns as numeric capacities and calculates SOH", () => {
    const headers = [
      ...requiredHeader,
      "rated_capacity_ah",
      "measured_capacity_ah",
      "state_of_health_pct",
    ];
    const result = parseBatteryCsv(csvWithRows([
      `${csvRow()},90,72,80`,
    ], headers));
    const metrics = calculateBatteryMetrics(result.records);

    assert.equal(result.canAnalyze, true);
    assert.equal(result.records[0].measuredCapacity, 72);
    assert.equal(result.records[0].referenceCapacity, 90);
    assert.equal(result.records[0].reportedSOH, 80);
    assert.equal(metrics.currentSOH, 80);
    assert.equal(metrics.capacityUnit, "Ah");
  });

  it("uses the capacity ratio rather than a conflicting reported SOH column", () => {
    const headers = [
      ...requiredHeader,
      "rated_capacity_ah",
      "measured_capacity_ah",
      "state_of_health_pct",
    ];
    const result = parseBatteryCsv(csvWithRows([
      `${csvRow()},90,72,65`,
    ], headers));

    assert.equal(calculateBatteryMetrics(result.records).currentSOH, 80);
  });

  it("rejects mismatched capacity units", () => {
    const headers = [
      ...requiredHeader,
      "Measured Capacity (Ah)",
      "Rated Capacity (kWh)",
    ];
    const result = parseBatteryCsv(csvWithRows([
      `${csvRow()},72,90`,
    ], headers));

    assert.equal(result.canAnalyze, false);
    assert.ok(result.errors.some((error) => error.includes("same units")));
  });

  it("rejects zero capacity and measured capacity greater than rated capacity", () => {
    const headers = [
      ...requiredHeader,
      "Measured Capacity (kWh)",
      "Rated Capacity (kWh)",
    ];
    const zero = parseBatteryCsv(csvWithRows([
      `${csvRow()},0,90`,
    ], headers));
    const aboveRated = parseBatteryCsv(csvWithRows([
      `${csvRow()},91,90`,
    ], headers));

    assert.equal(zero.canAnalyze, false);
    assert.equal(aboveRated.canAnalyze, false);
    assert.ok(zero.errors.some((error) => error.includes("greater than zero")));
    assert.ok(aboveRated.errors.some((error) => error.includes("must not exceed")));
  });

  it("rejects cycle-index decreases in chronological data", () => {
    const headers = ["Timestamp", ...requiredHeader];
    const result = parseBatteryCsv(csvWithRows([
      `2025-01-01T00:00:00Z,${csvRow({ cycle: 9 })}`,
      `2025-01-01T00:01:00Z,${csvRow({ cycle: 8 })}`,
    ], headers));

    assert.equal(result.canAnalyze, false);
    assert.ok(result.errors.some((error) => error.includes("must not decrease")));
  });
});

describe("battery metric calculations", () => {
  it("calculates metrics from each selected dataset rather than fixed values", () => {
    const first = parseBatteryCsv(csvWithRows([
      csvRow({ temperature: 20, current: 5, delta: 12, cycle: 3, soc: 90 }),
      csvRow({ temperature: 30, current: -15, delta: 22, cycle: 4, soc: 80 }),
    ]));
    const second = parseBatteryCsv(csvWithRows([
      csvRow({ temperature: 40, current: 25, delta: 32, cycle: 70, soc: 60 }),
    ]));

    const firstMetrics = calculateBatteryMetrics(first.records);
    const secondMetrics = calculateBatteryMetrics(second.records);

    assert.equal(firstMetrics.latestTemperature, 30);
    assert.equal(firstMetrics.maximumTemperature, 30);
    assert.equal(firstMetrics.maximumCurrent, 15);
    assert.equal(firstMetrics.cycleTrend, 1);
    assert.equal(secondMetrics.latestTemperature, 40);
    assert.equal(secondMetrics.maximumCellVoltageDelta, 32);
    assert.equal(secondMetrics.currentSOC, 60);
  });

  it("reports unsupported optional voltage and missing capacity-based SOH as unavailable", () => {
    const result = parseBatteryCsv(csvWithRows([csvRow()]));
    const metrics = calculateBatteryMetrics(result.records);

    assert.equal(metrics.latestVoltage, null);
    assert.equal(metrics.currentSOH, null);
    assert.equal(metrics.sohMethod, null);
    assert.equal(calculateBatteryMetrics([]), null);
  });
});
