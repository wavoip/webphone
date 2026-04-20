import { formatIncompletePhoneNumber } from "libphonenumber-js";
import type { CountryCode } from "libphonenumber-js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export const KeyboardInput = ({ value, onChange, callIsLoading, country }: { value: string; onChange: (e: any) => void; callIsLoading: boolean; country?: string | null }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const measureRef = useRef<HTMLInputElement>(null);

    const MAX_FONT = 30;
    const MIN_FONT = 20;

    const [showEllipsisLeft, setShowEllipsisLeft] = useState(false);
    const [showEllipsisRight, setShowEllipsisRight] = useState(false);

    const valueParsed = useMemo(() => {
        return formatIncompletePhoneNumber(value, (country as CountryCode) ?? "BR");
    }, [value, country]);
    // useEffect(() => {
    //     const container = containerRef.current;
    //     const input = inputRef.current;

    //     if (!container || !input) return;

    //     const containerWidth = container.clientWidth;

    //     let size = MIN_FONT;

    //     input.style.fontSize = `${size}px`;

    //     // força o browser a recalcular layout
    //     input.getBoundingClientRect();

    //     while (input.scrollWidth < containerWidth && size < MAX_FONT) {
    //         console.log("INDO", containerWidth, input.scrollWidth, size);
    //         size += 1;
    //         input.style.fontSize = `${size}px`;
    //     }

    //     console.log("acabou", containerWidth, input.scrollWidth, size);
    //     setFontSize(size);

    //     // mantém sempre o final visível
    //     container.scrollLeft = container.scrollWidth;
    // }, [valueParsed, inputRef]);

    const handleScroll = useCallback(() => {
        const input = inputRef.current;
        if (!input) return;

        const maxScroll = input.scrollWidth - input.clientWidth - input.scrollLeft;

        setShowEllipsisLeft(input.scrollLeft > 10);
        setShowEllipsisRight(maxScroll > 10);
    }, []);

    const resizeInput = useCallback(() => {
        const container = containerRef.current;
        const input = inputRef.current;
        const measure = measureRef.current;

        if (!container || !input || !measure) return;

        if (!valueParsed) {
            input.style.fontSize = `${MAX_FONT}px`;
            setShowEllipsisLeft(false);
            setShowEllipsisRight(false);
            return;
        }

        const computed = getComputedStyle(input);
        const containerComputed = getComputedStyle(container);

        measure.style.fontFamily = computed.fontFamily;
        measure.style.letterSpacing = computed.letterSpacing;
        measure.style.fontWeight = computed.fontWeight;

        const containerWidth = container.clientWidth;
        const containerPadding =
            parseFloat(containerComputed.paddingLeft) + parseFloat(containerComputed.paddingRight);
        const inputPadding =
            parseFloat(computed.paddingLeft) + parseFloat(computed.paddingRight);
        const availableWidth = containerWidth - containerPadding - inputPadding;

        let fontSize = MAX_FONT;
        measure.style.fontSize = `${fontSize}px`;

        while (measure.scrollWidth > availableWidth && fontSize > MIN_FONT) {
            fontSize--;
            measure.style.fontSize = `${fontSize}px`;
        }

        input.style.fontSize = `${fontSize}px`;

        requestAnimationFrame(() => {
            if (inputRef.current) {
                inputRef.current.scrollLeft = inputRef.current.scrollWidth;
                handleScroll();
            }
        });
    }, [valueParsed, handleScroll]);

    useEffect(() => {
        resizeInput();
    }, [valueParsed, resizeInput]);

    // useEffect(() => {
    //     const container = containerRef.current;
    //     const input = inputRef.current;

    //     if (!container || !input) return;

    //     const containerWidth = container.clientWidth;
    //     const diff = input.scrollWidth - containerWidth;
    //     resizeInput();
    //     if (diff === -32) {
    //         let fontSize = parseInt(input.style.fontSize, 10);

    //         if (isNaN(fontSize)) {
    //             fontSize = MAX_FONT
    //         }
    //         if (fontSize < MAX_FONT) {
    //             input.style.fontSize = `${fontSize + 1}px`;
    //         }
    //         console.log(diff, "aumentar")
    //     }

    // }, [valueParsed]);

    return (
        <div className="wv:flex wv:flex-col wv:items-center wv:w-full wv:max-w-md wv:mx-auto">
            <div
                ref={containerRef}
                className="wv:relative wv:w-full wv:overflow-x-auto wv:overflow-y-hidden wv:whitespace-nowrap wv:scrollbar-hide wv:py-2 wv:px-4 wv:flex wv:items-center wv:justify-center no-number-scroll"
                style={{
                    msOverflowStyle: "none",
                    scrollbarWidth: "none",
                    WebkitOverflowScrolling: "touch",
                    width: "200px",
                }}
            >

                {!callIsLoading && (
                    <span
                        className={`wv:absolute wv:left-2 wv:top-1/2 wv:-translate-y-1/2 wv:pointer-events-none wv:font-semibold wv:transition-opacity
      ${showEllipsisLeft ? "wv:opacity-100" : "wv:opacity-0"}
    `}
                    >
                        ...
                    </span>
                )}
                {callIsLoading && (
                    <div className="wv:flex  wv:mr-2">
                        <div className="wv:h-[12px] wv:w-[12px] wv:animate-spin wv:rounded-full wv:border-2 wv:border-[black] wv:border-t-transparent"></div>
                    </div>
                )}
                <input
                    ref={inputRef}
                    type="text"
                    value={valueParsed}
                    onChange={onChange}
                    onKeyDown={(e) => {
                        if (e.key === "Backspace" || e.key === "Delete") {
                            e.preventDefault();
                            const input = e.currentTarget;
                            const start = input.selectionStart ?? 0;
                            const end = input.selectionEnd ?? 0;
                            const formatted = input.value;

                            // mapa: índice no texto formatado → índice no value bruto
                            const map: (number | null)[] = [];
                            let digitIndex = 0;
                            for (let i = 0; i < formatted.length; i++) {
                                if (/[\d*#+]/.test(formatted[i])) {
                                    map.push(digitIndex++);
                                } else {
                                    map.push(null);
                                }
                            }

                            let rawStart: number;
                            let rawEnd: number;

                            if (start === end) {
                                if (e.key === "Backspace") {
                                    let i = start - 1;
                                    while (i >= 0 && map[i] === null) i--;
                                    if (i < 0) return;
                                    rawStart = map[i]!;
                                    rawEnd = rawStart + 1;
                                } else {
                                    let i = start;
                                    while (i < map.length && map[i] === null) i++;
                                    if (i >= map.length) return;
                                    rawStart = map[i]!;
                                    rawEnd = rawStart + 1;
                                }
                            } else {
                                const digits = map.slice(start, end).filter((d): d is number => d !== null);
                                if (digits.length === 0) return;
                                rawStart = digits[0];
                                rawEnd = digits[digits.length - 1] + 1;
                            }

                            onChange({ target: { value: value.slice(0, rawStart) + value.slice(rawEnd) } });
                        }
                    }}
                    onScroll={handleScroll}
                    placeholder="Digite..."
                    className="wv:pl-1 wv:bg-transparent wv:text-center wv:outline-none wv:transition-all wv:duration-150 wv:min-w-full wv:text-foreground wv:placeholder:text-muted-400"
                    style={{
                        fontSize: MAX_FONT,
                    }}
                />
                <span
                    className={`wv:absolute wv:right-2 wv:top-1/2 wv:-translate-y-1/2 wv:pointer-events-none wv:font-semibold wv:transition-opacity
      ${showEllipsisRight ? "wv:opacity-100" : "wv:opacity-0"}
    `}
                >
                    ...
                </span>
                <span ref={measureRef} className="wv:absolute wv:invisible wv:whitespace-nowrap wv:pointer-events-none">
                    {valueParsed}
                </span>
            </div>
        </div>
    );
};
