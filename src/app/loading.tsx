export default function Loading() {
  return (
    <main
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black"
      role="status"
      aria-label="Loading content"
    >
      <div className="text-center space-y-6 animate-in fade-in duration-500">
        <div className="relative mx-auto w-16 h-16">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-600 dark:border-t-blue-400 animate-spin" />
        </div>
        <div className="space-y-2">
          <p className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            Loading...
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Preparing your workspace
          </p>
        </div>
      </div>
    </main>
  );
}
