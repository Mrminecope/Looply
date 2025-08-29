# Final Clean LIA Code (core intelligence + UI/UX)
# All unrelated Looply modules, extra assets, and unused scripts removed.

import sys
import json
import random
import time

class LIA:
    def __init__(self, name="LIA"):
        self.name = name
        self.memory = {}
        self.intelligence_level = 5  # scalable AI level

    def learn(self, key, value):
        self.memory[key] = value
        return f"Learned {key}."

    def recall(self, key):
        return self.memory.get(key, "I don't remember that yet.")

    def chat(self, user_input):
        user_input = user_input.lower()
        if "hello" in user_input:
            return "Hello! I'm LIA, your assistant."
        elif "time" in user_input:
            return f"Current time is {time.strftime('%H:%M:%S')}"
        elif "joke" in user_input:
            jokes = [
                "Why don't programmers like nature? Too many bugs.",
                "AI told me a secret, but I forgot the password.",
                "Why did the computer go to the doctor? It caught a virus."
            ]
            return random.choice(jokes)
        else:
            return "I'm still learning. Can you rephrase?"

    def upgrade_intelligence(self):
        self.intelligence_level += 1
        return f"Intelligence upgraded to {self.intelligence_level}."

# Simple UI
if __name__ == "__main__":
    lia = LIA()
    print("LIA is ready. Type 'exit' to quit.")
    while True:
        user_in = input("You: ")
        if user_in.lower() == "exit":
            print("Goodbye!")
            break
        response = lia.chat(user_in)
        print(f"LIA: {response}")