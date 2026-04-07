import type {
  GraphData,
  GraphDataParamsConfig,
} from "@/lib/types/api";

export type EditorTab =
  | "prompt"
  | "models"
  | "advanced"
  | "actions"
  | "code"
  | "analytics";

export interface EditorState {
  name: string;
  description: string;
  graphData: GraphData;
  graphDataParamsConfig: GraphDataParamsConfig;
  dirty: boolean;
  saving: boolean;
}

export type EditorAction =
  | { type: "INIT"; payload: { name: string; description: string; graphData: GraphData; graphDataParamsConfig?: GraphDataParamsConfig } }
  | { type: "SET_NAME"; payload: string }
  | { type: "SET_DESCRIPTION"; payload: string }
  | { type: "SET_GRAPH_DATA"; payload: Partial<GraphData> }
  | { type: "SET_LLM"; payload: Partial<NonNullable<GraphData["llm"]>> }
  | { type: "SET_ASR"; payload: Partial<NonNullable<GraphData["asr"]>> }
  | { type: "SET_TTS"; payload: Partial<NonNullable<GraphData["tts"]>> }
  | { type: "SET_VAD"; payload: Partial<NonNullable<GraphData["vad"]>> }
  | { type: "SET_TURN_DETECTION"; payload: Partial<NonNullable<GraphData["turn_detection"]>> }
  | { type: "SET_ADVANCED_FEATURES"; payload: Partial<NonNullable<GraphData["advanced_features"]>> }
  | { type: "SET_PARAMS_CONFIG"; payload: GraphDataParamsConfig }
  | { type: "SET_SAVING"; payload: boolean }
  | { type: "MARK_CLEAN" };

export const initialEditorState: EditorState = {
  name: "",
  description: "",
  graphData: {},
  graphDataParamsConfig: {},
  dirty: false,
  saving: false,
};

export function editorReducer(state: EditorState, action: EditorAction): EditorState {
  switch (action.type) {
    case "INIT":
      return {
        ...state,
        name: action.payload.name,
        description: action.payload.description,
        graphData: action.payload.graphData,
        graphDataParamsConfig: action.payload.graphDataParamsConfig ?? {},
        dirty: false,
        saving: false,
      };
    case "SET_NAME":
      return { ...state, name: action.payload, dirty: true };
    case "SET_DESCRIPTION":
      return { ...state, description: action.payload, dirty: true };
    case "SET_GRAPH_DATA":
      return { ...state, graphData: { ...state.graphData, ...action.payload }, dirty: true };
    case "SET_LLM":
      return {
        ...state,
        graphData: { ...state.graphData, llm: { ...state.graphData.llm, ...action.payload } },
        dirty: true,
      };
    case "SET_ASR":
      return {
        ...state,
        graphData: { ...state.graphData, asr: { ...state.graphData.asr, vendor: state.graphData.asr?.vendor ?? "microsoft", params: { ...state.graphData.asr?.params, ...action.payload.params }, ...action.payload } },
        dirty: true,
      };
    case "SET_TTS":
      return {
        ...state,
        graphData: { ...state.graphData, tts: { ...state.graphData.tts, vendor: state.graphData.tts?.vendor ?? "microsoft", params: { ...state.graphData.tts?.params, ...action.payload.params }, ...action.payload } },
        dirty: true,
      };
    case "SET_VAD":
      return {
        ...state,
        graphData: { ...state.graphData, vad: { ...state.graphData.vad, ...action.payload } },
        dirty: true,
      };
    case "SET_TURN_DETECTION":
      return {
        ...state,
        graphData: { ...state.graphData, turn_detection: { ...state.graphData.turn_detection, ...action.payload } },
        dirty: true,
      };
    case "SET_ADVANCED_FEATURES":
      return {
        ...state,
        graphData: { ...state.graphData, advanced_features: { ...state.graphData.advanced_features, ...action.payload } },
        dirty: true,
      };
    case "SET_PARAMS_CONFIG":
      return { ...state, graphDataParamsConfig: action.payload, dirty: true };
    case "SET_SAVING":
      return { ...state, saving: action.payload };
    case "MARK_CLEAN":
      return { ...state, dirty: false };
    default:
      return state;
  }
}
