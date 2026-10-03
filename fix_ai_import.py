import os

f = 'src/components/ui/Chatbot.tsx'
with open(f, 'r', encoding='utf-8') as file: c = file.read()

c = c.replace('import { useChat } from "ai/react"', 'import { useChat } from "@ai-sdk/react"')

with open(f, 'w', encoding='utf-8') as file: file.write(c)
