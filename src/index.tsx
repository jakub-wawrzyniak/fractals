import "./index.css";
import { render } from "solid-js/web";
import { Map } from "./fractal";

const App = () => {
  return <Map />;
};

render(() => <App />, document.getElementById("root") as HTMLElement);
