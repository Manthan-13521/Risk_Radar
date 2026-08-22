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
    <div className="pt-6 mt-6 border-t" style={{ borderColor: '#D5C8C5' }}>
      <p className="text-[10px] uppercase font-bold tracking-widest mb-3" style={{ color: '#6F6664' }}>Demo Scenarios:</p>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setDemo(demoBank)} type="button" className="text-xs px-3.5 py-2 rounded-xl font-bold border transition hover:bg-white/40" style={{ background: '#FCF6F5', borderColor: '#D5C8C5', color: '#111111' }}>Demo: Bank Phishing</button>
        <button onClick={() => setDemo(demoBank2)} type="button" className="text-xs px-3.5 py-2 rounded-xl font-bold border transition hover:bg-white/40" style={{ background: '#FCF6F5', borderColor: '#D5C8C5', color: '#111111' }}>Demo: Bank Phishing (Variant)</button>
        <button onClick={() => setDemo(demoDelivery)} type="button" className="text-xs px-3.5 py-2 rounded-xl font-bold border transition hover:bg-white/40" style={{ background: '#FCF6F5', borderColor: '#D5C8C5', color: '#111111' }}>Demo: Delivery Scam</button>
        <button onClick={() => setDemo(demoLegit)} type="button" className="text-xs px-3.5 py-2 rounded-xl font-bold border transition hover:bg-white/40" style={{ background: '#FCF6F5', borderColor: '#D5C8C5', color: '#111111' }}>Demo: Legitimate Message</button>
      </div>
    </div>
  );
}