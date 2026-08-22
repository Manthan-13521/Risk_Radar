export const dynamic = 'force-dynamic';
import { getDb } from '@/lib/mongodb';
import { getPatternStats } from '@/lib/dna';
import Link from 'next/link';

export default async function Home() {
  const db = await getDb();
  const recentScans = await db.collection('scans').find({}).sort({ createdAt: -1 }).limit(5).toArray();
  const stats = await getPatternStats();

  const demoBank = "URGENT: Your bank account will be suspended within 2 hours. Complete KYC verification immediately at https://secure-bank-verification.example/";
  const demoDelivery = "Your package could not be delivered. Pay a ₹49 redelivery fee immediately using the link below.";
  const demoLegit = "Hi, the team meeting has been moved to 4 PM today. Please join using the usual calendar invite.";
  const demoBank2 = "FINAL WARNING: Verify your HDFC banking account today or access may be disabled. Complete identity verification immediately.";

  // Calculate file counts
  const fileScansCount = await db.collection('scans').countDocuments({ inputType: 'file' });

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">
      <div className="max-w-4xl mx-auto space-y-10 mt-10">
        
        <div className="text-center space-y-3">
          <h1 className="text-5xl font-bold tracking-tight">Your Digital Immune System</h1>
          <p className="text-zinc-400 text-xl">Investigate suspicious links, messages, and files before they become problems.</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded text-center">
            <div className="text-2xl font-bold">{stats.totalScans}</div>
            <div className="text-xs text-zinc-500 uppercase mt-1">Investigations</div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded text-center">
            <div className="text-2xl font-bold text-red-400">{stats.threatsFound}</div>
            <div className="text-xs text-zinc-500 uppercase mt-1">Threats Found</div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded text-center">
            <div className="text-2xl font-bold text-blue-400">{stats.distinctPatterns}</div>
            <div className="text-xs text-zinc-500 uppercase mt-1">Patterns</div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded text-center">
            <div className="text-2xl font-bold text-green-400">{fileScansCount}</div>
            <div className="text-xs text-zinc-500 uppercase mt-1">Files Investigated</div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl shadow-2xl">
           <h2 className="text-2xl font-semibold mb-6">Investigate Something</h2>
           <form action="/investigate/new" method="POST" encType="multipart/form-data" className="space-y-6">
             <div className="flex gap-4 mb-4">
               <label className="flex items-center gap-2 cursor-pointer">
                 <input type="radio" name="type" value="message" defaultChecked className="form-radio text-blue-600 focus:ring-blue-500 bg-zinc-800 border-zinc-700" />
                 <span>Message/URL</span>
               </label>
               <label className="flex items-center gap-2 cursor-pointer">
                 <input type="radio" name="type" value="file" className="form-radio text-blue-600 focus:ring-blue-500 bg-zinc-800 border-zinc-700" />
                 <span>File Upload</span>
               </label>
             </div>
             
             <textarea 
               id="content-input"
               name="content"
               className="w-full bg-zinc-950 border border-zinc-700 rounded-md p-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
               rows={5} 
               placeholder="Paste email, SMS, URL, or message content here..."
             ></textarea>
             
             <div className="p-4 border-2 border-dashed border-zinc-700 rounded-md bg-zinc-950 flex flex-col items-center justify-center">
               <input type="file" name="file" className="text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-900 file:text-blue-200 hover:file:bg-blue-800 cursor-pointer" />
               <p className="text-xs text-zinc-500 mt-2">Max limit: 10MB. Safely inspects PDF, DOCX, TXT, CSV and metadata of executables.</p>
             </div>
             
             <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-md transition shadow-lg shadow-blue-900/20">
               Investigate
             </button>
           </form>
           
           <div className="pt-6 mt-6 border-t border-zinc-800">
             <p className="text-sm text-zinc-400 mb-3 uppercase tracking-wider">Demo Scenarios:</p>
             <div className="flex flex-wrap gap-2">
                <button onClick={() => {if (typeof document !== 'undefined') { (document.getElementById('content-input') as HTMLTextAreaElement).value = demoBank; (document.querySelector('input[value="message"]') as HTMLInputElement).checked = true; }}} type="button" className="text-sm bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded transition">Demo: Bank Phishing</button>
                <button onClick={() => {if (typeof document !== 'undefined') { (document.getElementById('content-input') as HTMLTextAreaElement).value = demoBank2; (document.querySelector('input[value="message"]') as HTMLInputElement).checked = true; }}} type="button" className="text-sm bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded transition">Demo: Bank Phishing (Variant)</button>
                <button onClick={() => {if (typeof document !== 'undefined') { (document.getElementById('content-input') as HTMLTextAreaElement).value = demoDelivery; (document.querySelector('input[value="message"]') as HTMLInputElement).checked = true; }}} type="button" className="text-sm bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded transition">Demo: Delivery Scam</button>
                <button onClick={() => {if (typeof document !== 'undefined') { (document.getElementById('content-input') as HTMLTextAreaElement).value = demoLegit; (document.querySelector('input[value="message"]') as HTMLInputElement).checked = true; }}} type="button" className="text-sm bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded transition">Demo: Legitimate Message</button>
             </div>
           </div>
        </div>

        <div className="space-y-4">
           <div className="flex justify-between items-center">
             <h2 className="text-xl font-semibold">Recent Activity</h2>
             <Link href="/history" className="text-sm text-blue-400 hover:underline">View All</Link>
           </div>
           
           {recentScans.length === 0 ? (
              <div className="text-center p-8 bg-zinc-900/50 rounded border border-zinc-800 text-zinc-500">
                 No investigations yet.
              </div>
           ) : (
              <div className="grid gap-3">
                 {recentScans.map(scan => (
                    <Link href={`/investigate/${scan._id}`} key={scan._id.toString()} className="flex justify-between items-center bg-zinc-900 hover:bg-zinc-800 p-4 rounded border border-zinc-800 transition">
                       <div>
                          <div className="font-semibold capitalize flex items-center gap-2">
                             {scan.inputType}
                             <span className={`text-xs px-2 py-0.5 rounded ${scan.classification === 'safe' ? 'bg-green-900 text-green-300' : scan.classification === 'suspicious' ? 'bg-yellow-900 text-yellow-300' : 'bg-red-900 text-red-300'}`}>
                               {scan.classification.toUpperCase()}
                             </span>
                          </div>
                          <div className="text-sm text-zinc-400 truncate max-w-md mt-1">{scan.inputType === 'file' ? scan.inputMetadata?.filename : scan.inputMetadata?.truncatedContent}</div>
                       </div>
                       <div className="text-right">
                          <div className="text-xl font-bold text-zinc-300">{scan.riskScore}</div>
                          <div className="text-xs text-zinc-500">Risk</div>
                       </div>
                    </Link>
                 ))}
              </div>
           )}
        </div>
      </div>
    </div>
  );
}