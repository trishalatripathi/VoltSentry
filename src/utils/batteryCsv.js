import Papa from "papaparse";

export const BATTERY_DATA_UPLOAD_ATTEMPTED_KEY = "batteryDataUploadAttempted";

export const REQUIRED_BATTERY_COLUMNS = [
  "Battery Temperature (C)",
  "Pack Current (A)",
  "Cell Voltage Delta (mV)",
  "Cycle Index",
  "State of Charge (%)",
];

const OPTIONAL_COLUMNS = [
  "Pack Voltage (V)",
  "Timestamp",
  "Battery ID",
  "Data Provenance",
];

function rowLabel(index) {
  return index + 2;
}

function parseNumericValue(value) {
  if (value === undefined || value.trim() === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatFieldError(row, column, message) {
  return `Row ${rowLabel(row)} — ${column}: ${message}.`;
}

function checkValueRange(value, minimum, maximum) {
  return value >= minimum && value <= maximum;
}

function findCapacityColumn(headers, role) {
  const expression = role === "measured"
    ? /^(?:Measured|Current) Capacity \((Ah|Wh|kWh)\)$|^(?:measured|current)_capacity_(ah|wh|kwh)$/i
    : /^(?:Rated|Design) Capacity \((Ah|Wh|kWh)\)$|^(?:rated|design)_capacity_(ah|wh|kwh)$/i;
  const header = headers.find((column) => expression.test(column));
  if (!header) {
    return null;
  }
  const match = header.match(expression);
  const parsedUnit = (match[1] || match[2]).toUpperCase();
  return {
    header,
    unit: parsedUnit === "KWH"
      ? "kWh"
      : parsedUnit === "WH"
        ? "Wh"
        : "Ah",
  };
}

export function parseBatteryCsv(text) {
  const errors = [];
  const warnings = [];

  if (typeof text !== "string" || text.trim() === "") {
    return {
      headers: [],
      previewHeaders: [],
      previewRows: [],
      records: [],
      errors: ["The CSV file is empty."],
      warnings,
      canAnalyze: false,
      isSynthetic: false,
    };
  }

  const parsed = Papa.parse(text, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (header) => header.trim(),
  });
  const headers = parsed.meta.fields || [];
  const duplicateHeaders = Object.values(parsed.meta.renamedHeaders || {});
  if (duplicateHeaders.length > 0) {
    errors.push(`Duplicate column names are not allowed: ${[
      ...new Set(duplicateHeaders),
    ].join(", ")}.`);
  }
  const missingColumns = REQUIRED_BATTERY_COLUMNS.filter(
    (column) => !headers.includes(column),
  );
  const measuredCapacity = findCapacityColumn(headers, "measured");
  const referenceCapacity = findCapacityColumn(headers, "reference");
  const measuredCapacityColumn = measuredCapacity?.header;
  const referenceCapacityColumn = referenceCapacity?.header;
  const measuredCapacityUnit = measuredCapacity?.unit;
  const referenceCapacityUnit = referenceCapacity?.unit;
  const stateOfHealthColumn = headers.find((header) =>
    /^(?:State of Health \(%\)|state_of_health_pct)$/i.test(header),
  );
  const hasCapacityHeaders = Boolean(
    measuredCapacityColumn || referenceCapacityColumn,
  );
  const hasCapacityPair = Boolean(
    measuredCapacityColumn &&
    referenceCapacityColumn &&
    measuredCapacityUnit === referenceCapacityUnit,
  );
  const unsupportedCapacityUnits = headers.filter((header) => {
    const match = header.match(
      /^(Measured|Current|Rated|Design) Capacity \(([^)]+)\)$/i,
    );
    return match && !["AH", "WH", "KWH"].includes(match[2].toUpperCase());
  });
  if (unsupportedCapacityUnits.length > 0) {
    errors.push(
      `Unsupported capacity units in ${unsupportedCapacityUnits.join(", ")}; use matching Ah, Wh, or kWh units.`,
    );
  }

  if (
    measuredCapacityColumn &&
    referenceCapacityColumn &&
    measuredCapacityUnit !== referenceCapacityUnit
  ) {
    errors.push(
      `Capacity columns must use the same units; found ${measuredCapacityUnit} and ${referenceCapacityUnit}.`,
    );
  } else if (hasCapacityHeaders && !hasCapacityPair) {
    warnings.push(
      "SOH is unavailable: include both Measured or Current Capacity and Rated or Design Capacity columns in the same unit (Ah, Wh, or kWh).",
    );
  }

  const unitExpectations = [
    ["Battery Temperature", "Battery Temperature (C)", "degrees C"],
    ["Pack Current", "Pack Current (A)", "A"],
    ["Cell Voltage Delta", "Cell Voltage Delta (mV)", "mV"],
    ["State of Charge", "State of Charge (%)", "%"],
    ["Pack Voltage", "Pack Voltage (V)", "V"],
  ];

  for (const [prefix, expected, unit] of unitExpectations) {
    const incompatibleHeader = headers.find(
      (header) =>
        header.startsWith(prefix) &&
        header !== expected,
    );
    if (incompatibleHeader) {
      errors.push(
        `Column "${incompatibleHeader}" uses an unsupported unit or name; expected "${expected}" (${unit}).`,
      );
    }
  }

  if (missingColumns.length > 0) {
    errors.push(`Missing required columns: ${missingColumns.join(", ")}.`);
  }

  for (const error of parsed.errors) {
    const row = rowLabel(error.row ?? 0);
    if (error.code === "TooManyFields" || error.code === "MissingFields") {
      errors.push(
        `Row ${row} has an inconsistent number of columns (${error.message}).`,
      );
    } else {
      errors.push(`CSV parsing error near row ${row}: ${error.message}.`);
    }
  }

  const rows = parsed.data || [];
  if (rows.length === 0) {
    errors.push("The CSV contains a header but no data records.");
  }
  const previewHeaders = headers.includes("__parsed_extra")
    ? headers
    : rows.some((row) => row.__parsed_extra)
      ? [...headers, "__parsed_extra"]
      : headers;
  const previewRows = rows.map((row, index) => ({
    sourceRow: rowLabel(index),
    values: previewHeaders.map((header) =>
      header === "__parsed_extra"
        ? row[header]?.join(", ") ?? ""
        : row[header] ?? "",
    ),
  }));

  for (const column of headers) {
    if (
      !REQUIRED_BATTERY_COLUMNS.includes(column) &&
      !OPTIONAL_COLUMNS.includes(column) &&
      !/^(?:(?:Measured|Current|Rated|Design) Capacity \((?:Ah|Wh|kWh)\)|(?:measured|current|rated|design)_capacity_(?:ah|wh|kwh)|State of Health \(%\)|state_of_health_pct)$/i.test(column)
    ) {
      warnings.push(`Column "${column}" is not used by battery analysis.`);
    }
  }

  const records = [];
  let previousTimestamp = null;
  let previousBatteryId = null;
  const seenTimestamps = new Set();
  const hasTimestampColumn = headers.includes("Timestamp");
  const hasVoltageColumn = headers.includes("Pack Voltage (V)");
  const hasBatteryIdColumn = headers.includes("Battery ID");
  const hasProvenanceColumn = headers.includes("Data Provenance");
  let isSynthetic = false;

  rows.forEach((row, index) => {
    const rowNumber = rowLabel(index);
    const record = { sourceRow: rowNumber };
    let rowIsValid = true;

    for (const column of REQUIRED_BATTERY_COLUMNS) {
      const value = parseNumericValue(row[column]);
      if (value === null) {
        errors.push(
          formatFieldError(rowNumber - 2, column, "a numeric value is required"),
        );
        rowIsValid = false;
        continue;
      }

      const ranges = {
        "Battery Temperature (C)": [-50, 150],
        "Cell Voltage Delta (mV)": [0, 1000],
        "Cycle Index": [0, Number.MAX_SAFE_INTEGER],
        "State of Charge (%)": [0, 100],
      };
      const range = ranges[column];
      if (range && !checkValueRange(value, range[0], range[1])) {
        errors.push(
          formatFieldError(
            rowNumber - 2,
            column,
            `must be between ${range[0]} and ${range[1]}`,
          ),
        );
        rowIsValid = false;
      }
      if (
        column === "Cycle Index" &&
        !Number.isInteger(value)
      ) {
        errors.push(
          formatFieldError(rowNumber - 2, column, "must be a whole number"),
        );
        rowIsValid = false;
      }
      record[column] = value;
    }

    if (hasVoltageColumn && row["Pack Voltage (V)"]?.trim()) {
      const voltage = parseNumericValue(row["Pack Voltage (V)"]);
      if (voltage === null || voltage <= 0 || voltage > 2000) {
        errors.push(
          formatFieldError(
            rowNumber - 2,
            "Pack Voltage (V)",
            "must be a positive numeric value no greater than 2000 V",
          ),
        );
        rowIsValid = false;
      } else {
        record["Pack Voltage (V)"] = voltage;
      }
    } else if (hasVoltageColumn) {
      warnings.push(
        `Row ${rowNumber} — Pack Voltage (V): optional value is missing.`,
      );
    }

    if (hasCapacityPair) {
      const measuredCapacityValue = parseNumericValue(row[measuredCapacityColumn]);
      const referenceCapacityValue = parseNumericValue(row[referenceCapacityColumn]);
      const measuredMissing = measuredCapacityValue === null;
      const referenceMissing = referenceCapacityValue === null;

      if (measuredMissing && referenceMissing) {
        warnings.push(
          `Row ${rowNumber} — ${measuredCapacityColumn} and ${referenceCapacityColumn}: capacity values are missing; SOH is unavailable for this row.`,
        );
      } else if (measuredMissing || referenceMissing) {
        const missingColumn = measuredMissing
          ? measuredCapacityColumn
          : referenceCapacityColumn;
        errors.push(
          formatFieldError(rowNumber - 2, missingColumn, "a numeric capacity value is required"),
        );
        rowIsValid = false;
      } else if (measuredCapacityValue <= 0 || referenceCapacityValue <= 0) {
        const invalidColumn = measuredCapacityValue <= 0
          ? measuredCapacityColumn
          : referenceCapacityColumn;
        errors.push(
          formatFieldError(rowNumber - 2, invalidColumn, "capacity must be greater than zero"),
        );
        rowIsValid = false;
      } else if (measuredCapacityValue > referenceCapacityValue) {
        errors.push(
          formatFieldError(
            rowNumber - 2,
            measuredCapacityColumn,
            "must not exceed the rated/design capacity",
          ),
        );
        rowIsValid = false;
      } else {
        record.measuredCapacity = measuredCapacityValue;
        record.referenceCapacity = referenceCapacityValue;
        record.capacityUnit = measuredCapacityUnit;
      }
    }

    if (stateOfHealthColumn && row[stateOfHealthColumn]?.trim()) {
      const reportedSOH = parseNumericValue(row[stateOfHealthColumn]);
      if (reportedSOH === null || reportedSOH < 0 || reportedSOH > 100) {
        errors.push(
          formatFieldError(
            rowNumber - 2,
            stateOfHealthColumn,
            "must be a numeric percentage between 0 and 100",
          ),
        );
        rowIsValid = false;
      } else {
        record.reportedSOH = reportedSOH;
      }
    } else if (stateOfHealthColumn) {
      warnings.push(
        `Row ${rowNumber} — ${stateOfHealthColumn}: optional value is missing.`,
      );
    }

    if (hasTimestampColumn && row.Timestamp?.trim()) {
      const timestamp = Date.parse(row.Timestamp);
      if (Number.isNaN(timestamp)) {
        errors.push(
          formatFieldError(rowNumber - 2, "Timestamp", "is not a valid date/time"),
        );
        rowIsValid = false;
      } else if (seenTimestamps.has(timestamp)) {
        errors.push(
          formatFieldError(rowNumber - 2, "Timestamp", "duplicates an earlier timestamp"),
        );
        rowIsValid = false;
      } else {
        if (previousTimestamp !== null && timestamp < previousTimestamp) {
          warnings.push(
            `Row ${rowNumber} — Timestamp is out of order; records will be ordered by timestamp for latest-value metrics.`,
          );
        }
        seenTimestamps.add(timestamp);
        previousTimestamp = timestamp;
        record.Timestamp = new Date(timestamp).toISOString();
      }
    } else if (hasTimestampColumn) {
      warnings.push(
        `Row ${rowNumber} — Timestamp: optional value is missing; CSV order will be used.`,
      );
    }

    if (hasBatteryIdColumn && row["Battery ID"]?.trim()) {
      const batteryId = row["Battery ID"].trim();
      if (previousBatteryId && previousBatteryId !== batteryId) {
        errors.push(
          formatFieldError(
            rowNumber - 2,
            "Battery ID",
            `does not match "${previousBatteryId}"; one battery per analysis is supported`,
          ),
        );
        rowIsValid = false;
      } else {
        previousBatteryId = batteryId;
        record["Battery ID"] = batteryId;
      }
    }

    if (hasProvenanceColumn && row["Data Provenance"]?.trim()) {
      record["Data Provenance"] = row["Data Provenance"].trim();
      if (/synthetic/i.test(record["Data Provenance"])) {
        isSynthetic = true;
      }
    }

    if (rowIsValid) {
      records.push(record);
    }
  });

  const orderedRecords = [...records];
  if (orderedRecords.every((record) => record.Timestamp)) {
    orderedRecords.sort(
      (left, right) =>
        Date.parse(left.Timestamp) - Date.parse(right.Timestamp),
    );
  }
  for (let index = 1; index < orderedRecords.length; index += 1) {
    if (
      orderedRecords[index]["Cycle Index"] <
      orderedRecords[index - 1]["Cycle Index"]
    ) {
      errors.push(
        `Row ${orderedRecords[index].sourceRow} — Cycle Index: must not decrease over time.`,
      );
    }
  }

  return {
    headers,
    previewHeaders,
    previewRows,
    records,
    errors,
    warnings,
    canAnalyze: errors.length === 0 && records.length > 0,
    isSynthetic,
    capacityColumns: hasCapacityPair
      ? {
          measured: measuredCapacityColumn,
          reference: referenceCapacityColumn,
          unit: measuredCapacityUnit,
        }
      : null,
  };
}

function getRisk(value, mediumThreshold, highThreshold) {
  if (value === null || value === undefined) {
    return null;
  }
  return value >= highThreshold
    ? "High"
    : value >= mediumThreshold
      ? "Medium"
      : "Low";
}

export function calculateBatteryMetrics(records) {
  if (!records?.length) {
    return null;
  }

  const orderedRecords = [...records];
  if (orderedRecords.every((record) => record.Timestamp)) {
    orderedRecords.sort(
      (left, right) =>
        Date.parse(left.Timestamp) - Date.parse(right.Timestamp),
    );
  }

  const temperatures = orderedRecords.map(
    (record) => record["Battery Temperature (C)"],
  );
  const cellDeltas = orderedRecords.map(
    (record) => record["Cell Voltage Delta (mV)"],
  );
  const currents = orderedRecords.map((record) =>
    Math.abs(record["Pack Current (A)"]),
  );
  const cycles = orderedRecords.map((record) => record["Cycle Index"]);
  const socValues = orderedRecords.map(
    (record) => record["State of Charge (%)"],
  );
  const latestRecord = orderedRecords[orderedRecords.length - 1];
  const capacityRecord = [...orderedRecords]
    .reverse()
    .find((record) =>
      Number.isFinite(record.measuredCapacity) &&
      Number.isFinite(record.referenceCapacity),
    );
  const sum = (values) =>
    values.reduce((total, value) => total + value, 0);
  const maximumCurrent = Math.max(...currents);
  const maximumCellVoltageDelta = Math.max(...cellDeltas);

  return {
    recordCount: orderedRecords.length,
    latestCycle: latestRecord["Cycle Index"],
    latestTemperature: latestRecord["Battery Temperature (C)"],
    latestSOC: latestRecord["State of Charge (%)"],
    latestCurrent: latestRecord["Pack Current (A)"],
    latestVoltage: latestRecord["Pack Voltage (V)"] ?? null,
    maximumTemperature: Math.max(...temperatures),
    minimumTemperature: Math.min(...temperatures),
    averageTemperature: sum(temperatures) / temperatures.length,
    maximumCurrent,
    maximumCellVoltageDelta,
    minimumCycle: Math.min(...cycles),
    maximumCycle: Math.max(...cycles),
    cycleTrend: cycles[cycles.length - 1] - cycles[0],
    currentSOC: latestRecord["State of Charge (%)"],
    averageSOC: sum(socValues) / socValues.length,
    currentSOH: capacityRecord
      ? Number(
          ((capacityRecord.measuredCapacity / capacityRecord.referenceCapacity) * 100)
            .toFixed(2),
        )
      : null,
    sohMethod: capacityRecord
      ? "measured-capacity/rated-capacity"
      : null,
    measuredCapacity: capacityRecord?.measuredCapacity ?? null,
    referenceCapacity: capacityRecord?.referenceCapacity ?? null,
    capacityUnit: capacityRecord?.capacityUnit ?? null,
    thermalRisk: getRisk(Math.max(...temperatures), 40, 45),
    electricalRisk: getRisk(maximumCellVoltageDelta, 50, 80),
    chargingRisk: getRisk(maximumCurrent, 80, 120),
    cellImbalanceRisk: getRisk(maximumCellVoltageDelta, 50, 80),
    rawData: orderedRecords,
  };
}
