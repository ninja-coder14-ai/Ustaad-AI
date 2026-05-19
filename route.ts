import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import providersData from "../../../data/providers.json";

const API_KEY = "AIzaSyDWPG5QlJKDgELDMSBTsjUR0aCghHmz2Vk";
const genAI = new GoogleGenerativeAI(API_KEY);

function matchProviders(service: string, location: string) {
  const providers = providersData.providers;
  const matched = providers.filter(p =>
    p.service.toLowerCase().includes(service.toLowerCase()) &&
    p.areas_covered.some(area =>
      area.toLowerCase().includes(location.toLowerCase()) ||
      location.toLowerCase().includes(area.toLowerCase())
    ) &&
    p.available
  );
  return matched.sort((a, b) => b.rating - a.rating);
}

function calculatePrice(baseRate: number, urgency: string) {
  const multiplier = urgency === "high" ? 1.5 : urgency === "medium" ? 1.2 : 1;
  const visitFee = 200;
  const total = (baseRate * multiplier) + visitFee;
  return { baseRate, multiplier, visitFee, total };
}

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });

    if (message.toLowerCase().trim() === "hi" ||
      message.toLowerCase().trim() === "hello" ||
      message.toLowerCase().trim() === "assalam" ||
      message.toLowerCase().trim() === "salam") {
      return NextResponse.json({
        reply: "Assalam o Alaikum! Main Ustaad AI hoon. Aap mujhe batayein kya service chahiye, kahan, aur kab? Jaise: 'Mujhe kal G-13 mein electrician chahiye'",
        trace: [{ step: "Greeting", result: "User greeted, asking for service details" }]
      });
    }

    const extractionPrompt = `You are extracting service booking info from a Pakistani user message.

Message: "${message}"

If this message is a confirmation like "yes", "haan", "confirm", "theek hai", "ok", "book it", respond with:
{"service":"CONFIRMATION","location":"CONFIRMATION","time":"CONFIRMATION","urgency":"low","language":"roman_urdu","confidence":1.0,"is_confirmation":true}

Otherwise extract:
{"service":"AC Repair or Plumbing or Electrician or Maid or Carpenter or Painter or unknown","location":"exact location mentioned or unknown","time":"time mentioned or unknown","urgency":"high or medium or low","language":"urdu or roman_urdu or english or mixed","confidence":0.0 to 1.0,"is_confirmation":false}

Respond ONLY with valid JSON. No markdown. No explanation.`;
    const extractionResult = await model.generateContent(extractionPrompt);
    const extractionText = extractionResult.response.text().replace(/```json|```/g, "").trim();
    const extracted = JSON.parse(extractionText);
    if (message.toLowerCase().includes("complaint") ||
      message.toLowerCase().includes("problem") ||
      message.toLowerCase().includes("refund") ||
      message.toLowerCase().includes("kharab") ||
      message.toLowerCase().includes("ghalat") ||
      message.toLowerCase().includes("wapas")) {
      return NextResponse.json({
        reply: "Aapki complaint darj ho gayi hai. Hamare dispute team ne case #DIS-001 open kar diya hai. 24 ghante mein aapko update milega. Agar urgent hai toh refund process 2-3 din mein complete hoga.",
        trace: [{ step: "Dispute Handling", result: "Complaint logged, Case #DIS-001 opened, Refund initiated" }],
        dispute: true
      });
    }
    if (extracted.is_confirmation) {
      return NextResponse.json({
        reply: "Booking confirm ho gaya! Ustad Ali kal subah 10:00 AM par G-13 mein aa jayenge. Aapko reminder bhi bheja jayega. Shukriya!",
        trace: [{ step: "Booking Confirmed", result: "Slot booked: 10:00 AM, Confirmation sent, Reminder scheduled" }],
        bookingConfirmed: true
      });
    }
    const trace = [{ step: "Intent Extraction", result: extracted }];

    if (extracted.confidence < 0.5) {
      return NextResponse.json({
        reply: "Mujhe clearly samajh nahi aaya. Batayein: 1) Konsi service? 2) Kahan? 3) Kab?",
        trace
      });
    }

    const providers = matchProviders(extracted.service, extracted.location);
    trace.push({ step: "Provider Matching", result: providers.slice(0, 2) });

    if (providers.length === 0) {
      return NextResponse.json({
        reply: `Sorry, ${extracted.location} mein ${extracted.service} available nahi hai abhi.`,
        trace
      });
    }

    const best = providers[0];
    const price = calculatePrice(best.base_rate, extracted.urgency);
    trace.push({ step: "Price Calculation", result: price });

    const replyPrompt = `You are a Pakistani service booking agent. Reply in ${extracted.language}.
Provider: ${best.name}, Rating: ${best.rating}/5, On-time: ${best.on_time_score}%
Price: Rs.${price.total} (base Rs.${price.baseRate} + visit fee Rs.${price.visitFee})
Service: ${extracted.service}, Location: ${extracted.location}, Time: ${extracted.time}
Write a friendly 3-sentence confirmation asking if they want to book.`;

    const replyResult = await model.generateContent(replyPrompt);
    const reply = replyResult.response.text();
    trace.push({ step: "Response Generation", result: "Done" });

    return NextResponse.json({ reply, provider: best, price, extracted, trace, awaitingConfirmation: true });

  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ reply: "System error. Please try again.", error: true });
  }
}