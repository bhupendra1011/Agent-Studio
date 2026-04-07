"use client";

import type { CampaignDetails } from "@/lib/types/api";
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";

interface RedialCampaignData {
  csvData: string | null;
  csvFilename: string | null;
  campaignConfig: {
    is_send_immediately?: boolean;
    agent_uuid?: string;
    phone_number_id?: string;
    timezone?: string;
    call_interval_ms?: number;
    hangup_configuration?: CampaignDetails["hangup_configuration"];
    switch_configuration?: CampaignDetails["switch_configuration"];
    scheduled_time_ranges_config?: CampaignDetails["scheduled_time_ranges_config"];
    llm_call_evaluation_configuration?: CampaignDetails["llm_call_evaluation_configuration"];
    sip_transfer?: CampaignDetails["sip_transfer"];
  } | null;
}

interface RedialCampaignContextType {
  redialData: RedialCampaignData;
  setRedialCsvData: (csvData: string, filename: string) => void;
  setRedialCampaignConfig: (config: RedialCampaignData["campaignConfig"]) => void;
  clearRedialData: () => void;
}

const RedialCampaignContext = createContext<RedialCampaignContextType | undefined>(
  undefined
);

export function RedialCampaignProvider({ children }: { children: ReactNode }) {
  const [redialData, setRedialData] = useState<RedialCampaignData>({
    csvData: null,
    csvFilename: null,
    campaignConfig: null,
  });

  const setRedialCsvData = useCallback((csvData: string, filename: string) => {
    setRedialData((prev) => ({ ...prev, csvData, csvFilename: filename }));
  }, []);

  const setRedialCampaignConfig = useCallback(
    (campaignConfig: RedialCampaignData["campaignConfig"]) => {
      setRedialData((prev) => ({ ...prev, campaignConfig }));
    },
    []
  );

  const clearRedialData = useCallback(() => {
    setRedialData({ csvData: null, csvFilename: null, campaignConfig: null });
  }, []);

  return (
    <RedialCampaignContext.Provider
      value={{
        redialData,
        setRedialCsvData,
        setRedialCampaignConfig,
        clearRedialData,
      }}
    >
      {children}
    </RedialCampaignContext.Provider>
  );
}

export function useRedialCampaign() {
  const ctx = useContext(RedialCampaignContext);
  if (!ctx) {
    throw new Error("useRedialCampaign must be used within RedialCampaignProvider");
  }
  return ctx;
}
