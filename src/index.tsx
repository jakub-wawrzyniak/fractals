import "./index.css";
import { render } from "solid-js/web";
import { Fractal } from "./Fractal";
import { Sidebar } from "./Sidebar";

const App = () => {
  return (
    <div class="flex">
      <Fractal />
      <Sidebar />
    </div>
  );
};

render(() => <App />, document.getElementById("root") as HTMLElement);
