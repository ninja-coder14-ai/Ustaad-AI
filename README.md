# Ustaad AI - Agentic Service Booking System

## Overview
Ustaad AI is an agentic service booking system for Pakistan's informal economy. Users can request services in Urdu, Roman Urdu, or English and the system automatically matches providers, generates quotes, and simulates bookings.

## Architecture
- Frontend: Next.js (React)
- Backend: Next.js API Routes
- AI Agent: Google Gemini 2.0 Flash via @google/generative-ai
- Orchestration: Google Antigravity
- Database: Mock JSON provider dataset

## How Antigravity Is Used
Google Antigravity orchestrates the multi-step agent workflow:
1. Intent extraction from multilingual input
2. Provider matching and ranking
3. Price calculation
4. Booking simulation
5. Dispute handling

## Agent Workflow
User Input → Intent Extraction → Provider Matching → Price Quote → Booking Confirmation → Follow-up

## Matching Factors
1. Service type match
2. Location/area coverage
3. Provider rating
4. On-time score
5. Cancellation rate
6. Availability status

## Supported Services
AC Repair, Plumbing, Electrician, Maid, Carpenter, Painter

## Supported Locations
G-13, G-11, G-10, F-8, F-7, F-10, E-11, I-8, DHA Islamabad

## Multilingual Support
- English
- Roman Urdu
- Urdu
- Mixed/Code-switched

## Edge Cases Handled
- No provider available in requested area
- Low confidence/unclear input
- Booking confirmation flow
- Dispute and refund handling

## APIs Used
- Google Gemini API (gemini-2.0-flash-001)
- Google Antigravity

## Assumptions
- Provider dataset is mock/simulated
- Booking confirmation is simulated
- SMS/WhatsApp notifications are simulated

## Limitations
- Real-time provider availability not implemented
- Payment processing is simulated
- Maps integration uses mock coordinates

## Privacy
No real personal data is used. All provider data is synthetic.