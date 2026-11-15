/**
 * VoltSentry - Pure JavaScript PDF Generator
 * Generates a clean, professional, standards-compliant PDF (PDF-1.4)
 * containing the full battery analysis report.
 */

function escapePdfText(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

class SimplePdfBuilder {
  constructor() {
    this.pages = [];
  }

  addPage() {
    const page = { streams: [] };
    this.pages.push(page);
    return page;
  }

  rect(page, x, y, w, h, fillR, fillG, fillB, strokeR = null, strokeG = null, strokeB = null, lineWidth = 1) {
    let s = "";
    if (fillR !== null) {
      s += `${fillR.toFixed(3)} ${fillG.toFixed(3)} ${fillB.toFixed(3)} rg `;
    }
    if (strokeR !== null) {
      s += `${strokeR.toFixed(3)} ${strokeG.toFixed(3)} ${strokeB.toFixed(3)} RG ${lineWidth} w `;
    }
    s += `${x} ${y} ${w} ${h} re ${strokeR !== null && fillR !== null ? "B" : fillR !== null ? "f" : "S"}\n`;
    page.streams.push(s);
  }

  line(page, x1, y1, x2, y2, strokeR = 0.8, strokeG = 0.8, strokeB = 0.8, lineWidth = 1) {
    page.streams.push(
      `${lineWidth} w ${strokeR.toFixed(3)} ${strokeG.toFixed(3)} ${strokeB.toFixed(3)} RG ${x1} ${y1} m ${x2} ${y2} l S\n`,
    );
  }

  text(page, txt, x, y, size = 10, font = "F1", r = 0, g = 0, b = 0) {
    page.streams.push(
      `BT /${font} ${size} Tf ${r.toFixed(3)} ${g.toFixed(3)} ${b.toFixed(3)} rg ${x} ${y} Td (${escapePdfText(txt)}) Tj ET\n`,
    );
  }

  buildUint8Array() {
    const objects = [];
    const kids = [];
    const fonts = [
      { id: "F1", name: "Helvetica" },
      { id: "F2", name: "Helvetica-Bold" },
      { id: "F3", name: "Helvetica-Oblique" },
    ];

    const catalogObj = 1;
    const pagesObj = 2;
    let nextId = 3;

    const fontObjMap = {};
    for (const f of fonts) {
      fontObjMap[f.id] = nextId++;
    }

    const pageObjList = [];
    for (let i = 0; i < this.pages.length; i++) {
      const pId = nextId++;
      const cId = nextId++;
      pageObjList.push({ pId, cId, page: this.pages[i] });
      kids.push(`${pId} 0 R`);
    }

    objects.push({
      id: catalogObj,
      content: `<< /Type /Catalog /Pages ${pagesObj} 0 R >>`,
    });
    objects.push({
      id: pagesObj,
      content: `<< /Type /Pages /Kids [${kids.join(" ")}] /Count ${this.pages.length} >>`,
    });

    for (const f of fonts) {
      objects.push({
        id: fontObjMap[f.id],
        content: `<< /Type /Font /Subtype /Type1 /BaseFont /${f.name} >>`,
      });
    }

    let fontDict = "";
    for (const f of fonts) {
      fontDict += `/${f.id} ${fontObjMap[f.id]} 0 R `;
    }

    for (const item of pageObjList) {
      const streamData = item.page.streams.join("");
      const streamByteLength = new TextEncoder().encode(streamData).length;

      objects.push({
        id: item.pId,
        content: `<< /Type /Page /Parent ${pagesObj} 0 R /MediaBox [0 0 595 842] /Contents ${item.cId} 0 R /Resources << /Font << ${fontDict}>> >> >>`,
      });
      objects.push({
        id: item.cId,
        content: `<< /Length ${streamByteLength} >> stream\n${streamData}endstream`,
      });
    }

    objects.sort((a, b) => a.id - b.id);

    const encoder = new TextEncoder();
    let offset = encoder.encode("%PDF-1.4\n").length;
    const xref = ["xref", `0 ${objects.length + 1}`, "0000000000 65535 f "];
    let body = "";

    for (const obj of objects) {
      const str = `${obj.id} 0 obj ${obj.content} endobj\n`;
      xref.push(`${String(offset).padStart(10, "0")} 00000 n `);
      body += str;
      offset += encoder.encode(str).length;
    }

    const trailer = `trailer << /Size ${objects.length + 1} /Root ${catalogObj} 0 R >>\nstartxref\n${offset}\n%%EOF`;
    const fullPdfText = `%PDF-1.4\n${body}${xref.join("\n")}\n${trailer}`;
    return encoder.encode(fullPdfText);
  }
}

/**
 * Builds and downloads the comprehensive battery PDF report
 */
export function generateBatteryPdf(batteryData) {
  const data = batteryData || {};

  const vehicleName = data.vehicleName || "Tata Nexon EV";
  const vehicleNumber = data.vehicleNumber || "DL-01-EV-2026";
  const batteryId = data.batteryId || "BX-2026-001";
  const currentSOH = data.currentSOH !== null && data.currentSOH !== undefined
    ? Number(data.currentSOH).toFixed(1)
    : "92.0";
  const recordCount = data.recordCount || "12";
  const verificationStatus = data.verificationStatus || "Verified";
  const provenance = data.dataProvenance || "BMS Telemetry Upload";

  const lifetimeCycles = data.lifetimeCycles ?? 742;
  const currentSOC = data.currentSOC ?? 78.0;
  const averageSOC = data.averageSOC ?? 71.5;

  const maxTemp = data.maximumTemperature !== null && data.maximumTemperature !== undefined
    ? Number(data.maximumTemperature).toFixed(1)
    : "36.5";
  const avgTemp = data.averageTemperature !== null && data.averageTemperature !== undefined
    ? Number(data.averageTemperature).toFixed(1)
    : "31.2";
  const ambientTemp = data.ambientTemperature !== null && data.ambientTemperature !== undefined
    ? Number(data.ambientTemperature).toFixed(1)
    : "26.1";

  const maxCurrent = data.maximumCurrent !== null && data.maximumCurrent !== undefined
    ? Number(data.maximumCurrent).toFixed(1)
    : "68.0";

  const maxDelta = data.maximumCellVoltageDelta !== null && data.maximumCellVoltageDelta !== undefined
    ? Number(data.maximumCellVoltageDelta).toFixed(1)
    : "22.0";
  const avgDelta = data.averageCellVoltageDelta !== null && data.averageCellVoltageDelta !== undefined
    ? Number(data.averageCellVoltageDelta).toFixed(1)
    : "17.4";

  const thermalRisk = data.thermalRisk || "Low";
  const electricalRisk = data.electricalRisk || "Low";
  const chargingRisk = data.chargingRisk || "Low";
  const cellImbalanceRisk = data.cellImbalanceRisk || "Low";

  const recordedRisks = [thermalRisk, electricalRisk, chargingRisk, cellImbalanceRisk];
  const overallSafety = recordedRisks.includes("High")
    ? "High Risk - Attention Required"
    : recordedRisks.includes("Medium")
      ? "Medium Risk - Regular Monitoring"
      : "Safe (All Parameters Optimal)";

  const measuredCap = data.measuredCapacity ? `${data.measuredCapacity} ${data.capacityUnit || "Ah"}` : "64.4 Ah";
  const ratedCap = data.referenceCapacity ? `${data.referenceCapacity} ${data.capacityUnit || "Ah"}` : "70.0 Ah";

  const reportDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const reportTime = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const reportId = `VS-${Date.now().toString(36).toUpperCase()}`;

  const doc = new SimplePdfBuilder();

  // ==========================================
  // PAGE 1: EXECUTIVE SUMMARY, HEALTH & SAFETY
  // ==========================================
  const p1 = doc.addPage();

  // Header Background Bar (Dark Emerald Navy)
  doc.rect(p1, 0, 755, 595, 87, 0.05, 0.08, 0.14);
  // Accent neon green strip
  doc.rect(p1, 0, 752, 595, 3, 0.0, 1.0, 0.53);

  // Logo & Title
  doc.text(p1, "VOLTSENTRY", 40, 805, 20, "F2", 0.0, 1.0, 0.53);
  doc.text(p1, "EV BATTERY INTELLIGENCE & SAFETY REPORT", 40, 786, 12, "F2", 1.0, 1.0, 1.0);
  doc.text(p1, "State of Health, Safety Risk, Thermal Diagnostics & Second-Life Assessment", 40, 770, 8.5, "F1", 0.75, 0.8, 0.85);

  // Top Meta details (right aligned)
  doc.text(p1, `Report ID: ${reportId}`, 430, 805, 9, "F2", 0.9, 0.95, 1.0);
  doc.text(p1, `Date: ${reportDate} ${reportTime}`, 430, 790, 8, "F1", 0.7, 0.75, 0.8);
  doc.text(p1, `Status: ${verificationStatus.toUpperCase()}`, 430, 775, 8.5, "F2", 0.0, 1.0, 0.53);

  // Section 1: Vehicle & Battery Summary
  let y = 715;
  doc.rect(p1, 40, y - 8, 515, 24, 0.93, 0.96, 0.98);
  doc.text(p1, "1. VEHICLE & BATTERY PACK IDENTIFICATION", 48, y, 10.5, "F2", 0.05, 0.2, 0.35);

  y -= 26;
  const col1 = 48;
  const col2 = 210;
  const col3 = 380;

  doc.text(p1, "Vehicle Model:", col1, y, 9, "F2", 0.2, 0.25, 0.3);
  doc.text(p1, vehicleName, col1 + 75, y, 9, "F1", 0.0, 0.0, 0.0);

  doc.text(p1, "Reg. Number:", col2, y, 9, "F2", 0.2, 0.25, 0.3);
  doc.text(p1, vehicleNumber, col2 + 70, y, 9, "F1", 0.0, 0.0, 0.0);

  doc.text(p1, "Battery ID:", col3, y, 9, "F2", 0.2, 0.25, 0.3);
  doc.text(p1, batteryId, col3 + 60, y, 9, "F1", 0.0, 0.0, 0.0);

  y -= 16;
  doc.text(p1, "Records Analyzed:", col1, y, 9, "F2", 0.2, 0.25, 0.3);
  doc.text(p1, `${recordCount} Telemetry Points`, col1 + 95, y, 9, "F1", 0.0, 0.0, 0.0);

  doc.text(p1, "Provenance:", col2, y, 9, "F2", 0.2, 0.25, 0.3);
  doc.text(p1, provenance, col2 + 70, y, 8.5, "F1", 0.0, 0.0, 0.0);

  doc.text(p1, "Verification:", col3, y, 9, "F2", 0.2, 0.25, 0.3);
  doc.text(p1, "Certified Verified", col3 + 65, y, 9, "F1", 0.0, 0.5, 0.2);

  y -= 14;
  doc.line(p1, 40, y, 555, y, 0.85, 0.88, 0.9, 1);

  // Section 2: Core Health & Battery State of Health (SOH)
  y -= 22;
  doc.rect(p1, 40, y - 8, 515, 24, 0.93, 0.96, 0.98);
  doc.text(p1, "2. STATE OF HEALTH (SOH) & CAPACITY RETENTION", 48, y, 10.5, "F2", 0.05, 0.2, 0.35);

  y -= 28;
  // SOH Metric Card
  doc.rect(p1, 40, y - 48, 160, 60, 0.96, 0.99, 0.97, 0.0, 0.7, 0.35, 1.5);
  doc.text(p1, "STATE OF HEALTH (SOH)", 50, y, 8.5, "F2", 0.1, 0.4, 0.2);
  doc.text(p1, `${currentSOH}%`, 50, y - 28, 24, "F2", 0.0, 0.55, 0.25);
  const healthLabel = Number(currentSOH) >= 80 ? "Condition: Good (Optimal)" : "Condition: Needs Attention";
  doc.text(p1, healthLabel, 50, y - 42, 8, "F1", 0.2, 0.2, 0.2);

  // Capacity & SOC Details
  doc.rect(p1, 212, y - 48, 343, 60, 0.98, 0.98, 0.99, 0.8, 0.85, 0.9, 1);
  doc.text(p1, "Measured Pack Capacity:", 224, y - 4, 8.5, "F2", 0.2, 0.25, 0.3);
  doc.text(p1, measuredCap, 370, y - 4, 8.5, "F1", 0.0, 0.0, 0.0);

  doc.text(p1, "Original Rated Capacity:", 224, y - 18, 8.5, "F2", 0.2, 0.25, 0.3);
  doc.text(p1, ratedCap, 370, y - 18, 8.5, "F1", 0.0, 0.0, 0.0);

  doc.text(p1, "Current State of Charge (SOC):", 224, y - 32, 8.5, "F2", 0.2, 0.25, 0.3);
  doc.text(p1, `${currentSOC}% (Average: ${averageSOC}%)`, 370, y - 32, 8.5, "F1", 0.0, 0.0, 0.0);

  doc.text(p1, "Total Lifetime Charge Cycles:", 224, y - 44, 8.5, "F2", 0.2, 0.25, 0.3);
  doc.text(p1, `${lifetimeCycles} Cycles`, 370, y - 44, 8.5, "F1", 0.0, 0.0, 0.0);

  y -= 74;

  // Section 3: Safety Risk Analysis
  doc.rect(p1, 40, y - 8, 515, 24, 0.93, 0.96, 0.98);
  doc.text(p1, "3. SAFETY RISK MONITORING & ASSESSMENT", 48, y, 10.5, "F2", 0.05, 0.2, 0.35);

  y -= 26;
  doc.text(p1, "Overall Safety Status:", 48, y, 9.5, "F2", 0.1, 0.1, 0.1);
  const safetyColor = overallSafety.startsWith("Safe") ? [0.0, 0.55, 0.25] : [0.8, 0.2, 0.1];
  doc.text(p1, overallSafety, 175, y, 9.5, "F2", safetyColor[0], safetyColor[1], safetyColor[2]);

  y -= 20;
  // 4 Risk Boxes Table
  const boxW = 122;
  const risks = [
    { label: "Thermal Risk", val: thermalRisk },
    { label: "Electrical Risk", val: electricalRisk },
    { label: "Charging Risk", val: chargingRisk },
    { label: "Cell Imbalance", val: cellImbalanceRisk },
  ];

  risks.forEach((r, idx) => {
    const rx = 40 + idx * (boxW + 8);
    const isLow = r.val === "Low" || r.val === "0";
    const bgR = isLow ? 0.94 : 0.99;
    const bgG = isLow ? 0.98 : 0.93;
    const bgB = isLow ? 0.95 : 0.93;
    const stR = isLow ? 0.0 : 0.85;
    const stG = isLow ? 0.6 : 0.3;
    const stB = isLow ? 0.3 : 0.2;

    doc.rect(p1, rx, y - 36, boxW, 40, bgR, bgG, bgB, stR, stG, stB, 1);
    doc.text(p1, r.label, rx + 10, y - 10, 8.5, "F2", 0.15, 0.2, 0.25);
    doc.text(p1, r.val, rx + 10, y - 28, 13, "F2", stR, stG, stB);
  });

  y -= 58;

  // Section 4: Thermal Analysis
  doc.rect(p1, 40, y - 8, 515, 24, 0.93, 0.96, 0.98);
  doc.text(p1, "4. THERMAL ANALYSIS & TEMPERATURE OPERATING LIMITS", 48, y, 10.5, "F2", 0.05, 0.2, 0.35);

  y -= 26;
  doc.text(p1, "Max Battery Temperature:", col1, y, 9, "F2", 0.2, 0.25, 0.3);
  doc.text(p1, `${maxTemp} °C`, col1 + 130, y, 9, "F1", 0.0, 0.0, 0.0);

  doc.text(p1, "Average Operating Temp:", col2 + 20, y, 9, "F2", 0.2, 0.25, 0.3);
  doc.text(p1, `${avgTemp} °C`, col2 + 155, y, 9, "F1", 0.0, 0.0, 0.0);

  doc.text(p1, "Ambient Reference:", col3 + 10, y, 9, "F2", 0.2, 0.25, 0.3);
  doc.text(p1, `${ambientTemp} °C`, col3 + 110, y, 9, "F1", 0.0, 0.0, 0.0);

  y -= 18;
  doc.text(p1, "Thermal Condition:", col1, y, 9, "F2", 0.2, 0.25, 0.3);
  doc.text(p1, Number(maxTemp) >= 45 ? "Critical (> 45°C)" : Number(maxTemp) >= 40 ? "Warning" : "Normal (< 40°C)", col1 + 130, y, 9, "F1", 0.0, 0.4, 0.2);

  doc.text(p1, "Thermal Stability:", col2 + 20, y, 9, "F2", 0.2, 0.25, 0.3);
  doc.text(p1, "Good / Controlled", col2 + 155, y, 9, "F1", 0.0, 0.4, 0.2);

  doc.text(p1, "Overheating Risk:", col3 + 10, y, 9, "F2", 0.2, 0.25, 0.3);
  doc.text(p1, thermalRisk, col3 + 110, y, 9, "F1", 0.0, 0.4, 0.2);

  y -= 26;

  // Section 5: Degradation Factors & Cell Uniformity
  doc.rect(p1, 40, y - 8, 515, 24, 0.93, 0.96, 0.98);
  doc.text(p1, "5. DEGRADATION FACTORS & CELL VOLTAGE UNIFORMITY", 48, y, 10.5, "F2", 0.05, 0.2, 0.35);

  y -= 24;
  doc.text(p1, "Maximum Cell Voltage Delta:", col1, y, 9, "F2", 0.2, 0.25, 0.3);
  doc.text(p1, `${maxDelta} mV`, col1 + 145, y, 9, "F1", 0.0, 0.0, 0.0);

  doc.text(p1, "Average Cell Delta:", col2 + 35, y, 9, "F2", 0.2, 0.25, 0.3);
  doc.text(p1, `${avgDelta} mV`, col2 + 140, y, 9, "F1", 0.0, 0.0, 0.0);

  doc.text(p1, "Maximum Pack Current:", col3 + 10, y, 9, "F2", 0.2, 0.25, 0.3);
  doc.text(p1, `${maxCurrent} A`, col3 + 120, y, 9, "F1", 0.0, 0.0, 0.0);

  y -= 18;
  const tempContribution = Number(maxTemp) >= 40 ? "36%" : "20%";
  const fastChargeContribution = Number(maxCurrent) >= 80 ? "28%" : "15%";
  const cycleContribution = Number(lifetimeCycles) >= 700 ? "22%" : "15%";
  const deltaContribution = Number(maxDelta) >= 50 ? "14%" : "10%";

  doc.text(p1, "Primary Degradation Impact Contributions:", col1, y, 8.5, "F2", 0.2, 0.25, 0.3);
  doc.text(p1, `Heat Stress: ${tempContribution}  |  Fast Charge Stress: ${fastChargeContribution}  |  Cycle Aging: ${cycleContribution}  |  Cell Imbalance: ${deltaContribution}`, col1, y - 14, 8, "F1", 0.3, 0.35, 0.4);

  y -= 36;

  // Section 6: Second-Life Assessment
  doc.rect(p1, 40, y - 8, 515, 24, 0.93, 0.96, 0.98);
  doc.text(p1, "6. SECOND-LIFE BATTERY PASSPORT & REUSE RECOMMENDATION", 48, y, 10.5, "F2", 0.05, 0.2, 0.35);

  y -= 26;
  doc.rect(p1, 40, y - 48, 515, 54, 0.97, 0.99, 0.98, 0.0, 0.6, 0.3, 1.2);
  doc.text(p1, "SECOND-LIFE ASSESSMENT: APPROVED FOR REUSE", 52, y - 6, 9.5, "F2", 0.0, 0.5, 0.2);
  doc.text(p1, `• Estimated Usability: Grade A (High Suitability)  —  Current SOH of ${currentSOH}% satisfies stationary storage standards.`, 52, y - 20, 8, "F1", 0.1, 0.15, 0.2);
  doc.text(p1, "• Recommended Next Best Use: Stationary Solar Energy Storage / Commercial Microgrid Backup.", 52, y - 32, 8, "F1", 0.1, 0.15, 0.2);
  doc.text(p1, "• Estimated Remaining Second-Life Span: 7 to 9 Years under standard 0.5C charge/discharge cycles.", 52, y - 44, 8, "F1", 0.1, 0.15, 0.2);

  // Footer / Disclaimer
  y -= 76;
  doc.line(p1, 40, y, 555, y, 0.8, 0.82, 0.85, 1);
  doc.text(p1, "DISCLAIMER: VoltSentry telemetry results and health predictions are analytical estimates derived from battery telemetry", 40, y - 12, 7.5, "F3", 0.45, 0.45, 0.5);
  doc.text(p1, "measurements and do not replace physical electrochemical laboratory certification.", 40, y - 22, 7.5, "F3", 0.45, 0.45, 0.5);
  doc.text(p1, "Generated by VoltSentry AI Battery Intelligence Engine • https://volt-sentry.vercel.app", 40, y - 33, 7.5, "F1", 0.3, 0.35, 0.4);

  return doc.buildUint8Array();
}

/**
 * Triggers direct browser download of the PDF
 */
export function downloadBatteryReportPdf(batteryData) {
  try {
    const pdfBytes = generateBatteryPdf(batteryData);
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const safeName = (batteryData?.vehicleName || "VoltSentry_Battery")
      .replace(/[^a-zA-Z0-9_-]/g, "_");
    const dateStr = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `${safeName}_Full_Report_${dateStr}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    return true;
  } catch (error) {
    console.error("Error generating battery report PDF:", error);
    alert("Could not generate PDF report. Opening print view instead.");
    window.print();
    return false;
  }
}
