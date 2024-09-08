import { MouseEventHandler } from "react";
import { Skeleton } from "../skeleton";

export interface MangaCardProps {
    path?: string;
    title?: string;
    onClick?: MouseEventHandler<HTMLDivElement>;
}

export const LoadingSkeleton = () => (
    <>
      <div className="relative w-48 h-48 p-2 m-3">
        <div className="w-full h-full">
          <div className="absolute w-full h-12 left-0 bottom-0 z-30 flex items-center">
            <div className="grow">
              <Skeleton className="w-[56px] max-w-full" />
            </div>
          </div>
        </div>
      </div>
    </>
  );

export default function MangaCard({ path, title, onClick }: MangaCardProps) {
    return (
        <div className='relative w-48 h-48 p-2 m-3 rounded-xl bg-slate-50 ring-4'>
            <div
                className='w-full h-full bg-contain bg-center bg-no-repeat cursor-pointer'
                style={{ backgroundImage: `url(/api/mangas/images/${path})` }}
                onClick={onClick}
            />
            {
                title ? (
                    <div className='absolute w-full h-12 left-0 bottom-0 z-30 bg-black bg-opacity-50 flex items-center text-slate-50 text-xs'>
                        <div className='grow text-center'>{title}</div>
                    </div>
                ) : null
            }
        </div>
    );
}