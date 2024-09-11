'use client';

import React from "react";

export interface PurePaginationProps {
    className?: string;
    currentPage: number;
    setCurrentPage: (p: number) => void;
    maxPage: number;
    color?: string;
    hoverColor?: string;
    disableColor?: string;
}

function calcNumberLen(value: number): number {
    let r = 0;
    if (value !== value || value == undefined) {
        return r;
    }
    do {
        value /= 10;
        ++r;
        if (value < 1) {
            break;
        }
    } while (true);
    return r;
}

const defaultColor = 'text-slate-500';
const defaultHoverColor = 'text-slate-700';
const defaultDisableColor = 'text-slate-300';
const baseArrowIconClassName = 'size-4';

export default function PurePagination({
    className = '',
    currentPage,
    setCurrentPage,
    maxPage,
    color = defaultColor,
    hoverColor = defaultHoverColor,
    disableColor = defaultDisableColor,
}: PurePaginationProps) {
    const [inputing, setInputing] = React.useState<boolean>(false);
    const [inputPage, setInputPage] = React.useState<string>(`${currentPage}`);
    const pageInputRef = React.useRef<HTMLInputElement>(null);
    const inputWidth = `${1 + Math.ceil(calcNumberLen(maxPage) / 2)}rem`;
    const onPageClick: React.MouseEventHandler<HTMLDivElement> = React.useCallback(() => {
        setInputPage(`${currentPage}`);
        setInputing(true);
    }, [currentPage, setInputing]);
    React.useEffect(() => {
        if (inputing) {
            pageInputRef.current?.focus();
        }
    }, [inputing, pageInputRef]);
    const onPageInputChange: React.ChangeEventHandler<HTMLInputElement> = React.useCallback((e) => {
        setInputPage(e.target.value);
    }, [setInputPage])
    const onPageInputKeyUp: React.KeyboardEventHandler<HTMLInputElement> = React.useCallback((evt) => {
        if (evt.key === 'Enter') {
            setCurrentPage(Number.parseInt(inputPage));
            setInputing(false);
        }
    }, [inputPage, setCurrentPage]);
    const onPageInputBlur: React.FocusEventHandler<HTMLInputElement> = React.useCallback(() => {
        setCurrentPage(Number.parseInt(inputPage));
        setInputing(false);
    }, [inputPage, setCurrentPage]);
    const onPageLeftClick: React.MouseEventHandler<HTMLDivElement> = React.useCallback(() => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1)
        }
    }, [currentPage, setCurrentPage]);
    const onPageMostLeftClick: React.MouseEventHandler<HTMLDivElement> = React.useCallback(() => {
        setCurrentPage(1)
    }, [setCurrentPage]);
    const onPageRightClick: React.MouseEventHandler<HTMLDivElement> = React.useCallback(() => {
        if (currentPage < maxPage) {
            setCurrentPage(currentPage + 1)
        }
    }, [currentPage, maxPage, setCurrentPage]);
    const onPageMostRightClick: React.MouseEventHandler<HTMLDivElement> = React.useCallback(() => {
        setCurrentPage(maxPage)
    }, [maxPage, setCurrentPage]);
    let leftArrowIconClassName: string;
    if (currentPage === 1) {
        leftArrowIconClassName = `${baseArrowIconClassName} ${disableColor}`;
    } else {
        leftArrowIconClassName = `${baseArrowIconClassName} ${color} hover:${hoverColor}`;
    }
    let leftArrowDivClassName = 'p-1';
    if (currentPage > 1) {
        leftArrowDivClassName = 'cursor-pointer hover:bg-slate-200 p-1 active:ring-1';
    }
    let rightArrowIconClassName: string;
    if (currentPage === maxPage) {
        rightArrowIconClassName = `${baseArrowIconClassName} ${disableColor}`;
    } else {
        rightArrowIconClassName = `${baseArrowIconClassName} ${color} hover:${hoverColor}`;
    }
    let rightArrowDivClassName = 'p-1';
    if (currentPage < maxPage) {
        rightArrowDivClassName = 'cursor-pointer hover:bg-slate-200 p-1 active:ring-1';
    }

    let pageNode: React.ReactNode;
    if (inputing) {
        pageNode = (
            <div className={`p-1 text-xs ${color}`}>
                <input
                    ref={pageInputRef}
                    style={{ width: inputWidth }}
                    type="number"
                    value={inputPage}
                    onChange={onPageInputChange}
                    max={maxPage}
                    min={1}
                    onKeyUp={onPageInputKeyUp}
                    onBlur={onPageInputBlur}
                />
                { ` / ${maxPage}` }
            </div>
        )
    } else {
        pageNode = (
            <div className={`cursor-pointer text-xs hover:bg-slate-200 ${color} hover:${hoverColor} p-1 active:ring-1 select-none font-bold`} onClick={onPageClick}> { `${currentPage} / ${maxPage}` } </div>
        );
    }
    return (
        <div className={`flex ${className}`}>
            <div className={leftArrowDivClassName} onClick={onPageMostLeftClick}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={leftArrowIconClassName}>
                    <path strokeLinecap="round" strokeLinejoin="round" color="none" strokeWidth={2} d="m18.75 4.5-7.5 7.5 7.5 7.5m-6-15L5.25 12l7.5 7.5" />
                </svg>
            </div>
            <div className={leftArrowDivClassName} onClick={onPageLeftClick}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={leftArrowIconClassName}>
                    <path strokeLinecap="round" strokeLinejoin="round" color="none" strokeWidth={2.5} d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
            </div>
            { pageNode }
            <div className={rightArrowDivClassName} onClick={onPageRightClick}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={rightArrowIconClassName}>
                    <path strokeLinecap="round" strokeLinejoin="round" color="none" strokeWidth={2.5} d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
            </div>
            <div className={rightArrowDivClassName} onClick={onPageMostRightClick}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={rightArrowIconClassName}>
                    <path strokeLinecap="round" strokeLinejoin="round" color="none" strokeWidth={2} d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
                </svg>
            </div>
        </div>
    );
}