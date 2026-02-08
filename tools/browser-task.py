#!/usr/bin/env python3
"""
browser-task.py — Execute a browser task using browser-use.
Usage: python3 /Users/davidkim/.openclaw/workspace/tools/browser-task.py "Go to https://example.com and fill in the signup form"

Founder agents call this to automate browser flows (Google Ads, signups, outreach, etc.)
Set OPENAI_API_KEY env var or it reads from stdin.
"""
import sys
import os
import asyncio
import json

async def run_task(task: str):
    from browser_use import Agent, BrowserProfile, ChatOpenAI

    llm = ChatOpenAI(
        model="gpt-5-mini",
        api_key=os.environ.get("OPENAI_API_KEY"),
    )

    profile = BrowserProfile(headless=True)

    agent = Agent(
        task=task,
        llm=llm,
        browser_profile=profile,
        max_actions_per_step=5,
    )

    result = await agent.run(max_steps=50)

    # Extract final result
    final = result.final_result() if hasattr(result, 'final_result') and callable(result.final_result) else str(result)
    is_done = result.is_done() if hasattr(result, 'is_done') and callable(result.is_done) else False

    print(json.dumps({
        "success": is_done,
        "result": final,
    }))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 browser-task.py '<task description>'")
        sys.exit(1)

    task = sys.argv[1]
    asyncio.run(run_task(task))
