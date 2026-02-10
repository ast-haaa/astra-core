export type HerbName = "Tulsi" | "Ashwagandha" | "Brahmi";

export type Status = "SAFE" | "RECALLED";

export type ActorRole = "FARMER" | "TRANSPORTER" | "LAB" | "SYSTEM";

export interface FarmerInfo {
  name: string;
  village: string;
  district: string;
  state: string;
}

export interface EnvironmentInfo {
  temperatureC: number;
  humidityPercent: number;
  weightKg: number;
  lastUpdated: string;
}

export interface LabTestInfo {
  result: "PASS" | "FAIL" | "PENDING";
  testedAt?: string;
  note?: string;
}

export interface RecallInfo {
  isRecalled: boolean;
  reason: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  actorRole: ActorRole;
  time: string;
  locationText?: string;
  actions?: string[];
  lat?: number;
  lng?: number;
}

export interface HerbBox {
  boxId: string;
  batchCode: string;
  herbName: HerbName;
  status: Status;
  farmer: FarmerInfo;
  environment: EnvironmentInfo;
  labTest: LabTestInfo;
  recall?: RecallInfo;
  timeline: TimelineEvent[];
}

export const HERB_BOXES: HerbBox[] = [
  {
    boxId: "BOX_TULSI_001",
    batchCode: "BATCH_TULSI_001",
    herbName: "Tulsi",
    status: "SAFE",
    farmer: {
      name: "Ramesh Kumar Sharma",
      village: "Sundarganj",
      district: "Varanasi",
      state: "Uttar Pradesh"
    },
    environment: {
      temperatureC: 22,
      humidityPercent: 55,
      weightKg: 25.5,
      lastUpdated: "2024-12-03T14:30:00Z"
    },
    labTest: {
      result: "PASS",
      testedAt: "2024-12-02T10:00:00Z",
      note: "All parameters within safe limits. No pesticide residue detected."
    },
    timeline: [
      {
        id: "evt_1",
        title: "Harvested from organic farm",
        actorRole: "FARMER",
        time: "2024-11-28T06:00:00Z",
        locationText: "Sundarganj, Varanasi",
        lat: 25.3176,
        lng: 82.9739,
        actions: ["farmerActionYes", "qualityCheckPassed", "organicCertified"]
      },
      {
        id: "evt_2",
        title: "Quality check at farm",
        actorRole: "FARMER",
        time: "2024-11-28T08:30:00Z",
        locationText: "Sundarganj, Varanasi",
        lat: 25.3176,
        lng: 82.9739,
        actions: ["farmerActionYes", "moistureChecked", "weightRecorded"]
      },
      {
        id: "evt_3",
        title: "Packed and sealed",
        actorRole: "FARMER",
        time: "2024-11-28T10:00:00Z",
        locationText: "Sundarganj Processing Unit",
        lat: 25.3200,
        lng: 82.9800,
        actions: ["farmerActionYes", "sealedProperly", "labelApplied"]
      },
      {
        id: "evt_4",
        title: "Picked up for transport",
        actorRole: "TRANSPORTER",
        time: "2024-11-29T07:00:00Z",
        locationText: "Varanasi Hub",
        lat: 25.3176,
        lng: 83.0100,
        actions: ["temperatureLogged", "vehicleInspected"]
      },
      {
        id: "evt_5",
        title: "Arrived at testing facility",
        actorRole: "TRANSPORTER",
        time: "2024-12-01T14:00:00Z",
        locationText: "Lucknow Testing Lab",
        lat: 26.8467,
        lng: 80.9462,
        actions: ["handoverCompleted", "documentsVerified"]
      },
      {
        id: "evt_6",
        title: "Lab testing completed",
        actorRole: "LAB",
        time: "2024-12-02T10:00:00Z",
        locationText: "Lucknow Testing Lab",
        lat: 26.8467,
        lng: 80.9462,
        actions: ["testsPassed", "certificateIssued"]
      },
      {
        id: "evt_7",
        title: "Delivered to retail store",
        actorRole: "TRANSPORTER",
        time: "2024-12-03T09:00:00Z",
        locationText: "Ayurveda Wellness Store, Delhi",
        lat: 28.6139,
        lng: 77.2090,
        actions: ["deliveryConfirmed", "receiptSigned"]
      }
    ]
  },
  {
    boxId: "BOX_ASHWA_001",
    batchCode: "BATCH_ASHWA_001",
    herbName: "Ashwagandha",
    status: "SAFE",
    farmer: {
      name: "Lakshmi Devi Patel",
      village: "Mandla",
      district: "Nagpur",
      state: "Maharashtra"
    },
    environment: {
      temperatureC: 24,
      humidityPercent: 48,
      weightKg: 18.2,
      lastUpdated: "2024-12-03T12:15:00Z"
    },
    labTest: {
      result: "PENDING",
      note: "Sample collected, awaiting test results."
    },
    timeline: [
      {
        id: "evt_1",
        title: "Harvested from certified farm",
        actorRole: "FARMER",
        time: "2024-12-01T05:30:00Z",
        locationText: "Mandla, Nagpur",
        lat: 21.1458,
        lng: 79.0882,
        actions: ["farmerActionYes", "organicCertified"]
      },
      {
        id: "evt_2",
        title: "Packed for transport",
        actorRole: "FARMER",
        time: "2024-12-01T11:00:00Z",
        locationText: "Mandla Processing Center",
        lat: 21.1500,
        lng: 79.0900,
        actions: ["farmerActionYes", "sealedProperly"]
      },
      {
        id: "evt_3",
        title: "In transit to lab",
        actorRole: "TRANSPORTER",
        time: "2024-12-02T08:00:00Z",
        locationText: "En route to Pune",
        lat: 18.5204,
        lng: 73.8567,
        actions: ["temperatureLogged", "inTransit"]
      }
    ]
  },
  {
    boxId: "BOX_BRAHMI_001",
    batchCode: "BATCH_BRAHMI_001",
    herbName: "Brahmi",
    status: "RECALLED",
    farmer: {
      name: "Suresh Bhai Mehta",
      village: "Anand",
      district: "Anand",
      state: "Gujarat"
    },
    environment: {
      temperatureC: 32,
      humidityPercent: 72,
      weightKg: 12.8,
      lastUpdated: "2024-12-03T16:45:00Z"
    },
    labTest: {
      result: "FAIL",
      testedAt: "2024-12-02T15:00:00Z",
      note: "Elevated pesticide levels detected. Batch failed safety standards."
    },
    recall: {
      isRecalled: true,
      reason: "Pesticide contamination detected above permissible limits. Do not consume. Please return to point of purchase for full refund."
    },
    timeline: [
      {
        id: "evt_1",
        title: "Harvested from farm",
        actorRole: "FARMER",
        time: "2024-11-25T07:00:00Z",
        locationText: "Anand, Gujarat",
        lat: 22.5645,
        lng: 72.9289,
        actions: ["farmerActionNo", "standardProcedure"]
      },
      {
        id: "evt_2",
        title: "Lab testing failed",
        actorRole: "LAB",
        time: "2024-12-02T15:00:00Z",
        locationText: "Ahmedabad Testing Facility",
        lat: 23.0225,
        lng: 72.5714,
        actions: ["testsFailed", "contaminationDetected"]
      },
      {
        id: "evt_3",
        title: "Recall initiated",
        actorRole: "SYSTEM",
        time: "2024-12-02T16:30:00Z",
        locationText: "System Alert",
        lat: 23.0225,
        lng: 72.5714,
        actions: ["recallIssued", "notificationsSent"]
      }
    ]
  }
];
