import { ReactNode } from "react";

export type AppId = "nexus" | "terminal" | "editor" | "files" | "settings" | "browser" | "media" | "calc" | "monitor" | "camera" | "dashboard" | "teams";

export interface AppDefinition {
  id: AppId;
  name: string;
  icon: ReactNode;
  component: () => ReactNode;
  defaultSize?: { width: number; height: number };
}

export interface WindowState {
  id: AppId;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}
