export const Sidebar = () => {
  return (
    <aside class="w-[20vw] min-w-[200px] px-6 py-2">
      <h2>Mandelbrot fractal</h2>
      <label class="form-control w-full max-w-xs">
        <div class="label">
          <span class="label-text">What is your name?</span>
          <span class="label-text-alt">Top Right label</span>
        </div>
        <input
          type="number"
          placeholder="Type here"
          class="input input-bordered w-full max-w-xs"
        />
      </label>
      <label class="form-control w-full max-w-xs">
        <div class="label">
          <span class="label-text">What is your name?</span>
          <span class="label-text-alt">Top Right label</span>
        </div>
        <input
          type="text"
          placeholder="Type here"
          class="input input-bordered w-full max-w-xs"
        />
      </label>
    </aside>
  );
};
