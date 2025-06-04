export default function Loading() {
  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-t-4 border-b-4 border-primary-600 animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-10 w-10 rounded-full bg-white dark:bg-gray-900"></div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-6 w-6 rounded-full border-t-4 border-b-4 border-primary-400 animate-spin"></div>
        </div>
      </div>
    </div>
  );
}
