import { createSignal, onCleanup, onMount } from "solid-js";

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

export const useAspectRatio = (elementId: string) => {
  const { update, ...info } = useDebounced({ delayMs: 300, initValue: 1 });

  const observer = new ResizeObserver((entries) => {
    const { height, width } = entries[0].contentRect;
    const aspectRatio = height / width;
    update(aspectRatio);
  });

  onMount(() => {
    const element = document.getElementById(elementId);
    if (element == undefined)
      throw `useAspectRatio: element id=${elementId} nullish on mount`;
    observer.observe(element);
  });
  onCleanup(() => observer?.disconnect());
  return info;
};
