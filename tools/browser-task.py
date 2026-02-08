#!/usr/bin/env python3
"""
browser-task.py — Execute a browser task using browser-use.

Usage:
  # Browser Use's own LLM (fastest, cheapest — DEFAULT):
  BROWSER_USE_API_KEY="..." python3 browser-task.py "task description"

  # With OpenAI:
  OPENAI_API_KEY="..." python3 browser-task.py --openai "task description"

  # Connected to OpenClaw browser (shared, has logged-in sessions):
  python3 browser-task.py --cdp "task description"

  # Persistent profile (keeps cookies/sessions between runs):
  python3 browser-task.py --persist "task description"

Modes:
  --cdp     → connect to OpenClaw browser (existing logins)
  --persist → own browser profile per agent (keeps cookies)
  --openai  → use OpenAI instead of Browser Use LLM
  --bu      → explicitly use Browser Use LLM (default)
  (default) → headless browser + Browser Use LLM
"""
import sys
import os
import asyncio
import json

async def run_task(task: str, use_cdp: bool = False, persist: bool = False, use_openai: bool = False):
    from browser_use import Agent, BrowserProfile

    # Choose LLM
    if use_openai:
        from browser_use import ChatOpenAI
        llm = ChatOpenAI(
            model="gpt-5-mini",
            api_key=os.environ.get("OPENAI_API_KEY"),
        )
    else:
        from browser_use import ChatBrowserUse
        llm = ChatBrowserUse(model="bu-2-0")

    profile_kwargs = {}

    if use_cdp:
        import urllib.request
        version_info = json.loads(urllib.request.urlopen("http://127.0.0.1:18800/json/version").read())
        profile_kwargs["cdp_url"] = version_info["webSocketDebuggerUrl"]
        profile_kwargs["keep_alive"] = True
    elif persist:
        workspace = os.environ.get("OPENCLAW_WORKSPACE", os.getcwd())
        agent_name = os.path.basename(workspace).replace("workspace-", "").replace("workspace", "main")
        profile_dir = os.path.expanduser(f"~/.openclaw/browser-profiles/{agent_name}")
        os.makedirs(profile_dir, exist_ok=True)
        profile_kwargs["user_data_dir"] = profile_dir
        profile_kwargs["headless"] = True
        profile_kwargs["args"] = ["--disable-blink-features=AutomationControlled", "--no-sandbox"]
    else:
        profile_kwargs["headless"] = True
        profile_kwargs["args"] = ["--disable-blink-features=AutomationControlled", "--no-sandbox"]

    profile = BrowserProfile(**profile_kwargs)

    agent = Agent(
        task=task,
        llm=llm,
        browser_profile=profile,
        max_actions_per_step=5,
    )

    result = await agent.run(max_steps=50)

    final = result.final_result() if hasattr(result, 'final_result') and callable(result.final_result) else str(result)
    is_done = result.is_done() if hasattr(result, 'is_done') and callable(result.is_done) else False

    print(json.dumps({
        "success": is_done,
        "result": final,
    }))

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 browser-task.py [--cdp|--persist|--openai|--bu] '<task>'")
        sys.exit(1)

    use_cdp = "--cdp" in sys.argv
    persist = "--persist" in sys.argv
    use_openai = "--openai" in sys.argv
    task = [a for a in sys.argv[1:] if not a.startswith("--")]

    if not task:
        print("No task provided")
        sys.exit(1)

    asyncio.run(run_task(task[0], use_cdp=use_cdp, persist=persist, use_openai=use_openai))
