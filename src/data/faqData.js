const faqCategories = [
  {
    name: "General",
    questions: [
      {
        question: "What is VoltSentry?",
        answer:
          "VoltSentry is a browser-based EV battery dashboard. It lets you import battery telemetry from a CSV, review calculated measurements and risk indicators, and view a battery passport and saved analysis.",
      },
      {
        question: "What features does it provide?",
        answer:
          "You can validate and preview a battery CSV, review temperature, state of charge, cycle and cell-voltage data, see estimated thermal, electrical, charging and cell-imbalance risks, and view the Dashboard, My Batteries list and Second-Life Passport. The current app stores the analyzed battery in this browser's local storage.",
      },
    ],
  },
  {
    name: "Battery Health",
    questions: [
      {
        question: "What is SOH?",
        answer:
          "State of Health (SOH) is a comparison of a battery's measured capacity with its rated or design capacity. VoltSentry only displays a calculated SOH when valid measured and rated capacity values are available in matching units.",
      },
      {
        question: "Why is Battery Health unavailable?",
        answer:
          "SOH is unavailable unless the CSV includes measured (or current) capacity and rated (or design) capacity in matching Ah, Wh, or kWh units, with valid positive values and measured capacity no greater than rated capacity. Without a usable capacity pair, VoltSentry does not infer a health percentage.",
      },
      {
        question: "How is SOH calculated?",
        answer:
          "When a valid capacity pair is available, VoltSentry calculates SOH as measured capacity / rated capacity × 100. It uses the latest available row with both valid capacity values. The capacities must use matching units, be greater than zero, and measured capacity cannot exceed rated capacity.",
      },
    ],
  },
  {
    name: "Battery Analysis",
    questions: [
      {
        question: "How do I upload a CSV?",
        answer:
          "Open Analyze Battery, choose a .csv file, or use Load Sample Dataset to preview the bundled demonstration data. After validation passes, enter the vehicle number, vehicle name and battery ID, then submit the form to save the analysis and open the Dashboard. The sample data is synthetic, not real EV measurements.",
      },
      {
        question: "Which columns are required?",
        answer:
          "Every CSV needs these exact columns: Battery Temperature (C), Pack Current (A), Cell Voltage Delta (mV), Cycle Index, and State of Charge (%). Timestamp, Pack Voltage (V), Battery ID and Data Provenance are optional. Capacity columns are optional, but a valid measured/current and rated/design capacity pair is needed for SOH.",
      },
      {
        question: "Why was my CSV rejected?",
        answer:
          "Check the validation errors shown on Analyze Battery. Common causes include a non-CSV or empty file, missing required columns, duplicate headers, inconsistent row lengths, non-numeric or out-of-range required values, an invalid timestamp, decreasing cycle indexes over time, or mixed battery IDs. Capacity errors such as mismatched units or invalid values can also prevent analysis. Correct the reported rows and columns, then select the file again.",
      },
    ],
  },
  {
    name: "Safety",
    questions: [
      {
        question: "What does Safety Risk mean?",
        answer:
          "These are estimated indicators calculated from uploaded measurements, not certified diagnostics. In the current implementation, thermal risk uses maximum temperature (Medium at 40°C and High at 45°C); charging risk uses maximum absolute pack current (Medium at 80 A and High at 120 A); and electrical and cell-imbalance risks use maximum cell-voltage delta (Medium at 50 mV and High at 80 mV). The overall dashboard risk reflects the highest recorded category. If there is no validated risk data, it is shown as unavailable.",
      },
      {
        question: "What should I do if a battery shows a warning?",
        answer:
          "Treat the displayed risk as an estimate and consult the vehicle or battery manufacturer's guidance and a qualified service professional. VoltSentry's results do not replace certified testing. If you observe immediate signs of danger such as smoke, swelling, unusual heat or odor, move away from the battery and contact local emergency services; do not handle it.",
      },
    ],
  },
  {
    name: "Charging",
    questions: [
      {
        question: "What is a charging cycle?",
        answer:
          "A cycle is commonly used to describe battery use equivalent to charging and discharging its full capacity, though counting conventions vary. VoltSentry reads the Cycle Index values in your CSV and displays cycle metrics from them; it does not calculate full-equivalent cycles from charge events.",
      },
      {
        question: "How does temperature affect a battery?",
        answer:
          "Temperature can affect battery performance and long-term aging; extreme heat or cold can be stressful to a battery. VoltSentry charts the temperature values in your uploaded data and calculates its thermal-risk indicator from the maximum recorded temperature. Those results are estimates, not a battery diagnosis.",
      },
    ],
  },
  {
    name: "Digital Passport and My Batteries",
    questions: [
      {
        question: "What information is shown in the Digital Passport?",
        answer:
          "The Second-Life Passport can show vehicle and battery identifiers, lifetime cycle count, maximum recorded temperature, maximum cell-voltage delta, current state of charge, data-point count, verification status and capacity-based SOH when available. Manufacturer, manufacturing date and other unavailable inputs are shown as unavailable rather than inferred. Its condition and suitability labels are estimates, not a certified reuse decision.",
      },
      {
        question: "How do I view a battery?",
        answer:
          "After a successful analysis, open My Batteries to see the currently saved battery and choose View Passport for its details. The current app stores one analyzed battery in this browser's local storage; analyzing another dataset replaces that saved analysis. You can also review its metrics on the Dashboard.",
      },
    ],
  },
];

export default faqCategories;
