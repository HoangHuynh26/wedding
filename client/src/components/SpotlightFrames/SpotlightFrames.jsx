"use client";

/**
 * Spotlight Frames — Originkit
 * Ported to Framer Motion + React JSX for luxury wedding presentation.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

const DEFAULT_IMAGES = [
    { image: "/groom.jpg", offsetY: 0, title: "Chú Rể Đình Huy" },
    { image: "/bride.jpg", offsetY: 0, title: "Cô Dâu Thu Hiền" },
    { image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80", offsetY: 0, title: "Khoảnh Khắc Bình Yên" },
    { image: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80", offsetY: 0, title: "Lời Hẹn Ước" },
    { image: "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80", offsetY: 0, title: "Tình Yêu Nở Hoa" },
    { image: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80", offsetY: 0, title: "Ánh Nhìn Ngọt Ngào" },
    { image: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80", offsetY: 0, title: "Chuyến Đi Kỷ Niệm" },
    { image: "https://images.unsplash.com/photo-1591604466107-ec97de577aff?auto=format&fit=crop&w=1200&q=80", offsetY: 0, title: "Vũ Điệu Hạnh Phúc" },
    { image: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=1200&q=80", offsetY: 0, title: "Hẹn Hò & Gắn Kết" },
    { image: "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&w=1200&q=80", offsetY: 0, title: "Lần Đầu Gặp Gỡ" },
];

const DEFAULT_BACKGROUND = "transparent";
const DEFAULT_PANELS = 10;
const DEFAULT_START_INDEX = 2;

const DEFAULT_TRACK = {
    collapsedWidth: 70,
    expandedWidth: 420,
    gap: 4,
};

const DEFAULT_PANEL = {
    height: 440,
    radius: 8,
    dim: 2.5,
};

const DEFAULT_SELECTOR = {
    box: true,
    lines: true,
    lineLength: 400,
    thickness: 2,
    color: "#64748b",
};

const DEFAULT_ENTRANCE = {
    animate: true,
    duration: 0.9,
    stagger: 0.04,
};

const DEFAULT_TRIGGER = "auto";

const DEFAULT_TRANSITION = {
    type: "tween",
    stiffness: 800,
    damping: 60,
    mass: 1,
    duration: 1,
    ease: [0.075, 0.82, 0.165, 1],
};

const ENTRANCE_EASE = [0.16, 1, 0.3, 1];
const DIM_TRANSITION = "filter 600ms cubic-bezier(0.075, 0.82, 0.165, 1)";
const DIM_FLOOR = 0.22;

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function resolveSrc(item) {
    if (!item) return null;
    if (typeof item === "string") return item || null;
    const src = item.src || item.image;
    return typeof src === "string" && src ? src : null;
}

function imageOf(item) {
    if (!item || typeof item === "string") return resolveSrc(item);
    if ("image" in item) return resolveSrc(item.image);
    return resolveSrc(item);
}

function offsetOf(item) {
    if (!item || typeof item === "string") return 0;
    const offset = item.offsetY;
    return typeof offset === "number" ? offset : 0;
}

function placeholderFill(index) {
    const hue = (index * 43 + 196) % 360;
    return `linear-gradient(160deg, hsl(${hue} 42% 34%), hsl(${(hue + 38) % 360} 58% 9%))`;
}

export default function SpotlightFrames(props) {
    const {
        images = DEFAULT_IMAGES,
        background = DEFAULT_BACKGROUND,
        panels = DEFAULT_PANELS,
        startIndex = DEFAULT_START_INDEX,
        track,
        panel,
        selector,
        entrance,
        trigger = DEFAULT_TRIGGER,
        transition = DEFAULT_TRANSITION,
        style,
        onActiveChange,
        onCardClick,
    } = props;

    const trackOpts = { ...DEFAULT_TRACK, ...track };
    const panelOpts = { ...DEFAULT_PANEL, ...panel };
    const selectorOpts = { ...DEFAULT_SELECTOR, ...selector };
    const entranceOpts = { ...DEFAULT_ENTRANCE, ...entrance };

    /* ---- source list: the supplied images, or placeholders when empty */
    const sources = useMemo(() => {
        const supplied = (images ?? [])
            .map((item, idx) => ({
                src: imageOf(item),
                offsetY: offsetOf(item),
                raw: item,
                index: idx,
            }))
            .filter((item) => item.src !== null);
        if (supplied.length > 0) return supplied;
        return Array.from({ length: Math.max(1, Math.round(panels)) }, (_, idx) => ({
            src: null,
            offsetY: 0,
            raw: null,
            index: idx,
        }));
    }, [images, panels]);

    const count = sources.length;

    /* ---- measurement */
    const frameRef = useRef(null);
    const [frame, setFrame] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const node = frameRef.current;
        if (!node || typeof ResizeObserver === "undefined") return;
        const observer = new ResizeObserver(([entry]) => {
            const box = entry.contentRect;
            setFrame({ width: box.width, height: box.height });
        });
        observer.observe(node);
        return () => observer.disconnect();
    }, []);

    /* ---- how the strip is opened */
    const [canHover, setCanHover] = useState(true);

    useEffect(() => {
        if (trigger !== "auto") return;
        if (typeof window === "undefined" || !window.matchMedia) return;
        const query = window.matchMedia("(hover: hover) and (pointer: fine)");
        const read = () => setCanHover(query.matches);
        read();
        query.addEventListener("change", read);
        return () => query.removeEventListener("change", read);
    }, [trigger]);

    const opensOnHover = trigger === "hover" || (trigger === "auto" && canHover);

    /* ---- selection */
    const [focused, setFocused] = useState(() =>
        clamp(Math.round(startIndex), 0, count - 1)
    );

    useEffect(() => {
        setFocused(clamp(Math.round(startIndex), 0, count - 1));
    }, [startIndex, count]);

    const focusPanel = useCallback(
        (index) => {
            setFocused(index);
            if (onActiveChange) {
                onActiveChange(index, sources[index]);
            }
        },
        [onActiveChange, sources]
    );

    const panelNodes = useRef([]);

    const onPanelKeyDown = useCallback(
        (event, index) => {
            const step =
                event.key === "ArrowRight"
                    ? 1
                    : event.key === "ArrowLeft"
                      ? -1
                      : 0;
            if (step === 0) return;
            event.preventDefault();
            const next = clamp(index + step, 0, count - 1);
            focusPanel(next);
            panelNodes.current[next]?.focus();
        },
        [count, focusPanel]
    );

    /* ---- geometry */
    const naturalWidth =
        (count - 1) * (trackOpts.collapsedWidth + trackOpts.gap) +
        trackOpts.expandedWidth;

    const scale =
        frame.width > 0 && naturalWidth > frame.width
            ? frame.width / naturalWidth
            : 1;

    const collapsedWidth = trackOpts.collapsedWidth * scale;
    const expandedWidth = trackOpts.expandedWidth * scale;
    const gap = trackOpts.gap * scale;

    const panelHeight =
        frame.height > 0
            ? Math.min(panelOpts.height, frame.height)
            : panelOpts.height;

    const slots = useMemo(() => {
        const total = naturalWidth * scale;
        const out = [];
        let left = (frame.width - total) / 2;
        for (let i = 0; i < count; i++) {
            const width = i === focused ? expandedWidth : collapsedWidth;
            out.push({ left, width });
            left += width + gap;
        }
        return out;
    }, [
        count,
        focused,
        collapsedWidth,
        expandedWidth,
        gap,
        naturalWidth,
        scale,
        frame.width,
    ]);

    /* ---- selector */
    const { box, lines, lineLength, thickness, color } = selectorOpts;
    const marker = slots[clamp(focused, 0, count - 1)];
    const showSelector = (box || lines) && marker !== undefined;

    const dimAmount = clamp(panelOpts.dim, 0, 10) / 10;
    const dimmedFilter =
        dimAmount > 0
            ? `brightness(${(1 - dimAmount * (1 - DIM_FLOOR)).toFixed(3)}) contrast(0.92)`
            : "none";

    const measured = frame.width > 0;

    return (
        <div
            ref={frameRef}
            style={{
                position: "relative",
                width: "100%",
                height: "100%",
                minHeight: panelOpts.height + 80,
                overflow: "hidden",
                background,
                ...style,
            }}
        >
            <div
                style={{
                    position: "absolute",
                    top: "50%",
                    left: 0,
                    width: "100%",
                    height: panelHeight,
                    transform: "translateY(-50%)",
                }}
            >
                {measured &&
                    sources.map(({ src, offsetY, raw }, index) => {
                        const slot = slots[index];
                        const isOpen = index === focused;
                        return (
                            <motion.div
                                key={index}
                                ref={(node) => {
                                    panelNodes.current[index] = node;
                                }}
                                role="button"
                                tabIndex={0}
                                aria-label={`Frame ${index + 1} of ${count}`}
                                aria-pressed={isOpen}
                                initial={false}
                                animate={{ left: slot.left, width: slot.width }}
                                transition={transition}
                                onFocus={() => focusPanel(index)}
                                onKeyDown={(event) => onPanelKeyDown(event, index)}
                                onPointerEnter={
                                    opensOnHover ? () => focusPanel(index) : undefined
                                }
                                onClick={() => {
                                    focusPanel(index);
                                    if (onCardClick) onCardClick(index, raw);
                                }}
                                style={{
                                    position: "absolute",
                                    top: 0,
                                    height: "100%",
                                    overflow: "hidden",
                                    cursor: "pointer",
                                    borderRadius: panelOpts.radius,
                                    outlineOffset: 2,
                                    willChange: "left, width",
                                    boxShadow: isOpen
                                        ? "0 18px 40px -10px rgba(15, 23, 42, 0.25), 0 0 25px rgba(148, 163, 184, 0.4)"
                                        : "0 6px 16px rgba(15, 23, 42, 0.12)",
                                }}
                            >
                                <motion.div
                                    initial={
                                        entranceOpts.animate
                                            ? { opacity: 0, y: 28 }
                                            : false
                                    }
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        duration: entranceOpts.duration,
                                        delay: index * entranceOpts.stagger,
                                        ease: ENTRANCE_EASE,
                                    }}
                                    style={{
                                        position: "absolute",
                                        inset: 0,
                                        filter: isOpen ? "none" : dimmedFilter,
                                        transition: DIM_TRANSITION,
                                    }}
                                >
                                    {src ? (
                                        <img
                                            src={src}
                                            alt=""
                                            draggable={false}
                                            style={{
                                                position: "absolute",
                                                left: "50%",
                                                top: 0,
                                                transform: "translateX(-50%)",
                                                width: expandedWidth,
                                                height: "100%",
                                                objectFit: "cover",
                                                objectPosition: `50% calc(50% + ${
                                                    offsetY * scale
                                                }px)`,
                                                pointerEvents: "none",
                                                userSelect: "none",
                                            }}
                                        />
                                    ) : (
                                        <div
                                            style={{
                                                position: "absolute",
                                                left: "50%",
                                                top: 0,
                                                transform: "translateX(-50%)",
                                                width: expandedWidth,
                                                height: "100%",
                                                background: placeholderFill(index),
                                            }}
                                        />
                                    )}

                                    {/* Delicate subtle vignette gradient on each slat */}
                                    <div
                                        style={{
                                            position: "absolute",
                                            inset: 0,
                                            background: isOpen
                                                ? "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, transparent 35%, transparent 65%, rgba(0,0,0,0.4) 100%)"
                                                : "rgba(0,0,0,0.25)",
                                            pointerEvents: "none",
                                            transition: "background 0.5s ease",
                                        }}
                                    />
                                </motion.div>
                            </motion.div>
                        );
                    })}

                {measured && showSelector && (
                    <motion.div
                        aria-hidden
                        initial={false}
                        animate={{ left: marker.left, width: marker.width }}
                        transition={transition}
                        style={{
                            position: "absolute",
                            top: 0,
                            height: "100%",
                            border: box ? `${thickness}px solid ${color}` : "none",
                            borderRadius: panelOpts.radius,
                            pointerEvents: "none",
                            zIndex: 100,
                            willChange: "left, width",
                            boxShadow: `0 0 15px ${color}55, inset 0 0 10px ${color}33`,
                        }}
                    >
                        {lines && (
                            <>
                                <div
                                    style={{
                                        position: "absolute",
                                        left: "50%",
                                        bottom: "100%",
                                        transform: "translateX(-50%)",
                                        width: thickness,
                                        height: lineLength,
                                        background: `linear-gradient(to top, ${color}, transparent)`,
                                    }}
                                />
                                <div
                                    style={{
                                        position: "absolute",
                                        left: "50%",
                                        top: "100%",
                                        transform: "translateX(-50%)",
                                        width: thickness,
                                        height: lineLength,
                                        background: `linear-gradient(to bottom, ${color}, transparent)`,
                                    }}
                                />
                            </>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
}
