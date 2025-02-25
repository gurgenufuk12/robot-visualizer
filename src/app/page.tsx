"use client";
import URDFViewer from "@/components/URDFViewer";

export default function Home() {
  return (
    <main className="flex flex-row items-center justify-center w-full h-screen bg-gray-800 text-white">
      <div className="w-1/2 bg-white h-full">
        <URDFViewer />
      </div>
      <div className="w-1/2 bg-black"></div>
    </main>
  );
}
