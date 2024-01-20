import { createSignal, onCleanup, onMount } from "solid-js";
import { DEFAULT_ASPECT_RATIO } from "../shared";

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
  const isChanging = () => {
    return current() !== debounced();
  };

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

export const useAspectRatio = (element: HTMLElement | null) => {
  const { update, ...info } = useDebounced({
    delayMs: 300,
    initValue: DEFAULT_ASPECT_RATIO,
  });

  const observer = new ResizeObserver((entries) => {
    const { height, width } = entries[0].contentRect;
    const aspectRatio = width / height;
    update(aspectRatio);
  });

  onMount(() => {
    if (element == undefined)
      throw `useAspectRatio: element id=${element} nullish on mount`;
    observer.observe(element);
  });
  onCleanup(() => observer?.disconnect());
  return info;
};
