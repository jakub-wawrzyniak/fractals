import { createSignal, onCleanup, onMount } from "solid-js";
import { Size } from "../shared";

type DebounceArgs<T> = {
  delayMs: number;
  initValue: T;
};

export const useDebounced = <Data>({
  delayMs: delay,
  initValue,
}: DebounceArgs<Data>) => {
  const [current, setCurrent] = createSignal(initValue);
  const [debounced, setDebounced] = createSignal(initValue);
  const isChanging = () => current() !== debounced();

  let timer = -1;
  const clear = () => clearTimeout(timer);
  const update = (newValue: Data) => {
    clear();
    setCurrent(() => newValue);
    const updater = () => setDebounced(() => newValue);
    timer = setTimeout(updater, delay);
  };

  onCleanup(clear);
  return {
    update,
    current,
    debounced,
    isChanging,
  };
};

export const useSize = (element: HTMLElement | null, initValue: Size) => {
  const { update, ...info } = useDebounced<Size>({
    delayMs: 300,
    initValue: initValue,
  });

  const observer = new ResizeObserver((entries) => {
    const size = entries[0].contentRect;
    update(size);
  });

  onMount(() => {
    if (element == undefined)
      throw `useAspectRatio: element id=${element} nullish on mount`;
    observer.observe(element);
  });
  onCleanup(() => observer?.disconnect());
  return info;
};
