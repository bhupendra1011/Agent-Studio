import type { SipNumber } from "@/lib/types/api";

export const mockSipNumbersSeed: SipNumber[] = [
  {
    id: "sip_mock_001",
    cid: "cid_mock",
    phone_number: "+14155551234",
    vendor: "twilio",
    created_from: "manual",
    source: "twilio",
    type: "outbound",
    description: "Main support line",
    config: {
      outbound_configs: {
        address: "sip.twilio.com",
        transport: "tcp",
      },
    },
    status: 1,
    is_deleted: 0,
    creator: "mock@example.com",
    create_time: "2025-07-01T10:00:00.000Z",
    update_time: "2025-09-15T14:00:00.000Z",
  },
  {
    id: "sip_mock_002",
    cid: "cid_mock",
    phone_number: "+14155555678",
    vendor: "twilio",
    created_from: "manual",
    source: "twilio",
    type: "outbound",
    description: "Outbound sales",
    config: {
      outbound_configs: {
        address: "sip.twilio.com",
        user: "outbound",
        transport: "udp",
      },
    },
    status: 1,
    is_deleted: 0,
    creator: "mock@example.com",
    create_time: "2025-08-01T10:00:00.000Z",
    update_time: "2025-09-10T11:00:00.000Z",
  },
];
