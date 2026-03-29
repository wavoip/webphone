import { formatIncompletePhoneNumber } from "libphonenumber-js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export const KeyboardInput = ({ value, onChange }: any) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const measureRef = useRef<HTMLInputElement>(null);

    const MAX_FONT = 30;
    const MIN_FONT = 20;
    const TARGET_DIFF = -32;

    const [showEllipsisLeft, setShowEllipsisLeft] = useState(false);
    const [showEllipsisRight, setShowEllipsisRight] = useState(false);

    const valueParsed = useMemo(() => {
        return formatIncompletePhoneNumber(value, "BR");
    }, [value]);
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

    const resizeInput = useCallback(() => {
        const container = containerRef.current;
        const input = inputRef.current;
        const measure = measureRef.current;

        if (!container || !input || !measure || !valueParsed) return;

        const containerWidth = container.clientWidth;

        let fontSize = parseInt(input.style.fontSize, 10) || MAX_FONT;

        // garante que o span começa sincronizado
        measure.style.fontFamily = getComputedStyle(input).fontFamily;
        measure.style.letterSpacing = getComputedStyle(input).letterSpacing;

        const diffFor = (size: number) => {
            measure.style.fontSize = `${size}px`;
            return measure.scrollWidth - containerWidth;
        };

        // 🔽 Texto grande demais → diminui
        while (diffFor(fontSize) > TARGET_DIFF && fontSize > MIN_FONT) {
            fontSize--;
        }

        // 🔼 Texto pequeno demais → aumenta
        while (diffFor(fontSize + 1) <= TARGET_DIFF && fontSize < MAX_FONT) {
            fontSize++;
        }

        input.style.fontSize = `${fontSize}px`;
    }, [valueParsed]);

    const handleScroll = useCallback(() => {
        const input = inputRef.current;
        if (!input) return;

        const maxScroll = input.scrollWidth - input.clientWidth - input.scrollLeft;

        console.log("input.maxScroll", maxScroll, input.scrollWidth, input.clientWidth, input.scrollLeft);

        setShowEllipsisLeft(input.scrollLeft > 10);
        setShowEllipsisRight(maxScroll > 10);
    }, []);

    useEffect(() => {
        if (valueParsed) {
            resizeInput();
        }
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
                <span
                    className={`wv:absolute wv:left-2 wv:top-1/2 wv:-translate-y-1/2 wv:pointer-events-none wv:font-semibold wv:transition-opacity
      ${showEllipsisLeft ? "wv:opacity-100" : "wv:opacity-0"}
    `}
                >
                    ...
                </span>
                <input
                    ref={inputRef}
                    type="text"
                    value={valueParsed}
                    onChange={onChange}
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
