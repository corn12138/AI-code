'use client';

interface LoadMoreButtonProps {
    onClick: () => void;
}

export default function LoadMoreButton({ onClick }: LoadMoreButtonProps) {
    return (
        <div className="mt-10 text-center">
            <button className="btn-outline" onClick={onClick}>
                加载更多
            </button>
        </div>
    );
}
