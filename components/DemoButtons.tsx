"use client";

interface DemoButtonsProps {
  demoBank: string;
  demoBank2: string;
  demoDelivery: string;
  demoLegit: string;
}

export default function DemoButtons({ demoBank, demoBank2, demoDelivery, demoLegit }: DemoButtonsProps) {
  const setDemo = (text: string) => {
    if (typeof document !== 'undefined') {
      const ta = document.getElementById('content-input') as HTMLTextAreaElement | null;
      const rb = document.querySelector('input[value="message"]') as HTMLInputElement | null;
      if (ta) ta.value = text;
      if (rb) rb.checked = true;
    }
  };

  return (
    <div className="pt-6 mt-6 border-t border-zinc-800">
      <p className="text-sm text-zinc-400 mb-3 uppercase tracking-wider">Demo Scenarios:</p>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setDemo(demoBank)} type="button" className="text-sm bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded transition">Demo: Bank Phishing</button>
        <button onClick={() => setDemo(demoBank2)} type="button" className="text-sm bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded transition">Demo: Bank Phishing (Variant)</button>
        <button onClick={() => setDemo(demoDelivery)} type="button" className="text-sm bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded transition">Demo: Delivery Scam</button>
        <button onClick={() => setDemo(demoLegit)} type="button" className="text-sm bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded transition">Demo: Legitimate Message</button>
      </div>
    </div>
  );
}