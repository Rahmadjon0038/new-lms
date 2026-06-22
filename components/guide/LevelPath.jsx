'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  getGuideIcon,
  getGuideColor,
  fallbackIconKey,
  fallbackColorKey,
} from './guideIcons';

// Yo'l (path) o'lchamlari
const STEP_X = 240; // ikki daraja orasidagi gorizontal masofa
const PAD_X = 130; // chap/o'ng bo'sh joy
const NODE = 96; // node diametri
const MIN_H = 360; // minimal balandlik (fallback)

const LevelPath = ({ levels = [], onSelect, renderActions }) => {
  const scrollRef = useRef(null);
  // drag holati: ref orqali — qayta render qilmasdan kuzatamiz
  const drag = useRef({ active: false, startX: 0, scrollLeft: 0, moved: false });
  const [viewH, setViewH] = useState(MIN_H);

  // Konteyner balandligini o'lchab, node qatorlarini markazga moslaymiz
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;
    const update = () => setViewH(el.clientHeight || MIN_H);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const amplitude = Math.min(150, Math.max(70, viewH * 0.16));
  const midY = viewH / 2;
  const rowTop = midY - amplitude - NODE / 2;
  const rowBottom = midY + amplitude - NODE / 2;

  const positions = levels.map((level, index) => ({
    level,
    index,
    x: PAD_X + index * STEP_X,
    y: index % 2 === 0 ? rowTop : rowBottom,
  }));

  const contentWidth = PAD_X * 2 + Math.max(0, levels.length - 1) * STEP_X + NODE;

  // Node markazlarini ilon izi (S-egri) chiziq bilan bog'lash
  const pathD = positions.reduce((acc, point, index) => {
    const cx = point.x + NODE / 2;
    const cy = point.y + NODE / 2;
    if (index === 0) return `M ${cx} ${cy}`;
    const prev = positions[index - 1];
    const px = prev.x + NODE / 2;
    const py = prev.y + NODE / 2;
    const midX = (px + cx) / 2;
    return `${acc} C ${midX} ${py}, ${midX} ${cy}, ${cx} ${cy}`;
  }, '');

  const stopDrag = useCallback(() => {
    drag.current.active = false;
    document.body.style.userSelect = '';
  }, []);

  const onMouseMove = useCallback((e) => {
    if (!drag.current.active || !scrollRef.current) return;
    const dx = e.pageX - drag.current.startX;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    scrollRef.current.scrollLeft = drag.current.scrollLeft - dx;
  }, []);

  useEffect(() => {
    const handleUp = () => stopDrag();
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', handleUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', handleUp);
    };
  }, [onMouseMove, stopDrag]);

  // Sichqoncha bilan orqa fonni bosib surish
  const onMouseDown = (e) => {
    if (!scrollRef.current) return;
    drag.current = {
      active: true,
      startX: e.pageX,
      scrollLeft: scrollRef.current.scrollLeft,
      moved: false,
    };
    document.body.style.userSelect = 'none';
  };

  // Trackpad/sichqoncha g'ildiragi: vertikal -> gorizontal scroll
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return undefined;
    const onWheel = (e) => {
      if (e.deltaY === 0) return;
      el.scrollLeft += e.deltaY;
      e.preventDefault();
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const handleNodeClick = (level) => {
    // Surish bo'lgan bo'lsa, bosishni e'tiborsiz qoldiramiz
    if (drag.current.moved) return;
    onSelect?.(level);
  };

  return (
    <div
      ref={scrollRef}
      onMouseDown={onMouseDown}
      className="relative h-full w-full cursor-grab overflow-x-auto overflow-y-hidden bg-transparent active:cursor-grabbing"
    >
      <div className="relative h-full" style={{ width: contentWidth }}>
        <svg width={contentWidth} height={viewH} className="pointer-events-none absolute inset-0">
          <path
            d={pathD}
            fill="none"
            stroke="#c9b18f"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray="2 18"
          />
        </svg>

        {positions.map(({ level, index, x, y }) => {
          const Icon = getGuideIcon(level.icon || fallbackIconKey(index));
          const color = getGuideColor(level.color || fallbackColorKey(index));

          return (
            <div
              key={level.id}
              className="group absolute flex flex-col items-center"
              style={{ left: x, top: y, width: NODE }}
            >
              {renderActions ? (
                <div className="absolute -top-3 right-0 z-20 flex translate-x-1/2 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                  {renderActions(level)}
                </div>
              ) : null}

              <button
                type="button"
                onClick={() => handleNodeClick(level)}
                className="relative flex items-center justify-center rounded-full text-white shadow-lg transition-transform duration-150 hover:scale-105 active:scale-95"
                style={{
                  width: NODE,
                  height: NODE,
                  backgroundColor: color,
                  boxShadow: `0 8px 0 0 ${color}55, 0 10px 18px rgba(0,0,0,0.18)`,
                }}
                title={level.title || 'Level'}
              >
                <span className="absolute inset-1 rounded-full border-4 border-white/45" aria-hidden />
                <Icon className="relative h-10 w-10" strokeWidth={2.4} />
                <span
                  className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-extrabold shadow-md"
                  style={{ color }}
                >
                  {index + 1}
                </span>
              </button>

              <div className="mt-4 max-w-[150px] rounded-xl bg-white px-3 py-2 text-center shadow-md">
                <p className="line-clamp-2 text-sm font-bold text-gray-800">
                  {level.title || 'Untitled'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LevelPath;
