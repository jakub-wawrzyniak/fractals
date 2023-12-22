import "./index.css";
import { render } from "solid-js/web";
import { Fractal } from "./fractal";

const App = () => {
  return <Fractal />;
};

render(() => <App />, document.getElementById("root") as HTMLElement);
