export function addLabelBackgrounds(svg: SVGSVGElement) {
  svg.querySelectorAll<SVGGElement>(".hill-chart-group").forEach(g => {
    const text = g.querySelector("text");
    if (!text) return;

    const bbox = text.getBBox();

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", String(bbox.x - 4));
    rect.setAttribute("y", String(bbox.y - 2));
    rect.setAttribute("width", String(bbox.width + 20));
    rect.setAttribute("height", String(bbox.height + 4));
    rect.setAttribute("rx", "3");
    rect.classList.add("hill-label-bg");

    g.insertBefore(rect, text);
  });
}

  


export function bringHoveredGroupToFront(
  svg: SVGSVGElement
): () => void {
  const onMouseOver = (e: Event) => {
    const g = (e.target as Element)?.closest<SVGGElement>(".hill-chart-group");
    if (!g) return;
    const parent = g.parentNode;
    if (parent) parent.appendChild(g);
  };

  svg.addEventListener("mouseover", onMouseOver);
  return () => svg.removeEventListener("mouseover", onMouseOver);
}
