"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { useLang } from "@/components/LangProvider";

export type GraphNode = {
  id: string;
  name: string;
  slug: string;
  type: string;       // GROUP | SOLOIST | COLLAB | MEMBER
  imageUrl: string | null;
  songCount: number;
  region: string;     // "kpop" | "western"
};

export type GraphLink = {
  source: string;
  target: string;
  songs: string[];
};

const NODE_COLOR: Record<string, string> = {
  kpop_GROUP:    "#FFFF64",
  kpop_SOLOIST:  "#ACFA52",
  western:       "#e879f9",
  kpop_MEMBER:   "#94a3b8",
  kpop_COLLAB:   "#fb923c",
};

function nodeColor(n: GraphNode) {
  if (n.region === "western") return NODE_COLOR.western;
  return NODE_COLOR[`kpop_${n.type}`] ?? "#e5e7eb";
}
function nodeRadius(n: GraphNode) {
  return Math.max(14, Math.min(36, 12 + n.songCount * 3.5));
}

type Tooltip = { x: number; y: number; node: GraphNode } | null;

export default function CollabNetwork({ nodes, links, centerId }: { nodes: GraphNode[]; links: GraphLink[]; centerId?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<Tooltip>(null);
  const [dims, setDims] = useState({ w: 900, h: 600 });
  const { lang } = useLang();

  useEffect(() => {
    function measure() {
      const w = svgRef.current?.parentElement?.clientWidth ?? 900;
      setDims({ w, h: Math.max(520, Math.min(w * 0.65, 720)) });
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    if (!svgRef.current || nodes.length === 0) return;
    const { w, h } = dims;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();
    svg.attr("viewBox", `0 0 ${w} ${h}`);

    // ── zoom/pan ──────────────────────────────────────────────────────────
    const g = svg.append("g");
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.25, 4])
      .on("zoom", (event) => g.attr("transform", event.transform));
    svg.call(zoom);

    // ── simulation ────────────────────────────────────────────────────────
    const simNodes = nodes.map((n) => ({
      ...n,
      x: n.id === centerId ? w / 2 : undefined,
      y: n.id === centerId ? h / 2 : undefined,
      fx: n.id === centerId ? w / 2 : null,
      fy: n.id === centerId ? h / 2 : null,
    })) as (GraphNode & d3.SimulationNodeDatum & { fx: number | null; fy: number | null })[];

    const simLinks = links.map((l) => ({ ...l })) as (GraphLink & d3.SimulationLinkDatum<(typeof simNodes)[0]>)[];

    const sim = d3.forceSimulation(simNodes)
      .force("link", d3.forceLink(simLinks)
        .id((d: any) => d.id)
        .distance((l: any) => {
          const songCount = (l.songs?.length ?? 1);
          return Math.max(90, 180 - songCount * 20);
        })
        .strength(0.6))
      .force("charge", d3.forceManyBody().strength(-320))
      .force("center", d3.forceCenter(w / 2, h / 2))
      .force("collision", d3.forceCollide<any>().radius((d) => nodeRadius(d) + 8));

    // ── edges ─────────────────────────────────────────────────────────────
    const linkSel = g.append("g").attr("class", "links")
      .selectAll("line")
      .data(simLinks)
      .join("line")
      .attr("stroke", "#FFFF64")
      .attr("stroke-opacity", 0.35)
      .attr("stroke-width", (d: any) => Math.min(4, 1 + (d.songs?.length ?? 1)));

    // ── node groups ───────────────────────────────────────────────────────
    const nodeSel = g.append("g").attr("class", "nodes")
      .selectAll("g")
      .data(simNodes)
      .join("g")
      .attr("cursor", "pointer")
      .call(
        d3.drag<SVGGElement, (typeof simNodes)[0]>()
          .on("start", (event, d) => {
            if (!event.active) sim.alphaTarget(0.3).restart();
            if (d.id !== centerId) { d.fx = d.x ?? null; d.fy = d.y ?? null; }
          })
          .on("drag", (event, d) => {
            if (d.id !== centerId) { d.fx = event.x; d.fy = event.y; }
          })
          .on("end", (event, d) => {
            if (!event.active) sim.alphaTarget(0);
            if (d.id !== centerId) { d.fx = null; d.fy = null; }
          }) as any
      );

    // outer glow ring for center node
    nodeSel.filter((d) => d.id === centerId)
      .append("circle")
      .attr("r", (d) => nodeRadius(d) + 10)
      .attr("fill", "none")
      .attr("stroke", "#FFFF64")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "4 4")
      .attr("opacity", 0.6);

    // fill circle
    nodeSel.append("circle")
      .attr("r", (d) => nodeRadius(d))
      .attr("fill", (d) => nodeColor(d))
      .attr("stroke", "#000")
      .attr("stroke-width", 1.5);

    // clip circle for photo
    const defs = svg.append("defs");
    simNodes.forEach((n) => {
      if (!n.imageUrl) return;
      defs.append("clipPath").attr("id", `clip-${n.id}`)
        .append("circle").attr("r", nodeRadius(n) - 2);
    });

    // photo
    nodeSel.filter((d) => !!d.imageUrl)
      .append("image")
      .attr("href", (d) => d.imageUrl!)
      .attr("width", (d) => (nodeRadius(d) - 2) * 2)
      .attr("height", (d) => (nodeRadius(d) - 2) * 2)
      .attr("x", (d) => -(nodeRadius(d) - 2))
      .attr("y", (d) => -(nodeRadius(d) - 2))
      .attr("clip-path", (d) => `url(#clip-${d.id})`)
      .attr("preserveAspectRatio", "xMidYMid slice")
      .attr("opacity", 0.88);

    // label
    nodeSel.append("text")
      .text((d) => d.name)
      .attr("text-anchor", "middle")
      .attr("dy", (d) => nodeRadius(d) + 13)
      .attr("font-size", (d) => (d.id === centerId ? 12 : 10))
      .attr("font-weight", (d) => (d.id === centerId ? 800 : 600))
      .attr("fill", "#fff")
      .attr("paint-order", "stroke")
      .attr("stroke", "#000")
      .attr("stroke-width", 3);

    // hover interactions
    nodeSel
      .on("mouseenter", function (event, d) {
        d3.select(this).select("circle").attr("stroke", "#FFFF64").attr("stroke-width", 3);
        const rect = svgRef.current!.getBoundingClientRect();
        setTooltip({ x: event.clientX - rect.left, y: event.clientY - rect.top, node: d });
      })
      .on("mousemove", function (event) {
        const rect = svgRef.current!.getBoundingClientRect();
        setTooltip((t) => t ? { ...t, x: event.clientX - rect.left, y: event.clientY - rect.top } : null);
      })
      .on("mouseleave", function (event, d) {
        d3.select(this).select("circle")
          .attr("stroke", "#000")
          .attr("stroke-width", 1.5);
        setTooltip(null);
      })
      .on("click", function (event, d) {
        window.location.href = `/artists/${d.slug}`;
      });

    // ── tick ──────────────────────────────────────────────────────────────
    sim.on("tick", () => {
      linkSel
        .attr("x1", (d: any) => d.source.x)
        .attr("y1", (d: any) => d.source.y)
        .attr("x2", (d: any) => d.target.x)
        .attr("y2", (d: any) => d.target.y);
      nodeSel.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

    // Release center pin after 1.5s so it can drift naturally
    if (centerId) {
      setTimeout(() => {
        const cn = simNodes.find((n) => n.id === centerId);
        if (cn) { cn.fx = null; cn.fy = null; }
        sim.alpha(0.1).restart();
      }, 1500);
    }

    return () => { sim.stop(); };
  }, [nodes, links, centerId, dims]);

  return (
    <div style={{ position: "relative", background: "#0a0a12", borderRadius: 8, overflow: "hidden", border: "1px solid #1e1e3a" }}>
      <svg ref={svgRef} width="100%" height={dims.h} style={{ display: "block" }} />

      {/* Legend */}
      <div style={{ position: "absolute", top: 12, left: 12, display: "flex", flexDirection: "column", gap: 6 }}>
        {[
          { color: NODE_COLOR.kpop_GROUP, en: "K-pop Group", es: "Grupo de K-pop" },
          { color: NODE_COLOR.kpop_SOLOIST, en: "K-pop Soloist", es: "Solista de K-pop" },
          { color: NODE_COLOR.western, en: "Western Artist", es: "Artista Occidental" },
          { color: NODE_COLOR.kpop_COLLAB, en: "Collaborator", es: "Colaborador" },
        ].map(({ color, en, es }) => (
          <div key={en} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, border: "1px solid rgba(255,255,255,0.3)", flexShrink: 0 }} />
            <span style={{ fontSize: "0.65rem", color: "rgba(255,255,255,0.6)", fontWeight: 600, letterSpacing: "0.04em" }}>
              {lang === "es" ? es : en}
            </span>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div style={{ position: "absolute", bottom: 10, right: 12, fontSize: "0.62rem", color: "rgba(255,255,255,0.35)", textAlign: "right" }}>
        {lang === "es"
          ? "Desplázate para hacer zoom · Arrastra para mover · Haz clic en un artista para ver su página"
          : "Scroll to zoom · Drag to pan · Click artist to visit page"}
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position: "absolute", top: tooltip.y + 12, left: tooltip.x + 12,
          background: "rgba(0,0,0,0.9)", border: "1px solid #FFFF64",
          borderRadius: 6, padding: "8px 12px", pointerEvents: "none", zIndex: 10,
          maxWidth: 180,
        }}>
          <div style={{ fontWeight: 800, color: "#fff", fontSize: "0.85rem" }}>{tooltip.node.name}</div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.72rem", marginTop: 2 }}>
            {tooltip.node.region === "western"
              ? (lang === "es" ? "Artista Occidental" : "Western Artist")
              : tooltip.node.type}
          </div>
          <div style={{ color: "#FFFF64", fontSize: "0.72rem", marginTop: 2 }}>
            {lang === "es"
              ? `${tooltip.node.songCount} ${tooltip.node.songCount === 1 ? "canción acreditada" : "canciones acreditadas"}`
              : `${tooltip.node.songCount} credited song${tooltip.node.songCount !== 1 ? "s" : ""}`}
          </div>
        </div>
      )}
    </div>
  );
}
