export interface SkeletonProps {
    className?: string;
}

export type SVGSkeletonProps = SkeletonProps;

export const Skeleton = ({ className }: SkeletonProps) => (
    <div aria-live="polite" aria-busy="true" className={className}>
        <span className="inline-flex w-full animate-pulse select-none rounded-md bg-gray-300 leading-none">
            ‌
        </span>
        <br />
    </div>
)

export const SVGSkeleton = ({ className }: SVGSkeletonProps) => (
    <svg
        className={
            className + " animate-pulse rounded bg-gray-300"
        }
    />
)