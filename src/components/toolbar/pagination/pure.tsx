'use client';

import React from "react";

export interface PurePaginationProps {
    className?: string;
    currentPage: number;
    setCurrentPage: (p: number) => void;
    maxPage: number;
    pages?: number[];
}

function calcNumberLen(value: number): number {
    let r = 0;
    do {
        value /= 10;
        ++r;
        if (value < 1) {
            break;
        }
    } while (true);
    return r;
}

export default function PurePagination({ className = '', currentPage, setCurrentPage, maxPage, pages = [] }: PurePaginationProps) {
    const color = 'text-slate-500';
    const hoverColor = 'text-slate-700';
    const [inputing, setInputing] = React.useState<boolean>(false);
    const [inputPage, setInputPage] = React.useState<string>(`${currentPage}`);
    const inputWidth = `${1 + calcNumberLen(maxPage)}rem`;
    const onPageClick: React.MouseEventHandler<HTMLDivElement> = React.useCallback(() => {
        setInputing(true);
    }, [setInputing]);
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
    let pageNode: React.ReactNode;
    if (inputing) {
        pageNode = (
            <div className="p-1">
                <input
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
            <div className={`cursor-pointer hover:bg-slate-200 ${color} hover:${hoverColor} p-1 active:ring-1 select-none font-bold`} onClick={onPageClick}> { `${currentPage} / ${maxPage}` } </div>
        );
    }
    return (
        <div className={`flex ${className}`}>
            <div className="cursor-pointer hover:bg-slate-200 p-1 active:ring-1" onClick={onPageMostLeftClick}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`size-6 ${color} hover:${hoverColor}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" color="none" strokeWidth={2} d="m18.75 4.5-7.5 7.5 7.5 7.5m-6-15L5.25 12l7.5 7.5" />
                </svg>
            </div>
            <div className="cursor-pointer hover:bg-slate-200 p-1 active:ring-1" onClick={onPageLeftClick}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`size-6 ${color} hover:${hoverColor}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" color="none" strokeWidth={2.5} d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
            </div>
            { pageNode }
            <div className="cursor-pointer hover:bg-slate-200 p-1 active:ring-1" onClick={onPageRightClick}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`size-6 ${color} hover:${hoverColor}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" color="none" strokeWidth={2.5} d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
            </div>
            <div className="cursor-pointer hover:bg-slate-200 p-1 active:ring-1" onClick={onPageMostRightClick}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`size-6 ${color} hover:${hoverColor}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" color="none" strokeWidth={2} d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
                </svg>
            </div>
        </div>
    );
}