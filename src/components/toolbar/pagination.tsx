export interface PaginationProps {
    className?: string;
    currentPage: number;
    maxPage: number;
    pages?: number[];
}

export default function Pagination({ className = '', currentPage, maxPage, pages = [] }: PaginationProps) {
    const color = 'text-slate-500';
    const hoverColor = 'text-slate-700';
    return (
        <div className={`flex ${className}`}>
            <div className="cursor-pointer hover:bg-slate-200 p-1 active:ring-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`size-6 ${color} hover:${hoverColor}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" color="none" strokeWidth={2} d="m18.75 4.5-7.5 7.5 7.5 7.5m-6-15L5.25 12l7.5 7.5" />
                </svg>
            </div>
            <div className="cursor-pointer hover:bg-slate-200 p-1 active:ring-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`size-6 ${color} hover:${hoverColor}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" color="none" strokeWidth={2.5} d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
            </div>
            <div className={`cursor-pointer hover:bg-slate-200 ${color} hover:${hoverColor} p-1 active:ring-1 select-none font-bold`}> { `${currentPage} / ${maxPage}` } </div>
            <div className="cursor-pointer hover:bg-slate-200 p-1 active:ring-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`size-6 ${color} hover:${hoverColor}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" color="none" strokeWidth={2.5} d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
            </div>
            <div className="cursor-pointer hover:bg-slate-200 p-1 active:ring-1">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={`size-6 ${color} hover:${hoverColor}`}>
                    <path strokeLinecap="round" strokeLinejoin="round" color="none" strokeWidth={2} d="m5.25 4.5 7.5 7.5-7.5 7.5m6-15 7.5 7.5-7.5 7.5" />
                </svg>
            </div>
        </div>
    );
}