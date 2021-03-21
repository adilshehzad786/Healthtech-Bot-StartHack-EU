from sys import exit
import time

class Name:
    async def on_turn(self, context):
        # Check to see if this activity is an incoming message.
        # (It could theoretically be another type of activity.)
        if context.activity.type == "message" and context.activity.text:
            # Check to see if the user sent a simple "quit" message.
            if context.activity.text.lower() == "quit":
                # Send a reply.
                await context.send_activity("Bye!")
                exit(0)
            else:
                # Echo the message text back to the user.
                await context.send_activity(f"Nice to Meet You {context.activity.text}")

class Gender:
    async def on_turn(self, context):

        if context.activity.type == "message" and context.activity.text:
            
            print("What is your Gender")

                      
            
            

      

            