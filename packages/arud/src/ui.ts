// packages/arud/src/ui.ts
import { type Syllable } from "./syllable";
import { scanHemistich as scan } from "./scan";
import { METERS } from "./meters";

export interface MountOptions {
  onScan?: (r: ReturnType<typeof scan>) => void;
}

export function mount(container: HTMLElement, _opts: MountOptions = {}): { destroy: () => void } {
  const doc = container.ownerDocument || document;

  const wrapper = doc.createElement("div");
  wrapper.className = "arud-root";
  wrapper.dir = "rtl";
  wrapper.style.fontFamily = "Vazirmatn, Tahoma, sans-serif";

  const title = doc.createElement("h2");
  title.textContent = "تقطیع";
  wrapper.appendChild(title);

  const textarea = doc.createElement("textarea");
  textarea.rows = 3;
  textarea.style.width = "100%";
  textarea.placeholder = "مصرع را اینجا بنویسید";
  wrapper.appendChild(textarea);

  const btn = doc.createElement("button");
  btn.textContent = "تقطیع";
  wrapper.appendChild(btn);

  const out = doc.createElement("div");
  out.className = "arud-out";
  wrapper.appendChild(out);

  const render = () => {
    const text = textarea.value.trim();
    if (!text) {
      out.textContent = "";
      return;
    }
    const r = scan(text);
    out.innerHTML = "";
    const meterLine = doc.createElement("p");
    meterLine.textContent = r.meter
      ? `بحر: ${r.meter} (اطمینان ${Math.round(r.confidence * 100)}٪)`
      : `نامطمئن (اطمینان ${Math.round(r.confidence * 100)}٪)`;
    out.appendChild(meterLine);

    const table = doc.createElement("table");
    const tr = doc.createElement("tr");
    for (const s of r.syllables) {
      const td = doc.createElement("td");
      td.textContent = `${s.text} (${s.weight})`;
      td.style.cursor = "pointer";
      td.addEventListener("click", () => {
        // toggle weight
        const cur = s.weight;
        s.weight = cur === "L" ? "S" : cur === "S" ? "X" : "L";
        render();
      });
      tr.appendChild(td);
    }
    table.appendChild(tr);
    out.appendChild(table);

    if (r.candidates && r.candidates.length > 0) {
      const c = doc.createElement("p");
      c.textContent = "کاندیدا: " + r.candidates.map((x) => `${x.meter} ${Math.round(x.score * 100)}٪`).join("، ");
      out.appendChild(c);
    }
  };

  btn.addEventListener("click", render);
  textarea.addEventListener("keydown", (e: any) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) render();
  });

  // compare-two mode
  const compareBtn = doc.createElement("button");
  compareBtn.textContent = "مقایسهٔ دو مصرع";
  wrapper.appendChild(compareBtn);
  const compareBox = doc.createElement("div");
  compareBox.style.display = "none";
  const t2 = doc.createElement("textarea");
  t2.rows = 2;
  t2.style.width = "100%";
  compareBox.appendChild(t2);
  wrapper.appendChild(compareBox);
  compareBtn.addEventListener("click", () => {
    compareBox.style.display = compareBox.style.display === "none" ? "block" : "none";
  });

  // print view
  const printBtn = doc.createElement("button");
  printBtn.textContent = "چاپ";
  printBtn.addEventListener("click", () => {
    if (typeof (window as any).print === "function") (window as any).print();
  });
  wrapper.appendChild(printBtn);

  // footer (H7)
  const footer = doc.createElement("p");
  footer.style.fontSize = "0.8rem";
  footer.style.opacity = "0.7";
  footer.textContent = "دقت این ابزار: گزارش نشده — consistency و coverage در eval چاپ می‌شوند.";
  wrapper.appendChild(footer);

  container.appendChild(wrapper);

  return {
    destroy: () => {
      if (wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
    },
  };
}
