import { createDefine } from "fresh";
import type { Session } from "better-auth";

export interface State {
  shared: string;
  session: Session | null;
}

export const define = createDefine<State>();
