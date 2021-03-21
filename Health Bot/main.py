# Copyright (c) Microsoft Corporation. All rights reserved.
# Licensed under the MIT License.

import asyncio

from adapter import ConsoleAdapter
from bot import Name
from bot import Gender

# Create adapter
ADAPTER = ConsoleAdapter()
BOT = Name()
BOT= Gender()
LOOP = asyncio.get_event_loop()

if __name__ == "__main__":
    try:
        # Greet user
        print("Hi... I'm a Health Bot (Still in Development State) ")
        print("What is your Name?")

        LOOP.run_until_complete(ADAPTER.process_activity(BOT.on_turn))
       
    except KeyboardInterrupt:
        pass
    finally:
        LOOP.stop()
        LOOP.close()
