import { Spinner } from "@/components/ui/spinner";

export default function Loading() {
  return (
    <div className="flex h-screen w-screen bg-white items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <Spinner className="h-8 w-8" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
