"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import Link from "next/link";

export type GraphNode = {
  id: string;
  name: string;
  slug: string;
  type: string;          // GROUP | SOLOIST | COLLAB | MEMBER
  imageUrl: string | null;
  songCount: number;
  region: string;        // "kpop" | "western"
  nodeRole: "performer" | "producer" | "songwriter" | "mixed";
};

export type GraphLink = {
  source: string;
  target: string;
  songs: string[];
  linkType: "performance" | "production" | "mixed";
};

// ── Node colors ───────────────────────────────────────────────────────────────
const NODE_COLOR: Record<string, string> = {
  kpop_GROUP:     "#FFFF64",   // yellow
  kpop_SOLOIST:   "#ACFA52",   // green
  western:        "#e879f9",   // pink/magenta — western performer
  kpop_MEMBER:    "#94a3b8",   // slate blue
  kpop_COLLAB:    "#fb923c",   // orange
  producer:       "#67e8f9",   // cyan — western/LA producer
  songwriter:     "#a78bfa",   // violet — songwriter
};

function nodeColor(n: GraphNode) {
  // Production-only nodes get cyan/violet regardless of region
  if (n.nodeRole === "producer") return NODE_COLOR.producer;
  if (n.nodeRole === "songwriter") return NODE_COLOR.songwriter;
  if (n.region === "western") return NODE_COLOR.western;
  return NODE_COLOR[`kpop_${n.type}`] ?? "#e5e7eb";
}

function nodeRadius(n: GraphNode): number {
  // Producers/songwriters get slightly smaller radius (they're background figures)
  const base = (n.nodeRole === "producer" || n.nodeRole === "songwriter") ? 10 : 12;
  return Math.max(base, Math.min(36, base + n.songCount * 3.5));
}

// ── Link color + dash ─────────────────────────────────────────────────────────
function linkStroke(type: string) {
  if (type === "production") return "#a78bfa";  // violet for production/writing
  if (type === "mixed")      return "#fb923c";  // orange for mixed
  return "#FFFF64";                             // yellow for performance
}
function linkDash(type: string) {
  if (type === "production") return "6 4";
  if (type === "mixed")      return "3 3";
  return null;
}

type Tooltip = { x: number; y: number; node: GraphNode } | null;

export default function CollabNetwork({
  nodes, links, centerId,
}: {
  nodes: GraphNode[];
  links: GraphLink[];
  centerId?: string;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tooltip, setTooltip] = useState<Tooltip>(null);
  const [dims, setDims] = useState({ w: 900, h: 600 });

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

    // ── defs: arrowhead markers for production edges ──────────────────────
    const defs = svg.append("defs");

    // clip paths for photos — set up first, populated per node
    nodes.forEach((n) => {
      if (!n.imageUrl) return;
      defs.append("clipPath")
        .attr("id", `clip-${n.id}`)
        .append("circle")
        .attr("r", nodeRadius(n) - 2);
    });

    // ── zoom/pan ──────────────────────────────────────────────────────────
    const g = svg.append("g");
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 5])
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

    // Production links attract more weakly (they're background relationships)
    const sim = d3.forceSimulation(simNodes)
      .force("link", d3.forceLink(simLinks)
        .id((d: any) => d.id)
        .distance((l: any) => {
          const type = (l as GraphLink).linkType;
          const songCount = l.songs?.length ?? 1;
          if (type === "production") return Math.max(130, 220 - songCount * 10);
          return Math.max(80, 180 - songCount * 20);
        })
        .strength((l: any) => (l as GraphLink).linkType === "production" ? 0.3 : 0.6))
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(w / 2, h / 2))
      .force("collision", d3.forceCollide<any>().radius((d) => nodeRadius(d) + 8));

    // ── edges — draw production links first (underneath) ─────────────────
    const linkGroups: Record<string, typeof simLinks> = { production: [], mixed: [], performance: [] };
    for (const l of simLinks) {
      const t = (l as unknown as GraphLink).linkType;
      (linkGroups[t] ?? linkGroups.performance).push(l);
    }

    // production links (violet dashed)
    const productionLinks = g.append("g").attr("class", "links-production")
      .selectAll("line")
      .data(linkGroups.production)
      .join("line")
      .attr("stroke", "#a78bfa")
      .attr("stroke-opacity", 0.5)
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "6 4");

    // mixed links (orange dashed)
    const mixedLinks = g.append("g").attr("class", "links-mixed")
      .selectAll("line")
      .data(linkGroups.mixed)
      .join("line")
      .attr("stroke", "#fb923c")
      .attr("stroke-opacity", 0.5)
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "3 3");

    // performance links (yellow solid)
    const perfLinks = g.append("g").attr("class", "links-performance")
      .selectAll("line")
      .data(linkGroups.performance)
      .join("line")
      .attr("stroke", "#FFFF64")
      .attr("stroke-opacity", 0.35)
      .attr("stroke-width", (d: any) => Math.min(4, 1 + ((d as any).songs?.length ?? 1)));

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

    // glow ring for center
    nodeSel.filter((d) => d.id === centerId)
      .append("circle")
      .attr("r", (d) => nodeRadius(d) + 10)
      .attr("fill", "none")
      .attr("stroke", "#FFFF64")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "4 4")
      .attr("opacity", 0.6);

    // producers/songwriters get a subtle outer ring to distinguish them
    nodeSel.filter((d) => d.nodeRole === "producer" || d.nodeRole === "songwriter")
      .append("circle")
      .attr("r", (d) => nodeRadius(d) + 5)
      .attr("fill", "none")
      .attr("stroke", (d) => d.nodeRole === "producer" ? "#67e8f9" : "#a78bfa")
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3 2")
      .attr("opacity", 0.7);

    // main fill circle
    nodeSel.append("circle")
      .attr("r", (d) => nodeRadius(d))
      .attr("fill", (d) => nodeColor(d))
      .attr("stroke", "#000")
      .attr("stroke-width", 1.5);

    // photo overlay
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

    // role icon for producers/songwriters without photos
    nodeSel.filter((d) => !d.imageUrl && (d.nodeRole === "producer" || d.nodeRole === "songwriter"))
      .append("text")
      .text((d) => d.nodeRole === "producer" ? "🎚" : "✍")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("font-size", (d) => nodeRadius(d) * 0.85);

    // name label
    nodeSel.append("text")
      .text((d) => d.name)
      .attr("text-anchor", "middle")
      .attr("dy", (d) => nodeRadius(d) + 13)
      .attr("font-size", (d) => (d.id === centerId ? 12 : d.nodeRole === "producer" || d.nodeRole === "songwriter" ? 9 : 10))
      .attr("font-weight", (d) => (d.id === centerId ? 800 : 600))
      .attr("fill", "#fff")
      .attr("paint-order", "stroke")
      .attr("stroke", "#000")
      .attr("stroke-width", 3);

    // hover
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
      .on("mouseleave", function () {
        d3.select(this).select("circle").attr("stroke", "#000").attr("stroke-width", 1.5);
        setTooltip(null);
      })
      .on("click", function (_, d) {
        window.location.href = `/artists/${d.slug}`;
      });

    // ── tick ──────────────────────────────────────────────────────────────
    sim.on("tick", () => {
      function tickLinks(sel: d3.Selection<SVGLineElement, any, SVGGElement, unknown>) {
        sel
          .attr("x1", (d: any) => d.source.x)
          .attr("y1", (d: any) => d.source.y)
          .attr("x2", (d: any) => d.target.x)
          .attr("y2", (d: any) => d.target.y);
      }
      tickLinks(productionLinks as any);
      tickLinks(mixedLinks as any);
      tickLinks(perfLinks as any);
      nodeSel.attr("transform", (d: any) => `translate(${d.x},${d.y})`);
    });

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
      <div style={{ position: "absolute", top: 12, left: 12, display: "flex", flexDirection: "column", gap: 5 }}>
        <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 2 }}>Nodes</div>
        {[
          { color: NODE_COLOR.kpop_GROUP,    label: "K-pop Group" },
          { color: NODE_COLOR.kpop_SOLOIST,  label: "K-pop Soloist" },
          { color: NODE_COLOR.western,       label: "Western Performer" },
          { color: NODE_COLOR.kpop_MEMBER,   label: "Group Member" },
          { color: NODE_COLOR.producer,      label: "Producer" },
          { color: NODE_COLOR.songwriter,    label: "Songwriter" },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: "50%", background: color, border: "1px solid rgba(255,255,255,0.3)", flexShrink: 0 }} />
            <span style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>{label}</span>
          </div>
        ))}
        <div style={{ fontSize: "0.6rem", color: "rgba(255,255,255,0.35)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 8, marginBottom: 2 }}>Links</div>
        {[
          { color: "#FFFF64", dash: false,  label: "Performance / Feature" },
          { color: "#a78bfa", dash: true,   label: "Production / Writing" },
          { color: "#fb923c", dash: true,   label: "Mixed (both)" },
        ].map(({ color, dash, label }) => (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <svg width="20" height="6" style={{ flexShrink: 0 }}>
              <line
                x1="0" y1="3" x2="20" y2="3"
                stroke={color}
                strokeWidth="2"
                strokeDasharray={dash ? "4 3" : undefined}
                strokeOpacity="0.9"
              />
            </svg>
            <span style={{ fontSize: "0.62rem", color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div style={{ position: "absolute", bottom: 10, right: 12, fontSize: "0.62rem", color: "rgba(255,255,255,0.3)", textAlign: "right" }}>
        Scroll to zoom · Drag to pan · Click to visit artist
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div style={{
          position: "absolute",
          top: Math.min(tooltip.y + 12, dims.h - 120),
          left: Math.min(tooltip.x + 12, dims.w - 200),
          background: "rgba(0,0,0,0.92)",
          border: `1px solid ${nodeColor(tooltip.node)}`,
          borderRadius: 6,
          padding: "10px 14px",
          pointerEvents: "none",
          zIndex: 10,
          maxWidth: 200,
        }}>
          <div style={{ fontWeight: 800, color: "#fff", fontSize: "0.88rem" }}>{tooltip.node.name}</div>
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.72rem", marginTop: 2 }}>
            {tooltip.node.nodeRole === "producer"
              ? "🎚 Producer"
              : tooltip.node.nodeRole === "songwriter"
              ? "✍ Songwriter"
              : tooltip.node.nodeRole === "mixed"
              ? "🎤 + ✍ Performer & Writer"
              : tooltip.node.region === "western"
              ? "Western Artist"
              : tooltip.node.type}
          </div>
          <div style={{ color: nodeColor(tooltip.node), fontSize: "0.72rem", marginTop: 3 }}>
            {tooltip.node.songCount} credited song{tooltip.node.songCount !== 1 ? "s" : ""}
          </div>
        </div>
      )}
    </div>
  );
}
