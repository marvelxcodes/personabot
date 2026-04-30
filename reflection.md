# Reflection

This is a 300–500 word retrospective on building the Scaler Personabot — what worked, what GIGO actually taught me when I was writing the prompts, and what I'd improve next.

## What worked

The biggest unlock was **structuring the system prompt in a fixed seven-block anatomy** (Identity → Background → Values → Style → Topical Expertise → CoT → Output → Constraints → Few-shots → Final-reminder). When I started, I wrote the first prompt as one long paragraph and the model produced replies that were stylistically inconsistent — Kshitij would suddenly speak like a textbook, then like a podcast guest. Once I split each prompt into the same predictable scaffold, replies became dramatically more on-character. The scaffold isn't decoration; it's a structural commitment that the model can attend to in pieces.

The second unlock was **specifying tone as a percentage**. "Use Hinglish" produced jagged, broken sentences. "60% English / 40% Hindi" produced replies that actually sound like the way Kshitij teaches in class. The number doesn't have to be empirically precise — it just has to be *specific enough* that the model has a measurable target to aim at.

The third unlock was **writing one few-shot example per persona that explicitly handles a "lazy" or "off-topic" prompt**. Without that, the model's default people-pleasing makes every persona answer everything. With it, Kshitij pushes back on a "give me the code" question, Anshuman redirects a non-substantive question, and Abhimanyu declines a stock-picking ask gracefully — the way the real people would.

## What GIGO taught me

The temptation when writing personas was to invent specific facts to make the prompt feel rich — "Anshuman left Facebook in 2014 after a $X bonus", "Kshitij teaches the Tuesday DSA cohort". I tried this on a draft. The model started hallucinating *more* specifics, weaving them into replies in ways that contradicted itself two messages later. Fabricated input, fabricated output — exactly the GIGO failure the assignment warned about. I rewrote the backgrounds at a deliberately lower specificity ("engineering background, several years in industry"), and the model's confidence in its own claims dropped to a healthy level. **Vagueness in the prompt where I wasn't certain produced *more* truthful, more in-character output than fake precision did.**

The same lesson applied to the CoT instruction. My first version was a 12-step internal reasoning pipeline. The model's outputs got slower, more rigid, and weirdly meta — as if it were over-rehearsing. Cutting CoT down to five focused steps and adding *"DO NOT print these steps"* twice produced the cleanest improvement: the model reasoned but stayed conversational.

## What I'd improve

Three things, in priority order:

1. **A small evaluator harness.** Right now my QA is "vibes". A 30-prompt golden set per persona, scored on tone, length, ending-question presence, and constraint violations, would let me iterate on prompts with feedback instead of intuition.
2. **Per-persona generation parameters** — Kshitij hotter, Anshuman cooler — instead of one shared temperature.
3. **Retrieval-grounded few-shots** drawn from real attributed quotes rather than synthesized examples, for genuine voice-fidelity. That's the version this becomes if it's not just an assignment.
