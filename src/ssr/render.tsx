import { renderToString } from "react-dom/server";
import { App } from "../pages/App";

export function render(pathname: string): string {
  return renderToString(<App path={pathname} />);
}
